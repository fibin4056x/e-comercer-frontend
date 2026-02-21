import "./login.css";
import React, { useContext, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "./Logincontext";
import { toast } from "react-toastify";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setuser } = useContext(Context);
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.warning("Please fill in all fields");
      return;
    }

    
    const emailValid = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
    if (!emailValid) {
      toast.warning("Please enter a valid email address");
      return;
    }

    try {
      const res = await axios.get("http://localhost:3000/user", {
        params: { email, password },
      });

      if (res.data.length > 0) {
        const userData = res.data[0];
        localStorage.setItem("user", JSON.stringify(userData));
        setuser(userData);
        setEmail("");
        setPassword("");

        toast.success("Login successful!");
        navigate("/");
        window.location.reload();
      } else {
        toast.error("Invalid email or password. Please register.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong while logging in.");
    }
  };

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>

        <label className="input-group">
          <p>Email</p>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label className="input-group">
          <p>Password</p>
          <div className="password-wrapper">
            <input
              type={show ? "text" : "password"}
              value={password}
              placeholder="Enter your password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="button" onClick={() => setShow(!show)}>
              {show ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
        </label>

        <div className="form-actions">
          <button type="submit" className="submit-btn">Login</button>
          <Link to="/" className="back-btn">Back</Link>
          <Link to="/Registration" className="register-btn">Register</Link>
        </div>
      </form>
    </div>
  );
}
