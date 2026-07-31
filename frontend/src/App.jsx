import { useState } from 'react'
import {BrowserRouter,Routes,Route, useLocation } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
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
import AdminDashboard from './admin/AdminDashboard';
import AdminUsers from './admin/AdminUsers';
import AdminOrders from './admin/AdminOrders';
import AdminFoodStore from './admin/AdminFoodStore';
import AdminWorkoutTypes from './admin/AdminWorkoutTypes';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile'
function Layout() {
  const location = useLocation();
  const hideNavbar = ['/login', '/register'].includes(location.pathname);
   const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
     {!hideNavbar && (isAdminRoute ? <AdminNavbar /> : <Navbar />)}
      <Routes>
        <Route path='/login' element={<Login/>}/>
        <Route path='/register' element={<Register/>}/>

        <Route element={<AdminPrivateRoute/>}>
          <Route path='/admin/dashboard' element={<AdminDashboard/>}/>
          <Route path='/admin/users' element={<AdminUsers/>}/>
          <Route path='/admin/orders' element={<AdminOrders/>}/>
          <Route path='/admin/foodstore' element={<AdminFoodStore/>}/>
          <Route path='/admin/workouttypes' element={<AdminWorkoutTypes/>}/>
        </Route>

        <Route element={<PrivateRoute/>}>
          <Route path='/' element={<Dashboard/>}/>
          <Route path='/dashboard' element={<Dashboard/>}/>
          <Route path='/workout' element={<Workout/>}/>
          <Route path='/diet' element={<Diet/>}/>
          <Route path='/bmi' element={<Bmi/>}/>
          <Route path='/foodstore' element={<FoodStore/>}/>
          <Route path='/orders' element={<Order/>}/>
          <Route path='/profile' element={<Profile/>}/>

        </Route>

        <Route path='*' element={<NotFound/>}/>
      </Routes>
    </>
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