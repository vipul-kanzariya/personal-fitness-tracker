import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Navbar() {
    const navigate = useNavigate();
    const handleLogout = () => {
  localStorage.removeItem('token');
  navigate('/login');
    }
  return (
    <nav className='navbar navbar-expand-lg navbar-dark bg-dark'>
        <div className="container">
            <Link className='navbar-brand' to='/dashboard'>
            Fitness Tracker</Link>
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

          {/* Logout */}
          <button className='btn btn-outline-danger' 
            onClick={handleLogout}>
            Logout
          </button>
        </div>
        </div>
    </nav>
  )
}

export default Navbar