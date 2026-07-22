import React from 'react'
import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className='container mt-5 text-center'>
      <h2>404</h2>
      <p className='text-muted'>Page not found.</p>
      <Link to='/dashboard' className='btn btn-primary'>Back to Dashboard</Link>
    </div>
  )
}

export default NotFound