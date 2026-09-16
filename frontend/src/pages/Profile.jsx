import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";
import NumberInput from "../components/NumberInput";
import { useAuthFetch } from "../hooks/useAuthFetch";
import { useTheme } from "../context/ThemeContext";
import { FiLogOut, FiLock, FiMoon, FiSettings, FiSun } from "react-icons/fi";
import { clearAuthData } from "../utils/api";
import "../style/Profile.css";
import { toast } from "react-toastify";

function Profile() {
  const [user, setUser] = useState({});
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [passwordError, setPasswordError] = useState("");

  const { loading, error, execute, setError } = useAuthFetch();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await execute({
        method: 'GET',
        url: '/api/auth/profile',
      });
      setUser(data);
      setName(data.name || "");
      setAge(data.age || "");
      setWeight(data.weight || "");
      setHeight(data.height || "");
    } catch (err) {
      toast.error("Failed to load profile.");
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const data = await execute({
        method: 'PUT',
        url: '/api/auth/profile',
        data: { name, age, weight, height },
      });
      setUser(data);
      setError("");
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error("Failed to update profile.");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");

    // Validation
    if (!currentPassword) {
      setPasswordError("Please enter your current password.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    try {
      await execute({
        method: 'PUT',
        url: '/api/auth/change-password',
        data: { currentPassword, newPassword },
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordError("");
      toast.success("Password changed successfully!");
    } catch (err) {
      const msg = err.message || "Failed to change password.";
      setPasswordError(msg);
      toast.error(msg);
    }
  };

  const handleLogout = () => {
    clearAuthData();
    toast.success("Logged out successfully!");
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
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          <span>{theme === "dark" ? <><FiSun aria-hidden="true" /> Light Mode</> : <><FiMoon aria-hidden="true" /> Dark Mode</>}</span>
        </button>
      </div>

      {error && (
        <div className="alert alert-danger bg-danger bg-opacity-25 text-danger border-0 rounded-4 mb-4 text-center fw-semibold" role="alert">
          {error}
        </div>
      )}

      {loading && !user.email ? (
        <div className="text-center py-5">
          <Spinner />
        </div>
      ) : (
        <div className="row justify-content-center g-4">
          {/* User Identity Header Card */}
          <div className="col-lg-10">
            <div className="card profile-card p-4 d-flex flex-row flex-wrap align-items-center justify-content-between gap-3">
              <div className="d-flex align-items-center gap-3">
                <div className="avatar-box" aria-label="User avatar">
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
                  <FiSettings aria-hidden="true" /> Personal Details
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
                      aria-required="true"
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
                      aria-readonly="true"
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <NumberInput
                      name="age"
                      label="Age"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      min={0}
                      max={150}
                      className="col-4 mb-0"
                    />

                    <NumberInput
                      name="weight"
                      label="Weight (kg)"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      min={0}
                      className="col-4 mb-0"
                    />

                    <NumberInput
                      name="height"
                      label="Height (cm)"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      min={0}
                      className="col-4 mb-0"
                    />
                  </div>
                </form>
              </div>

              <button
                type="submit"
                form="profileForm"
                className="btn btn-neon-submit w-100 text-uppercase mt-3"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
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
                  <FiLock aria-hidden="true" /> Security & Password
                </h5>

                {passwordError && (
                  <div className="alert alert-danger alert-sm mb-3" role="alert">
                    {passwordError}
                  </div>
                )}

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
                      aria-required="true"
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
                      aria-required="true"
                    />
                    <small className="form-text text-subtle">Minimum 6 characters</small>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label-custom d-block">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      className="form-control form-control-custom"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      aria-required="true"
                    />
                  </div>
                </form>
              </div>

              <button
                type="submit"
                form="passwordForm"
                className="btn btn-neon-submit w-100 text-uppercase mt-3"
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </div>

          {/* Logout Action Bar */}
          <div className="col-lg-10 text-center mt-4">
            <button
              onClick={handleLogout}
              className="btn btn-logout-custom"
              aria-label="Logout from account"
            >
              <FiLogOut aria-hidden="true" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;