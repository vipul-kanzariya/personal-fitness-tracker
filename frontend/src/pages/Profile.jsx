import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";
import "../style/Profile.css";
import { useTheme } from "../context/ThemeContext";

function Profile() {
  const [user, setUser] = useState({});
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        setLoading(true);
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/auth/profile`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUser(res.data);
        setName(res.data.name || "");
        setAge(res.data.age || "");
        setWeight(res.data.weight || "");
        setHeight(res.data.height || "");
      } catch (err) {
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/auth/profile`,
        { name, age, weight, height },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(res.data);
      setSuccess("Profile updated successfully!");
      setError("");
    } catch (err) {
      setError("Failed to update profile.");
      setSuccess("");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/auth/change-password`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("Password changed successfully!");
      setError("");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setError(err.response?.data || "Failed to change password.");
      setSuccess("");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    navigate("/login");
  };

  return (
    <div className="container py-4">
      {/* Page Header with Theme Toggle Switch */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 className="fw-black text-uppercase tracking-wide page-title m-0">
            USER <span style={{ color: "var(--accent)" }}>PROFILE</span>
          </h2>
          <p className="small mb-0" style={{ color: "var(--text-muted)" }}>
            Manage your fitness parameters & account settings.
          </p>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="btn btn-outline-secondary d-flex align-items-center gap-2 px-3 py-2"
          style={{
            borderRadius: "10px",
            borderColor: "var(--border-color)",
            color: "var(--text-primary)",
            backgroundColor: "var(--bg-card)",
          }}
        >
          <span>{theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}</span>
        </button>
      </div>

      {error && (
        <div className="alert alert-danger bg-danger bg-opacity-25 text-danger border-0 rounded-4 mb-4 text-center fw-semibold">
          {error}
        </div>
      )}
      {success && (
        <div className="alert alert-success bg-success bg-opacity-25 text-success border-0 rounded-4 mb-4 text-center fw-semibold">
          {success}
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <Spinner />
        </div>
      ) : (
        <div className="row justify-content-center g-4">
          {/* User Identity Header Card */}
          <div className="col-lg-10">
            <div className="card profile-card p-4 d-flex flex-row flex-wrap align-items-center justify-content-between gap-3">
              <div className="d-flex align-items-center gap-3">
                <div className="avatar-box">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div>
                  <h4 className="fw-bold m-0" style={{ color: "var(--text-primary)" }}>
                    {user.name || "User Name"}
                  </h4>
                  <span className="small" style={{ color: "var(--text-muted)" }}>
                    {user.email || "user@example.com"}
                  </span>
                </div>
              </div>
              <div className="d-flex gap-3 text-center">
                <div
                  className="p-2 px-3 rounded-3 border"
                  style={{
                    backgroundColor: "var(--bg-dark)",
                    borderColor: "var(--border-color)",
                  }}
                >
                  <span className="extra-small d-block stat-label">
                    WEIGHT
                  </span>
                  <span className="fw-bold" style={{ color: "var(--accent)" }}>
                    {weight || "--"} kg
                  </span>
                </div>
                <div
                  className="p-2 px-3 rounded-3 border"
                  style={{
                    backgroundColor: "var(--bg-dark)",
                    borderColor: "var(--border-color)",
                  }}
                >
                  <span className="extra-small d-block stat-label">
                    HEIGHT
                  </span>
                  <span className="fw-bold" style={{ color: "var(--accent)" }}>
                    {height || "--"} cm
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Card 1 — Personal Info */}
          <div className="col-lg-5 col-md-6">
            <div className="card profile-card p-4 h-100 d-flex flex-column justify-content-between">
              <div>
                <h5
                  className="fw-bold mb-4 pb-2 border-bottom"
                  style={{
                    borderColor: "var(--border-color)",
                    color: "var(--text-primary)",
                  }}
                >
                  ⚙️ Personal Details
                </h5>
                <form id="profileForm" onSubmit={handleUpdateProfile}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label-custom d-block">
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-custom"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label-custom d-block">
                      Email Address (Read-only)
                    </label>
                    <input
                      type="email"
                      className="form-control form-control-custom"
                      id="email"
                      value={user.email || ""}
                      disabled
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-4">
                      <label htmlFor="age" className="form-label-custom d-block">
                        Age
                      </label>
                      <input
                        type="number"
                        min="0"
                        className="form-control form-control-custom"
                        id="age"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                      />
                    </div>
                    <div className="col-4">
                      <label htmlFor="weight" className="form-label-custom d-block">
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        className="form-control form-control-custom"
                        id="weight"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                      />
                    </div>
                    <div className="col-4">
                      <label htmlFor="height" className="form-label-custom d-block">
                        Height (cm)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        className="form-control form-control-custom"
                        id="height"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                      />
                    </div>
                  </div>
                </form>
              </div>

              <button
                type="submit"
                form="profileForm"
                className="btn btn-neon-submit w-100 text-uppercase mt-3"
              >
                Save Changes
              </button>
            </div>
          </div>

          {/* Form Card 2 — Security */}
          <div className="col-lg-5 col-md-6">
            <div className="card profile-card p-4 h-100 d-flex flex-column justify-content-between">
              <div>
                <h5
                  className="fw-bold mb-4 pb-2 border-bottom"
                  style={{
                    borderColor: "var(--border-color)",
                    color: "var(--text-primary)",
                  }}
                >
                  🔒 Security & Password
                </h5>
                <form id="passwordForm" onSubmit={handleChangePassword}>
                  <div className="mb-3">
                    <label htmlFor="currentPassword" className="form-label-custom d-block">
                      Current Password
                    </label>
                    <input
                      type="password"
                      className="form-control form-control-custom"
                      id="currentPassword"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="newPassword" className="form-label-custom d-block">
                      New Password
                    </label>
                    <input
                      type="password"
                      className="form-control form-control-custom"
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                </form>
              </div>

              <button
                type="submit"
                form="passwordForm"
                className="btn btn-neon-submit w-100 text-uppercase mt-3"
              >
                Update Password
              </button>
            </div>
          </div>

          {/* Logout Action Bar */}
          <div className="col-lg-10 text-center mt-4">
            <button
              onClick={handleLogout}
              className="btn btn-logout-custom px-4 py-2 text-uppercase fw-bold"
            >
              Logout Account
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;