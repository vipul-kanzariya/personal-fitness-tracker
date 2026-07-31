import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios'


function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const handleSubmit = async(e) =>{
    e.preventDefault()
    setError("");
    try{
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {email, password});
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('name', res.data.name);
      navigate('/dashboard');
    }catch(err){
      setError(err.response?.data || 'Login failed. Please try again.');
    }
  }
  return (
    <>
    <div className="container bg-white  p-3  rounded">
      {error && (
        <div className='alert alert-danger mt-3'>{error}</div>
      )}
      <form onSubmit={handleSubmit}>
        <label htmlFor="email"
        className="flex-row m-1">Email</label>
        <input 
        type="email" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        id="email" 
        placeholder="Enter Email" />
        <br />
        <label htmlFor="password"
        className="flex-row m-1">Password</label>
        <input 
        type="password" 
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        id="password" 
        placeholder="Enter Password" />
        <br />
        <br />
        <button type="submit" className="btn btn-primary">Submit</button>
      </form>
      </div>
    </>
  );
}

export default Login;