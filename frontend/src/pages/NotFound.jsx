import React from 'react';
import { Link } from 'react-router-dom';
import '../style/NotFound.css';

function NotFound() {
  const role = localStorage.getItem('role');
  const redirectPath = role === 'admin' ? '/admin/dashboard' : '/dashboard';

  return (
    <div className="notfound-wrapper">
      <div className="notfound-card p-4 p-sm-5 text-center text-white">
        <div className="error-code mb-2">404</div>

        <h3 className="fw-black text-uppercase tracking-wide mb-2">
          PAGE NOT <span style={{ color: '#ccff00' }}>FOUND</span>
        </h3>

        <p className="text-subtle-bright small mb-4">
          The page you are looking for doesn't exist, was removed, or is temporarily unavailable.
        </p>

        <div>
          <Link to={redirectPath} className="btn btn-neon-action text-uppercase">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;