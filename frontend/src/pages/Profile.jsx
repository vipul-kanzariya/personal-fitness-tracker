import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        setLoading(true);
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/auth/profile`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUser(res.data);
        // ✅ form fields ko fetched data se prefill karo
        setName(res.data.name);
        setAge(res.data.age || '');
        setWeight(res.data.weight || '');
        setHeight(res.data.height || '');
      } catch(err) {
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
   try {
    const token = localStorage.getItem('token');
    const res = await axios.put(
      `${import.meta.env.VITE_API_URL}/api/auth/profile`,
      { name, age, weight, height },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setUser(res.data);
    setSuccess('Profile updated successfully!');
    setError('');
  } catch(err) {
    setError('Failed to update profile.');
    setSuccess('');
  }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
    const token = localStorage.getItem('token');
    await axios.put(
      `${import.meta.env.VITE_API_URL}/api/auth/change-password`,
      { currentPassword, newPassword },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setSuccess('Password changed successfully!');
    setError('');
    setCurrentPassword('');  // ✅ reset karo submit ke baad
    setNewPassword('');
  } catch(err) {
    setError(err.response?.data || 'Failed to change password.');
    setSuccess('');
  }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

 return (
  <div className="container mt-4">
    {error && <div className="alert alert-danger mt-3">{error}</div>}
    {success && <div className="alert alert-success mt-3">{success}</div>}

    {loading ? (
      <Spinner />
    ) : (
      <div className="row g-4">

        {/* Card 1 — Profile Info */}
        <div className="col-md-6">
          <div className="card p-4">
            <h5 className="section-title mb-3">Profile Information</h5>
            <form onSubmit={handleUpdateProfile}>
              <label htmlFor="name">Name</label>
              <input
                type="text"
                className="form-control mb-3"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <label htmlFor="email">Email</label>
              <input
                type="email"
                className="form-control mb-3"
                id="email"
                value={user.email || ''}
                disabled
              />

              <label htmlFor="age">Age</label>
              <input
                type="number" min="0"
                className="form-control mb-3"
                id="age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />

              <label htmlFor="weight">Weight (kg)</label>
              <input
                type="number" min="0" step="0.1"
                className="form-control mb-3"
                id="weight"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />

              <label htmlFor="height">Height (cm)</label>
              <input
                type="number" min="0" step="0.1"
                className="form-control mb-3"
                id="height"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />

              <button type="submit" className="btn btn-primary w-100">
                Save Changes
              </button>
            </form>
          </div>
        </div>

        {/* Card 2 — Change Password */}
        <div className="col-md-6">
          <div className="card p-4">
            <h5 className="section-title mb-3">Change Password</h5>
            <form onSubmit={handleChangePassword}>
              <label htmlFor="currentPassword">Current Password</label>
              <input
                type="password"
                className="form-control mb-3"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />

              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                className="form-control mb-3"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />

              <button type="submit" className="btn btn-primary w-100">
                Change Password
              </button>
            </form>
          </div>
        </div>

        {/* Logout */}
        <div className="col-12 text-center mt-4">
          <button className="btn btn-outline-danger" onClick={handleLogout}>
            Logout
          </button>
        </div>

      </div>
    )}
  </div>
);
}

export default Profile;