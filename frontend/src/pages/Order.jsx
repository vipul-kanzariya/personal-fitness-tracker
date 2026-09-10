import React, { useEffect, useState } from "react";
import Spinner from "../components/Spinner";
import StatusBadge from "../components/StatusBadge";
import { useAuthFetch } from "../hooks/useAuthFetch";
import { formatCurrency, formatDate } from "../utils/formatters";
import "../style/Order.css";
import { toast } from "react-toastify";

function Order() {
  const [orders, setOrders] = useState([]);
  const { loading, error, execute } = useAuthFetch();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await execute({
        method: 'GET',
        url: '/api/orders',
      });
      setOrders(data);
    } catch (err) {
      toast.error("Failed to load orders.");
    }
  };

  const handleCancel = async (id) => {
    try {
      const data = await execute({
        method: 'PUT',
        url: `/api/orders/${id}/cancel`,
        data: {},
      });
      setOrders(orders.map((o) => (o._id === id ? data : o)));
      toast.success("Order cancelled successfully.");
    } catch (err) {
      toast.error(err.message || "Failed to cancel order.");
    }
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="text-center mb-5">
        <h2 className="fw-black text-uppercase tracking-wide apex-title">
          MY <span className="text-neon-green">ORDERS</span>
        </h2>
        <p className="text-visible-muted small fs-6">
          Track your past orders and view purchase history.
        </p>
      </div>

      {error && (
        <div className="alert alert-danger bg-danger bg-opacity-25 text-danger border-0 rounded-4 mb-4" role="alert">
          {error}
        </div>
      )}

      {loading && orders.length === 0 ? (
        <div className="text-center py-5">
          <Spinner />
        </div>
      ) : (
        <div className="row justify-content-center">
          <div className="col-lg-9">
            {orders.length === 0 ? (
              <div
                className="text-center py-5 border border-dashed rounded-4"
                style={{ borderColor: "var(--border-color)" }}
                role="status"
              >
                <p className="text-visible-muted mb-0">No order history found!</p>
              </div>
            ) : (
              orders.map((o) => (
                <article className="order-card p-4 mb-4" key={o._id}>
                  {/* Top Bar (Date + Status Tags) */}
                  <div
                    className="d-flex flex-wrap justify-content-between align-items-center gap-2 pb-3 mb-3 border-bottom"
                    style={{ borderColor: "var(--border-color)" }}
                  >
                    <div className="text-visible-muted small fs-6">
                      <span className="text-label me-1">ORDERED ON:</span>
                      <strong className="fw-bold">
                        {formatDate(o.createdAt, 'short')}
                      </strong>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      <StatusBadge
                        status={o.paymentStatus}
                        type="payment"
                      />
                      <StatusBadge
                        status={o.orderStatus}
                        type="order"
                      />
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="mb-4">
                    <div className="text-label extra-small mb-2 items-header-label">
                      ITEMS
                    </div>
                    {o.items && o.items.length > 0 ? (
                      o.items.map((item, i) => (
                        <div
                          className="item-row p-3 mb-2 d-flex justify-content-between align-items-center"
                          key={i}
                        >
                          <div className="d-flex align-items-center gap-2">
                            <span className="fw-bold fs-6">
                              {item.name}
                            </span>
                            <span className="qty-badge">x{item.quantity}</span>
                          </div>
                          <span className="fw-bold fs-6 text-neon-green">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-subtle">No items in this order.</p>
                    )}
                  </div>

                  {/* Order Footer Info */}
                  <div className="d-flex flex-wrap justify-content-between align-items-center pt-2">
                    <div>
                      <span className="text-label me-2 small">TOTAL PAY:</span>
                      <span className="fw-bold fs-4 text-neon-green">
                        {formatCurrency(o.totalAmount)}
                      </span>
                    </div>

                    {o.orderStatus !== "Delivered" &&
                      o.orderStatus !== "Cancelled" && (
                        <button
                          className="btn btn-cancel-custom px-3 py-2"
                          onClick={() => handleCancel(o._id)}
                          aria-label={`Cancel order ${o._id}`}
                        >
                          Cancel Order
                        </button>
                      )}
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Order;