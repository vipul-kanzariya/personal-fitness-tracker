import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../style/Login.css"; // External stylesheet

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

 const handleSubmit = async(e) =>{
  e.preventDefault()
  try{
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {email, password});
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('role', res.data.role);
    localStorage.setItem('name', res.data.name);

    // ✅ Role check karke redirect karo
    if(res.data.role === 'admin'){
      navigate('/admin/dashboard');
    } else {
      navigate('/dashboard');
    }
  }catch(err){
    console.log(err.message);
  }
}

  return (
    <div className="login-wrapper">
      <div className="login-card p-4 p-sm-5 text-white">
        
        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="fw-black text-uppercase tracking-wide m-0">
            WELCOME <span className="text-neon-accent">BACK</span>
          </h2>
          <p className="text-secondary small mt-1">
            Sign in to access your dashboard
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-danger bg-danger bg-opacity-25 text-danger border-0 rounded-4 mb-4 text-center fw-semibold small">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
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
            />
          </div>

          <button
            type="submit"
            className="btn btn-neon-submit w-100 text-uppercase"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Login"}
          </button>
        </form>

      </div>
    </div>
  );
}

export default Login;