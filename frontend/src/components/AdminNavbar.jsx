import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import "../style/AdminNavbar.css";
import { useTheme } from "../context/ThemeContext";

function AdminNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    navigate("/login");
  };

  const closeMenu = () => setMobileOpen(false);

  return (
    <>
      {/* Mobile Top Header */}
      <div className="mobile-header">
        <Link to="/admin/dashboard" className="sidebar-brand" onClick={closeMenu}>
          <div className="sidebar-logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <span>ADMIN PANEL</span>
        </Link>

        <button
          className="mobile-toggle-btn"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle Admin Navigation"
        >
          {mobileOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </div>

      {mobileOpen && <div className="mobile-backdrop" onClick={closeMenu} />}

      {/* Sidebar Navigation */}
      <aside className={`admin-sidebar ${mobileOpen ? "show" : ""} ${isCollapsed ? "collapsed" : ""}`}>
        <div>
          <div className="sidebar-header">
            <Link to="/admin/dashboard" className="sidebar-brand" onClick={closeMenu}>
              <div className="sidebar-logo-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <span>ADMIN PANEL</span>
            </Link>

            <button
              className="desktop-toggle-btn"
              onClick={() => setIsCollapsed((prev) => !prev)}
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              aria-label="Toggle collapse sidebar"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {isCollapsed ? (
                  <>
                    <polyline points="13 17 18 12 13 7" />
                    <polyline points="6 17 11 12 6 7" />
                  </>
                ) : (
                  <>
                    <polyline points="11 17 6 12 11 7" />
                    <polyline points="18 17 13 12 18 7" />
                  </>
                )}
              </svg>
            </button>
          </div>

          <ul className="nav">
            <li>
              <NavLink
                to="/admin/dashboard"
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                onClick={closeMenu}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
                <span>Dashboard</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/admin/users"
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                onClick={closeMenu}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span>Users</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/admin/orders"
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                onClick={closeMenu}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
                <span>Orders</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/admin/foodstore"
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                onClick={closeMenu}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                <span>Food Store</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/admin/workouttypes"
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                onClick={closeMenu}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                <span>Workout Types</span>
              </NavLink>
            </li>
          </ul>
        </div>

        <div className="sidebar-footer">
          <button className="btn-theme-toggle" onClick={toggleTheme} title="Toggle Dark/Light Theme">
            {theme === "dark" ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
            <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
          </button>

          <button className="btn-logout" onClick={handleLogout} title="Logout">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default AdminNavbar;