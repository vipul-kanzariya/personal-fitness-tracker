import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import ErrorBoundary from './components/ErrorBoundary'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './pages/Dashboard'
import Workout from './pages/Workout'
import Diet from './pages/Diet'
import Bmi from './pages/Bmi'
import FoodStore from './pages/FoodStore'
import Navbar from './components/Navbar'
import Order from './pages/Order'
import PrivateRoute from './components/PrivateRoute'
import AdminPrivateRoute from './components/AdminPrivateRoute'
import AdminNavbar from './components/AdminNavbar'
import AdminDashboard from './admin/AdminDashboard'
import AdminUsers from './admin/AdminUsers'
import AdminOrders from './admin/AdminOrders'
import AdminFoodStore from './admin/AdminFoodStore'
import AdminWorkoutTypes from './admin/AdminWorkoutTypes'
import NotFound from './pages/NotFound'
import Profile from './pages/Profile'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Home from './pages/Home'

function Layout() {
  const location = useLocation();
  const hideNavbar = ['/', '/login', '/register', '/forgot-password'].includes(location.pathname)
    || location.pathname.startsWith('/reset-password');
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className={`app-layout ${isAdmin ? 'admin-layout-wrapper' : ''}`}>
      {!hideNavbar && (isAdmin ? <AdminNavbar /> : <Navbar />)}

      <main
        className={`main-content ${hideNavbar ? 'full-width' : ''} ${isAdmin ? 'admin-main-content' : ''}`}
      >
        <ErrorBoundary>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route path='/forgot-password' element={<ForgotPassword />} />
            <Route path='/reset-password/:token' element={<ResetPassword />} />

            {/* Admin Protected Routes */}
            <Route element={<AdminPrivateRoute />}>
              <Route path='/admin/dashboard' element={
                <ErrorBoundary>
                  <AdminDashboard />
                </ErrorBoundary>
              } />
              <Route path='/admin/users' element={
                <ErrorBoundary>
                  <AdminUsers />
                </ErrorBoundary>
              } />
              <Route path='/admin/orders' element={
                <ErrorBoundary>
                  <AdminOrders />
                </ErrorBoundary>
              } />
              <Route path='/admin/foodstore' element={
                <ErrorBoundary>
                  <AdminFoodStore />
                </ErrorBoundary>
              } />
              <Route path='/admin/workouttypes' element={
                <ErrorBoundary>
                  <AdminWorkoutTypes />
                </ErrorBoundary>
              } />
            </Route>

            {/* User Protected Routes */}
            <Route element={<PrivateRoute />}>
              <Route path='/dashboard' element={
                <ErrorBoundary>
                  <Dashboard />
                </ErrorBoundary>
              } />
              <Route path='/workout' element={
                <ErrorBoundary>
                  <Workout />
                </ErrorBoundary>
              } />
              <Route path='/diet' element={
                <ErrorBoundary>
                  <Diet />
                </ErrorBoundary>
              } />
              <Route path='/bmi' element={
                <ErrorBoundary>
                  <Bmi />
                </ErrorBoundary>
              } />
              <Route path='/foodstore' element={
                <ErrorBoundary>
                  <FoodStore />
                </ErrorBoundary>
              } />
              <Route path='/orders' element={
                <ErrorBoundary>
                  <Order />
                </ErrorBoundary>
              } />
              <Route path='/profile' element={
                <ErrorBoundary>
                  <Profile />
                </ErrorBoundary>
              } />
            </Route>

            <Route path='*' element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </main>

      {/* Toast Container for global notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  )
}

export default App