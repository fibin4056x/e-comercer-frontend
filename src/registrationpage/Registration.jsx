import "./registration.css";
import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { request } from "../services/api";
import { toast } from "react-toastify";

export default function Registration() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [show, setShow] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { username, email, password, confirmPassword } = form;

    if (!username || !email || !password || !confirmPassword) {
      return toast.warning("All fields are required");
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return toast.warning("Enter a valid email address");
    }

    if (password.length < 6) {
      return toast.warning("Password must be at least 6 characters");
    }

    if (password !== confirmPassword) {
      return toast.warning("Passwords do not match");
    }

    try {
      setLoading(true);

      await request("/auth/register", "POST", {
        username,
        email,
        password,
      });

      toast.success("Account created successfully 🎉");

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (err) {
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-page">
      <form className="registration-form" onSubmit={handleSubmit}>
        <h2>Create Account</h2>

        <div className="input-group">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
          />
        </div>

        <div className="input-group">
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
          />
        </div>

        <div className="password-wrapper">
          <input
            type={show ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
          />
          <button type="button" onClick={() => setShow(!show)}>
            {show ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        </div>

        <div className="password-wrapper">
          <input
            type={showConfirm ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
          />
          <button type="button" onClick={() => setShowConfirm(!showConfirm)}>
            {showConfirm ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Creating Account..." : "Register"}
        </button>

        <div className="bottom-login">
          <p>Already have an account?</p>
          <Link to="/login" className="login-btn-alt">
            Login
          </Link>
        </div>
      </form>
    </div>
  );
}