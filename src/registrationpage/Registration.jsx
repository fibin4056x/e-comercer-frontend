import './registration.css';
import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function Registration() {
  const [username, setusername] = useState('');
  const [email, setemail] = useState('');
  const [password, setpassword] = useState('');
  const [confirmPassword, setconfirmPassword] = useState('');
  const [show, setshow] = useState(false);
  const [showConfirm, setshowConfirm] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !email || !password || !confirmPassword) {
      toast.warning("Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.warning("Passwords do not match");
      return;
    }

    const usernameValid = /^[a-zA-Z]{5,}$/.test(username);
    const emailValid = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
    const passwordValid = /^\d{6}$/.test(password);

    if (usernameValid && emailValid && passwordValid) {
      try {
        const res = await axios.post('http://localhost:3000/user', {
          username,
          email,
          password,
        });

        console.log(res.data);

        setusername('');
        setemail('');
        setpassword('');
        setconfirmPassword('');

        toast.success("Registration successful! Please login.");
        navigate('/login');
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong while registering.");
      }
    } else {
      toast.warning("Username must be at least 5 letters, email must be valid, and password must be exactly 6 numbers");
    }
  };

  return (
    <div className="registration-page">
      <form className="registration-form" onSubmit={handleSubmit}>
        <h2>Create Account</h2>

        <label className="input-group">
          <p>Username</p>
          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setusername(e.target.value)}
          />
        </label>

        <label className="input-group">
          <p>Email</p>
          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setemail(e.target.value)}
          />
        </label>

        <label className="input-group">
          <p>Password</p>
          <div className="password-wrapper">
            <input
              type={show ? "text" : "password"}
              value={password}
              placeholder="Enter 6-digit password"
              onChange={(e) => setpassword(e.target.value)}
            />
            <button type="button" onClick={() => setshow(!show)}>
              {show ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
        </label>

        <label className="input-group">
          <p>Confirm Password</p>
          <div className="password-wrapper">
            <input
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              placeholder="Re-enter password"
              onChange={(e) => setconfirmPassword(e.target.value)}
            />
            <button type="button" onClick={() => setshowConfirm(!showConfirm)}>
              {showConfirm ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
        </label>

        <button type="submit" className="submit-btn">Register</button>
      </form>
    </div>
  );
}
