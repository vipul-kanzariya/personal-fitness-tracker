import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useParams, useNavigate, Link } from 'react-router-dom';

function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      setLoading(true);
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/reset-password/${token}`,
        { newPassword }
      );
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data || 'Link expired or invalid.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card p-4 p-sm-5">
        
        {/* Header Icon & Branding */}
        <div className="text-center mb-4">
          <div className="auth-icon-wrapper mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle">
            <span className="fs-3">🔑</span>
          </div>
          <h2 className="fw-black text-uppercase tracking-wide m-0">
            Set New <span className="text-neon-accent">Password</span>
          </h2>
          <p className="text-subtle small mt-1">
            Choose a strong password with at least 6 characters.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="newPassword" className="form-label-custom">New Password</label>
            <input
              type="password"
              id="newPassword"
              className="form-control form-control-custom"
              placeholder="Min 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="confirmPassword" className="form-label-custom">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              className="form-control form-control-custom"
              placeholder="Repeat password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-neon-submit w-100 text-uppercase mb-3"
            disabled={loading}
          >
            {loading ? (
              <span>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Resetting...
              </span>
            ) : (
              'Reset Password'
            )}
          </button>

          <div className="text-center mt-3 pt-3 border-top border-secondary border-opacity-25">
            <Link to="/login" className="link-neon small">
              ← Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;