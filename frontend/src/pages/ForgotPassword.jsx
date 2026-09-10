import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { FiCheckCircle, FiLock } from 'react-icons/fi';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    try {
      setLoading(true);
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, { email });
      setSent(true);
      toast.success('Reset link sent! Check your email.');
    } catch (err) {
      toast.error('Something went wrong. Try again.');
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
            <FiLock className="fs-3" aria-hidden="true" />
          </div>
          <h2 className="fw-black text-uppercase tracking-wide m-0">
            Forgot <span className="text-neon-accent">Password</span>
          </h2>
          <p className="text-subtle small mt-1">
            Enter your email and we'll send you a link to reset your password.
          </p>
        </div>

        {sent ? (
          <div className="alert alert-success bg-success bg-opacity-25 text-success border-0 rounded-4 p-3 text-center">
            <p className="mb-2 fw-medium"><FiCheckCircle aria-hidden="true" /> Reset link sent! Check your inbox.</p>
            <Link to="/login" className="link-neon fw-semibold">
              ← Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="form-label-custom">Email Address</label>
              <input
                type="email"
                id="email"
                className="form-control form-control-custom"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                  Sending...
                </span>
              ) : (
                'Send Reset Link'
              )}
            </button>

            <div className="text-center mt-3 pt-3 border-top border-secondary border-opacity-25">
              <Link to="/login" className="link-neon small">
                ← Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;