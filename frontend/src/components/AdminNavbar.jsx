import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

function AdminNavbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  }

  return (
    <nav className='navbar navbar-expand-lg navbar-dark bg-dark px-3'>
      <Link className='navbar-brand fw-bold' to='/admin/dashboard'>
        Admin Panel
      </Link>

      <button className='navbar-toggler' type='button'
        data-bs-toggle='collapse' data-bs-target='#adminNavbar'>
        <span className='navbar-toggler-icon'></span>
      </button>

      <div className='collapse navbar-collapse' id='adminNavbar'>
        <ul className='navbar-nav ms-auto'>
          <li className='nav-item'>
            <Link className='nav-link' to='/admin/dashboard'>Dashboard</Link>
          </li>
          <li className='nav-item'>
            <Link className='nav-link' to='/admin/users'>Users</Link>
          </li>
          <li className='nav-item'>
            <Link className='nav-link' to='/admin/orders'>Orders</Link>
          </li>
          <li className='nav-item'>
            <Link className='nav-link' to='/admin/foodstore'>Food Store</Link>
          </li>
          <li className='nav-item'>
            <Link className='nav-link' to='/admin/workouttypes'>Workout Types</Link>
          </li>
          <li className='nav-item'>
            <button className='btn btn-danger ms-3' onClick={handleLogout}>
              Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default AdminNavbar