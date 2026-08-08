import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import '../style/AdminNavbar.css';

function AdminNavbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    navigate('/login');
  };

  return (
    <aside className="admin-sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <Link to="/admin/dashboard" className="brand-link">
          <span className="brand-text">ADMIN</span>
          <span className="brand-accent">PANEL</span>
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/admin/users"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          Users
        </NavLink>

        <NavLink
          to="/admin/orders"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          Orders
        </NavLink>

        <NavLink
          to="/admin/foodstore"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          Food Store
        </NavLink>

        <NavLink
          to="/admin/workouttypes"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          Workout Types
        </NavLink>
      </nav>

      {/* Logout Action */}
      <div className="sidebar-footer">
        <button className="btn-admin-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </aside>
  );
}

export default AdminNavbar;