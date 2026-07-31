import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaUserCircle } from 'react-icons/fa'
function Navbar() {
 const userName = localStorage.getItem('name'); 
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    navigate('/login');
  }
  return (
    <nav className='navbar navbar-expand-lg navbar-dark bg-dark'>
      <div className="container">
        <Link className='navbar-brand' to='/dashboard'>
          Fitness Tracker
        </Link>
        <button className='navbar-toggler' type='button'
          data-bs-toggle='collapse' data-bs-target='#navbarNav'>
          <span className='navbar-toggler-icon'></span>
        </button>

        {/* Links */}
        <div className='collapse navbar-collapse' id='navbarNav'>
          <ul className='navbar-nav me-auto'>
            <li className='nav-item'>
              <Link className='nav-link' to='/dashboard'>Dashboard</Link>
            </li>
            <li className='nav-item'>
              <Link className='nav-link' to='/workout'>Workout</Link>
            </li>
            <li className='nav-item'>
              <Link className='nav-link' to='/diet'>Diet</Link>
            </li>
            <li className='nav-item'>
              <Link className='nav-link' to='/bmi'>BMI</Link>
            </li>
            <li className='nav-item'>
              <Link className='nav-link' to='/foodstore'>Food Store</Link>
            </li>
            <li className='nav-item'>
              <Link className='nav-link' to='/orders'>Orders</Link>
            </li>
          </ul>

          {/* ✅ Profile Dropdown — Logout button ki jagah */}
          <ul className='navbar-nav'>
            <li className='nav-item dropdown'>
            <a
              
                className='nav-link dropdown-toggle d-flex align-items-center'
                href='#'
                role='button'
                data-bs-toggle='dropdown'
                aria-expanded='false'
              >
                <FaUserCircle size={20} className='me-1' />
                
               {userName || 'Profile'}
              </a>
              <ul className='dropdown-menu dropdown-menu-end'>
                <li>
                  <Link className='dropdown-item' to='/profile'>View Profile</Link>
                </li>
                <li><hr className='dropdown-divider' /></li>
                <li>
                  <button className='dropdown-item text-danger' onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar