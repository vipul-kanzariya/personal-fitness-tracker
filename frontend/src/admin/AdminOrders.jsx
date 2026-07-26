import React, { useEffect, useState } from "react";
import axios from "axios";
import Spinner from "../components/Spinner";

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
    <div className="container mt-4">
      {error && <div className="alert alert-danger mt-3">{error}</div>}
      {loading ? <Spinner /> : (
        <table className="table table-bordered mt-3">
          <thead className="table-dark">
            <tr>
              <th>Order ID</th>
              <th>User</th>
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
                <td>{o._id}</td>
                <td>{o.userId?.name} <br/><small>{o.userId?.email}</small></td>
                <td>
                  {o.items.map((item, i) => (
                    <div key={i}>{item.name} x{item.quantity}</div>
                  ))}
                </td>
                <td>₹ {o.totalAmount}</td>
                <td>
                  <span className={`badge ${o.paymentStatus === 'Paid' ? 'bg-success' : 'bg-warning'}`}>
                    {o.paymentStatus}
                  </span>
                </td>
                <td>
                  <select
                    className="form-select form-select-sm"
                    value={o.orderStatus}
                    onChange={(e) => handleStatusChange(o._id, e.target.value)}
                  >
                    <option value="Processing">Processing</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
                <td>{new Date(o.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminOrders;