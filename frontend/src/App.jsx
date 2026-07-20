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


function Layout() {
  const location = useLocation();
  const hideNavbar = ['/login', '/register'].includes(location.pathname);

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path='/login' element={<Login/>}/>
        <Route path='/register' element={<Register/>}/>

        <Route element={<PrivateRoute/>}>
          <Route path='/dashboard' element={<Dashboard/>}/>
          <Route path='/workout' element={<Workout/>}/>
          <Route path='/diet' element={<Diet/>}/>
          <Route path='/bmi' element={<Bmi/>}/>
          <Route path='/foodstore' element={<FoodStore/>}/>
          <Route path='/orders' element={<Order/>}/>
        </Route>
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
