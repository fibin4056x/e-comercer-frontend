import "./login.css";
import React, { useContext, useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "./Logincontext";
import { toast } from "react-toastify";
import { request } from "../../services/api";

export default function Login() {
  const { user, setUser } = useContext(Context);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🚫 Prevent access to login if already logged in
  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.warning("Please fill in all fields");
      return;
    }

    if (!email.includes("@")) {
      toast.warning("Enter a valid email");
      return;
    }

    try {
      setLoading(true);

      // Step 1: Login
      await request("/auth/login", "POST", { email, password });

      // Step 2: Verify token via profile
      const profile = await request("/auth/profile", "GET");

      setUser(profile);

      toast.success("Login successful!");
      navigate("/", { replace: true });

    } catch (err) {
      toast.error(err.message || "Login failed");
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