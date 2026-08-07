import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../style/Register.css"; // External stylesheet

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/register`,
        { name, email, password }
      );
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-wrapper">
      <div className="register-card p-4 p-sm-5 text-white">
        
        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="fw-black text-uppercase tracking-wide m-0">
            CREATE <span className="text-neon-accent">ACCOUNT</span>
          </h2>
          <p className="text-secondary small mt-1">
            Join us to start managing your profile
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-danger bg-danger bg-opacity-25 text-danger border-0 rounded-4 mb-4 text-center fw-semibold small">
            {error}
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label-custom">
              Full Name
            </label>
            <input
              type="text"
              className="form-control form-control-custom"
              id="name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="email" className="form-label-custom">
              Email Address
            </label>
            <input
              type="email"
              className="form-control form-control-custom"
              id="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="form-label-custom">
              Password
            </label>
            <input
              type="password"
              className="form-control form-control-custom"
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="btn btn-neon-submit w-100 text-uppercase"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center mt-4 pt-3 border-top border-secondary border-opacity-25">
          <p className="small text-secondary m-0">
            Already have an account?{" "}
            <Link to="/login" className="link-neon">
              Sign In
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Register;