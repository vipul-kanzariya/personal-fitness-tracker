import { useEffect, useState } from 'react';
import axios from 'axios';
import Spinner from '../components/Spinner';
import '../style/Admin.css';
import { FiPackage, FiUsers } from 'react-icons/fi';
import { GiMeal } from 'react-icons/gi';

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
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
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
    <div className="container py-4">
      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-black text-uppercase tracking-wide m-0">
          ADMIN <span className="text-neon-accent">DASHBOARD</span>
        </h2>

        <p className="text-subtle small mt-1">
          Overview of platform performance and metrics.
        </p>
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
        <div className="row g-3">

          {/* Total Users */}
          <div className="col-md-3 col-sm-6">
            <div className="admin-stat-card p-4 text-center">
              <div className="stat-icon">
                <FiUsers aria-hidden="true" />
              </div>

              <span className="form-label-custom d-block">
                Total Users
              </span>

              <h2 className="fw-bold m-0">
                {summary.totalUsers || 0}
              </h2>
            </div>
          </div>

          {/* Total Orders */}
          <div className="col-md-3 col-sm-6">
            <div className="admin-stat-card p-4 text-center">
              <div className="stat-icon">
                <FiPackage aria-hidden="true" />
              </div>

              <span className="form-label-custom d-block">
                Total Orders
              </span>

              <h2 className="fw-bold m-0">
                {summary.totalOrders || 0}
              </h2>
            </div>
          </div>

          {/* Food Items */}
          <div className="col-md-3 col-sm-6">
            <div className="admin-stat-card p-4 text-center">
              <div className="stat-icon">
                <GiMeal aria-hidden="true" />
              </div>

              <span className="form-label-custom d-block">
                Food Items
              </span>

              <h2 className="fw-bold m-0">
                {summary.totalFoodItems || 0}
              </h2>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="col-md-3 col-sm-6">
            <div className="admin-stat-card p-4 text-center">
              <div className="stat-icon">
                <span
                  aria-hidden="true"
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                  }}
                >
                  ₹
                </span>
              </div>

              <span className="form-label-custom d-block">
                Total Revenue
              </span>

              <h2 className="fw-bold m-0 text-neon-accent">
                ₹ {summary.totalRevenue || 0}
              </h2>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

export default AdminDashboard;

