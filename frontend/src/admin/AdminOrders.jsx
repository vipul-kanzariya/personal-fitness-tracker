import React, { useEffect, useState } from "react";
import axios from "axios";
import Spinner from "../components/Spinner";
import "../style/Admin.css";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/orders`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders(res.data);
    } catch (err) {
      setError("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/orders/${id}/status`,
        { orderStatus: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders(orders.map(o => o._id === id ? res.data : o));
      setError('');
    } catch (err) {
      setError("Failed to update order status.");
    }
  };

  return (
    <div className="container py-4 text-white">
      <div className="mb-4">
        <h2 className="fw-black text-uppercase tracking-wide m-0">
          ORDER <span className="text-neon-accent">MANAGEMENT</span>
        </h2>
        <p className="text-secondary small mt-1">Review user orders and update fulfillments.</p>
      </div>

      {error && (
        <div className="alert alert-danger bg-danger bg-opacity-25 text-danger border-0 rounded-4 mb-4 text-center fw-semibold">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <Spinner />
        </div>
      ) : (
        <div className="admin-table-container">
          <div className="table-responsive">
            <table className="table admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id}>
                    <td className="small font-monospace text-secondary">#{o._id.slice(-6)}</td>
                    <td>
                      <div className="fw-semibold">{o.userId?.name || 'Guest'}</div>
                      <div className="text-secondary extra-small">{o.userId?.email}</div>
                    </td>
                    <td>
                      {o.items.map((item, i) => (
                        <div key={i} className="small">
                          {item.name} <span className="text-neon-accent">x{item.quantity}</span>
                        </div>
                      ))}
                    </td>
                    <td className="fw-bold text-neon-accent">₹ {o.totalAmount}</td>
                    <td>
                      <span className={o.paymentStatus === 'Paid' ? 'badge-neon-success' : 'badge-neon-warning'}>
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <select
                        className="form-select form-select-custom form-select-sm"
                        value={o.orderStatus}
                        onChange={(e) => handleStatusChange(o._id, e.target.value)}
                      >
                        <option value="Processing">Processing</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="small text-secondary">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOrders;