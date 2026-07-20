import React, { useEffect, useState } from "react";
import axios from "axios";
import Spinner from "../components/Spinner";

function Order() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,setError] = useState();
  
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem("token");
        setLoading(true);
        const order = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/orders`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setOrders(order.data);
      } catch (err) {
        setError('Failed to load orders.')
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, []);
  return (
    <>
    {error && (
  <div className='alert alert-danger mt-3'>
     {error}
  </div>
)}
    <div className="container mt-4">
      {loading ? (
        <Spinner />
      ) : (
        <>
          <h4>📦 My Orders</h4>
          {orders.length === 0 ? (
            <p>No orders yet!</p>
          ) : (
            orders.map((o) => (
              <div className="card p-3 mb-3" key={o._id}>
                <div className="d-flex justify-content-between">
                  <h6>Order ID: {o._id}</h6>
                  <span
                    className={`badge ${o.paymentStatus === "Paid" ? "bg-success" : "bg-warning"}`}
                  >
                    {o.paymentStatus}
                  </span>
                </div>
                <table className="table table-sm mt-2">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Qty</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {o.items.map((item, i) => (
                      <tr key={i}>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>₹ {item.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="d-flex justify-content-between">
                  <span>
                    Total: <strong>₹ {o.totalAmount}</strong>
                  </span>
                  <span>
                    Status: <strong>{o.orderStatus}</strong>
                  </span>
                  <span>
                    Date: {new Date(o.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </>
      )}
    </div>
    </>
  );
}

export default Order;
