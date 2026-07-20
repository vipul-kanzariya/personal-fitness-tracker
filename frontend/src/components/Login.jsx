import React, { useState } from "react";
import {Meta, useNavigate} from 'react-router-dom';
import axios from 'axios'


function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const handleSubmit = async(e) =>{
    e.preventDefault()
    try{
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`,
      {email,password});
      localStorage.setItem('token', res.data);
      navigate('/dashboard')
    }catch(err){
      console.log(err.message);
      
    }
  }
  return (
    <>
    <div className="container bg-white  p-3  rounded">
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
