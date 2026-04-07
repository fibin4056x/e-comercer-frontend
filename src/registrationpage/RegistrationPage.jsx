import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { request } from "../services/apiClient";
import "./auth.css";

export default function RegistrationPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [show, setShow] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm((prevForm) => ({
      ...prevForm,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const { username, email, password, confirmPassword } = form;
    const normalizedUsername = username.trim();
    const normalizedEmail = email.trim();

    if (!normalizedUsername || !normalizedEmail || !password || !confirmPassword) {
      toast.warning("All fields are required");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(normalizedEmail)) {
      toast.warning("Enter a valid email address");
      return;
    }

    if (password.length < 6) {
      toast.warning("Password must be at least 6 characters");
      return;
    }

    if (!/^[A-Za-z0-9_]+$/.test(normalizedUsername)) {
      toast.warning("Username can only contain letters, numbers, and underscores");
      return;
    }

    if (password !== confirmPassword) {
      toast.warning("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      await request("/auth/register", "POST", {
        username: normalizedUsername,
        email: normalizedEmail,
        password,
      });

      toast.success("Registered. Enter the OTP sent to your email.");
      setShowOtpInput(true);
    } catch (error) {
      toast.error(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      toast.warning("Enter OTP");
      return;
    }

    try {
      setLoading(true);

      await request("/auth/verify-register", "POST", {
        email: form.email.trim(),
        otp: otp.trim(),
      });

      toast.success("Account activated successfully");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (error) {
      toast.error(error.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <section className="auth-panel auth-panel--hero">
        <div>
          <p className="auth-kicker">New account</p>
          <h1>Join the storefront with a polished, secure sign-up flow.</h1>
          <p>
            Registration now mirrors the production backend flow, including verification before
            account activation.
          </p>
        </div>

        <div className="auth-feature-list">
          <div>
            <span>Verification</span>
            Email OTP confirmation helps keep account creation trustworthy.
          </div>
          <div>
            <span>Production-ready</span>
            Sessions, cart state, and wishlist behavior line up with the latest backend routes.
          </div>
        </div>
      </section>

      <section className="auth-panel auth-form-wrap">
        <form className="auth-form-card" onSubmit={handleSubmit}>
          <h2>Create account</h2>
          <p>
            {showOtpInput
              ? "Enter the verification code we sent to your inbox."
              : "Start with your core account details."}
          </p>

          <label className="auth-field">
            <span>Username</span>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              disabled={showOtpInput}
            />
          </label>

          <label className="auth-field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              placeholder="name@example.com"
              value={form.email}
              onChange={handleChange}
              disabled={showOtpInput}
            />
          </label>

          <label className="auth-field">
            <span>Password</span>
            <div className="auth-password-shell">
              <input
                type={show ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                disabled={showOtpInput}
              />
              <button type="button" onClick={() => setShow((prev) => !prev)}>
                {show ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </label>

          <label className="auth-field">
            <span>Confirm password</span>
            <div className="auth-password-shell">
              <input
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm password"
                value={form.confirmPassword}
                onChange={handleChange}
                disabled={showOtpInput}
              />
              <button type="button" onClick={() => setShowConfirm((prev) => !prev)}>
                {showConfirm ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </label>

          {showOtpInput ? (
            <>
              <label className="auth-field">
                <span>OTP</span>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(event) => setOtp(event.target.value)}
                />
              </label>

              <div className="auth-actions">
                <button
                  type="button"
                  className="auth-primary"
                  onClick={handleVerifyOtp}
                  disabled={loading}
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
              </div>

              <p className="auth-helper">
                <strong>{form.email}</strong> is waiting for verification.
              </p>
            </>
          ) : (
            <div className="auth-actions">
              <button type="submit" className="auth-primary" disabled={loading}>
                {loading ? "Creating account..." : "Register"}
              </button>
            </div>
          )}

          <div className="auth-links">
            <Link to="/login" className="auth-secondary">
              Already have an account?
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
}
