import React, { useEffect, useState } from "react";
import axios from "axios";
import Spinner from "../components/Spinner";
import "../style/Order.css"; // External stylesheet

function Order() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem("token");
        setLoading(true);
        const order = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/orders`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setOrders(order.data);
      } catch (err) {
        setError("Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, []);

  const handleCancel = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/orders/${id}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders(orders.map((o) => (o._id === id ? res.data : o)));
      setError("");
    } catch (err) {
      setError(err.response?.data || "Failed to cancel order.");
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "badge-delivered";
      case "cancelled":
        return "badge-cancelled";
      case "processing":
      case "pending":
        return "badge-pending";
      default:
        return "badge-default";
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
        <div className="alert alert-danger bg-danger bg-opacity-25 text-danger border-0 rounded-4 mb-4">
          {error}
        </div>
      )}

      {loading ? (
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
              >
                <p className="text-visible-muted mb-0">No order history found!</p>
              </div>
            ) : (
              orders.map((o) => (
                <div className="order-card p-4 mb-4" key={o._id}>
                  {/* Top Bar (Date + Status Tags) */}
                  <div
                    className="d-flex flex-wrap justify-content-between align-items-center gap-2 pb-3 mb-3 border-bottom"
                    style={{ borderColor: "var(--border-color)" }}
                  >
                    <div className="text-visible-muted small fs-6">
                      <span className="text-label me-1">ORDERED ON:</span>
                      <strong className="fw-bold">
                        {new Date(o.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </strong>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      <span
                        className={`payment-tag ${
                          o.paymentStatus === "Paid"
                            ? "bg-success bg-opacity-25 text-success"
                            : "bg-warning bg-opacity-25 text-warning"
                        }`}
                      >
                        💳 {o.paymentStatus}
                      </span>
                      <span
                        className={`status-badge ${getStatusBadge(
                          o.orderStatus
                        )}`}
                      >
                        ● {o.orderStatus}
                      </span>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="mb-4">
                    <div className="text-label extra-small mb-2 items-header-label">
                      ITEMS
                    </div>
                    {o.items.map((item, i) => (
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
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer Info */}
                  <div className="d-flex flex-wrap justify-content-between align-items-center pt-2">
                    <div>
                      <span className="text-label me-2 small">TOTAL PAY:</span>
                      <span className="fw-bold fs-4 text-neon-green">
                        ₹{o.totalAmount}
                      </span>
                    </div>

                    {o.orderStatus !== "Delivered" &&
                      o.orderStatus !== "Cancelled" && (
                        <button
                          className="btn btn-cancel-custom px-3 py-2"
                          onClick={() => handleCancel(o._id)}
                        >
                          Cancel Order
                        </button>
                      )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Order;