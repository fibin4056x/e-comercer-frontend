import React, { useContext, useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "./LogincontextV2";
import { toast } from "react-toastify";
import { request } from "../../services/apiClient";
import "../auth.css";

export default function LoginPage() {
  const { user, setUser } = useContext(Context);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [navigate, user]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.warning("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);

      await request("/auth/login", "POST", {
        email: email.trim(),
        password,
      });

      const profile = await request("/auth/profile", "GET");
      setUser(profile);

      toast.success("Login successful");
      navigate("/", { replace: true });
    } catch (error) {
      toast.error(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <section className="auth-panel auth-panel--hero">
        <div>
          <p className="auth-kicker">Client access</p>
          <h1>Return to the premium storefront.</h1>
          <p>
            Sign in to manage your cart, wishlist, account profile, and order history from one
            refined workspace.
          </p>
        </div>

        <div className="auth-feature-list">
          <div>
            <span>Saved state</span>
            Keep your cart, wishlist, and account details in sync across sessions.
          </div>
          <div>
            <span>Protected checkout</span>
            Cookie-based sessions keep authentication aligned with the production backend.
          </div>
        </div>
      </section>

      <section className="auth-panel auth-form-wrap">
        <form className="auth-form-card" onSubmit={handleSubmit}>
          <h2>Welcome back</h2>
          <p>Use your email and password to continue shopping.</p>

          <label className="auth-field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
            />
          </label>

          <label className="auth-field">
            <span>Password</span>
            <div className="auth-password-shell">
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
              />
              <button type="button" onClick={() => setShow((prev) => !prev)}>
                {show ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </label>

          <div className="auth-actions">
            <button type="submit" className="auth-primary" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>

          <div className="auth-links">
            <Link to="/" className="auth-secondary">
              Continue browsing
            </Link>
            <Link to="/registration" className="auth-link-button">
              Create account
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
}
