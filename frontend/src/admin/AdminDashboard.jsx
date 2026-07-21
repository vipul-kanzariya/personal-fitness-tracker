import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Spinner from '../components/Spinner'

function AdminDashboard() {
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const token = localStorage.getItem('token');
        setLoading(true);
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/admin/summary`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSummary(res.data);
      } catch (err) {
        setError('Failed to load admin summary.');
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  return (
    <div className='container mt-4'>
      {error && <div className='alert alert-danger mt-3'>{error}</div>}
      {loading ? (
        <Spinner />
      ) : (
        <div className='row'>
          <div className='col-md-3 mb-3'>
            <div className='card p-3 shadow text-center'>
              <h6>👥 Total Users</h6>
              <h3>{summary.totalUsers}</h3>
            </div>
          </div>
          <div className='col-md-3 mb-3'>
            <div className='card p-3 shadow text-center'>
              <h6>📦 Total Orders</h6>
              <h3>{summary.totalOrders}</h3>
            </div>
          </div>
          <div className='col-md-3 mb-3'>
            <div className='card p-3 shadow text-center'>
              <h6>🥗 Food Items</h6>
              <h3>{summary.totalFoodItems}</h3>
            </div>
          </div>
          <div className='col-md-3 mb-3'>
            <div className='card p-3 shadow text-center'>
              <h6>💰 Total Revenue</h6>
              <h3>₹ {summary.totalRevenue}</h3>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard