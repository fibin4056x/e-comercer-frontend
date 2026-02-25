import "./login.css";
import React, { useContext, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "./Logincontext";
import { toast } from "react-toastify";
import { request } from "../../services/api";

export default function Login() {
  const { setUser } = useContext(Context);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.warning("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);

      const data = await request("/auth/login", "POST", {
        email,
        password,
      });

      // Make sure backend returns token
      if (!data?.token) {
        throw new Error("Invalid login response");
      }

      localStorage.setItem("user", JSON.stringify(data));
      setUser(data);

      toast.success("Login successful!");
      navigate("/");
    } catch (err) {
      toast.error(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
        </label>

        <label className="input-group">
          <p>Password</p>
          <div className="password-wrapper">
            <input
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
            <button type="button" onClick={() => setShow(!show)}>
              {show ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
        </label>

        <div className="form-actions">
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

          <Link to="/" className="back-btn">Back</Link>
          <Link to="/registration" className="register-btn">Register</Link>
        </div>
      </form>
    </div>
  );
}