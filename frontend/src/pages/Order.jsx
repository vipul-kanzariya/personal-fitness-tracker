import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Spinner from "../components/Spinner";
import StatusBadge from "../components/StatusBadge";
import { useAuthFetch } from "../hooks/useAuthFetch";
import { API_BASE_URL, getAuthConfig } from "../utils/api";
import { formatCurrency, formatDate } from "../utils/formatters";
import "../style/Order.css";
import { toast } from "react-toastify";
import { FiCheckCircle, FiPackage, FiShield } from "react-icons/fi";

function Order() {
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [ordering, setOrdering] = useState(false);
  const { loading, error, execute } = useAuthFetch();

  const cartTotal = useMemo(
    () => cart.reduce((total, item) => total + item.price * item.quantity, 0),
    [cart],
  );
  const cartCount = useMemo(
    () => cart.reduce((total, item) => total + item.quantity, 0),
    [cart],
  );

  const saveCart = (updatedCart) => {
    setCart(updatedCart);
    localStorage.setItem("foodCart", JSON.stringify(updatedCart));
  };

  const fetchOrders = async () => {
    try {
      const data = await execute({
        method: "GET",
        url: "/api/orders",
      });
      setOrders(data);
    } catch {
      toast.error("Failed to load orders.");
    }
  };

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("foodCart") || "[]");
    setCart(savedCart);
    fetchOrders();
  }, []);

  const updateQuantity = (id, change) => {
    const updatedCart = cart
      .map((item) =>
        item._id === id
          ? { ...item, quantity: Math.max(0, item.quantity + change) }
          : item,
      )
      .filter((item) => item.quantity > 0);
    saveCart(updatedCart);
  };

  const removeItem = (id) => {
    saveCart(cart.filter((item) => item._id !== id));
  };

  const handleCheckout = async () => {
    if (!cart.length) {
      toast.warning("Your cart is empty.");
      return;
    }

    try {
      setOrdering(true);
      const paymentOrder = await axios.post(
        `${API_BASE_URL}/api/orders/payment/order`,
        {
          items: cart.map((item) => ({
            foodId: item._id,
            quantity: item.quantity,
          })),
        },
        getAuthConfig(),
      );

      if (!window.Razorpay) {
        throw new Error("Razorpay checkout is unavailable");
      }

      const checkout = new window.Razorpay({
        key: paymentOrder.data.keyId,
        amount: paymentOrder.data.amount,
        currency: paymentOrder.data.currency,
        name: "FitTrack",
        description: `${cartCount} nutrition item${cartCount > 1 ? "s" : ""}`,
        order_id: paymentOrder.data.razorpayOrderId,
        handler: async (response) => {
          try {
            await axios.post(
              `${API_BASE_URL}/api/orders/payment/verify`,
              {
                orderId: paymentOrder.data.orderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              },
              getAuthConfig(),
            );
            saveCart([]);
            toast.success("Payment successful and order placed!");
            await fetchOrders();
          } catch (err) {
            toast.error(err.response?.data || "Payment verification failed.");
          } finally {
            setOrdering(false);
          }
        },
        modal: {
          ondismiss: () => {
            toast.info("Payment cancelled.");
            setOrdering(false);
          },
        },
        theme: { color: "#a3e635" },
      });

      checkout.on("payment.failed", (response) => {
        toast.error(response.error?.description || "Payment failed.");
        setOrdering(false);
      });
      checkout.open();
    } catch (err) {
      toast.error(err.response?.data || err.message || "Failed to start payment.");
      setOrdering(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      const data = await execute({
        method: "PUT",
        url: `/api/orders/${id}/cancel`,
        data: {},
      });
      setOrders((currentOrders) =>
        currentOrders.map((order) => (order._id === id ? data : order)),
      );
      toast.success("Order cancelled successfully.");
    } catch (err) {
      toast.error(err.message || "Failed to cancel order.");
    }
  };

  return (
    <div className="orders-page container py-4">
      <header className="orders-hero mb-4">
        <div>
          <span className="orders-eyebrow">Nutrition & wellness</span>
          <h1 className="fw-black text-uppercase tracking-wide apex-title mb-2">
            MY <span className="text-neon-green">ORDERS</span>
          </h1>
          <p className="text-visible-muted mb-0">
            Review your basket, pay securely, and track every meal in one place.
          </p>
        </div>
        <div className="orders-hero-stat">
          <strong>{orders.length}</strong>
          <span>orders placed</span>
        </div>
      </header>

      {cart.length > 0 && (
        <section className="checkout-panel mb-5" aria-labelledby="checkout-heading">
          <div className="checkout-panel-heading">
            <div>
              <span className="orders-eyebrow">Ready when you are</span>
              <h2 id="checkout-heading">Complete your order</h2>
              <p>{cartCount} item{cartCount > 1 ? "s" : ""} in your cart</p>
            </div>
            <div className="checkout-total">
              <span>Total</span>
              <strong>{formatCurrency(cartTotal)}</strong>
            </div>
          </div>

          <div className="checkout-items">
            {cart.map((item) => (
              <div className="checkout-item" key={item._id}>
                <img src={item.image || "https://placehold.co/96x96"} alt="" />
                <div className="checkout-item-details">
                  <h3>{item.name}</h3>
                  <span>{formatCurrency(item.price)} each</span>
                </div>
                <div className="quantity-control" aria-label={`Quantity for ${item.name}`}>
                  <button type="button" onClick={() => updateQuantity(item._id, -1)} aria-label={`Remove one ${item.name}`}>−</button>
                  <strong>{item.quantity}</strong>
                  <button type="button" onClick={() => updateQuantity(item._id, 1)} aria-label={`Add one ${item.name}`}>+</button>
                </div>
                <strong className="checkout-item-total">{formatCurrency(item.price * item.quantity)}</strong>
                <button type="button" className="remove-item-btn" onClick={() => removeItem(item._id)} aria-label={`Remove ${item.name}`}>
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="checkout-footer">
            <span className="secure-payment-note"><FiShield aria-hidden="true" /> Secure payment powered by Razorpay</span>
            <button className="btn btn-neon checkout-button" onClick={handleCheckout} disabled={ordering}>
              {ordering ? "Opening secure checkout..." : "Proceed to secure payment"}
            </button>
          </div>
        </section>
      )}

      {error && (
        <div className="alert alert-danger bg-danger bg-opacity-25 text-danger border-0 rounded-4 mb-4" role="alert">
          {error}
        </div>
      )}

      <div className="orders-section-heading">
        <div>
          <span className="orders-eyebrow">Your journey</span>
          <h2>Order history</h2>
        </div>
        <span className="orders-count">{orders.length} total</span>
      </div>

      {loading && orders.length === 0 ? (
        <div className="text-center py-5"><Spinner /></div>
      ) : orders.length === 0 ? (
        <div className="empty-orders">
          <FiPackage className="empty-orders-icon" aria-hidden="true" />
          <h3>No orders yet</h3>
          <p className="text-visible-muted mb-0">Your completed purchases will appear here.</p>
        </div>
      ) : (
        <div className="order-history-list">
          {orders.map((order) => (
            <article className="order-card" key={order._id}>
              <div className="order-card-header">
                <div>
                  <span className="text-label">ORDER PLACED</span>
                  <strong>{formatDate(order.createdAt, "short")}</strong>
                </div>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <StatusBadge status={order.paymentStatus} type="payment" />
                  <StatusBadge status={order.orderStatus} type="order" />
                </div>
              </div>

              <div className="order-card-items">
                {order.items?.map((item, index) => (
                  <div className="history-item" key={`${order._id}-${index}`}>
                    <div>
                      <strong>{item.name}</strong>
                      <span>Qty {item.quantity} · {formatCurrency(item.price)} each</span>
                    </div>
                    <strong>{formatCurrency(item.price * item.quantity)}</strong>
                  </div>
                ))}
              </div>

              <div className="order-card-footer">
                <div>
                  <span className="text-label">TOTAL PAID</span>
                  <strong className="order-total">{formatCurrency(order.totalAmount)}</strong>
                </div>
                {order.orderStatus !== "Delivered" && order.orderStatus !== "Cancelled" && (
                  <button className="btn btn-cancel-custom px-3 py-2" onClick={() => handleCancel(order._id)}>
                    Cancel order
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default Order;
