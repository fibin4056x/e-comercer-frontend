import React, { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Context } from "../../../registrationpage/loginpages/Logincontext";
import { request } from "../../../services/api";
import "./Userdetails.css";

function Userdetails() {
  const { user, setuser } = useContext(Context);
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

 const handleLogout = async () => {
  try {
    await request("/auth/logout", "POST");

    setUser(null);   // ✅ correct
    localStorage.removeItem("user");

    navigate("/login");

  } catch (err) {
    console.error("Logout failed:", err.message);
  }
};
  if (!user) {
    return (
      <div className="userdetails-container empty-state">
        <h2>No User Logged In</h2>
        <Link to="/login" className="primary-btn">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="userdetails-container">
      <div className="profile-card">

        <div className="profile-header">
          <div className="avatar">
            {user.username?.charAt(0).toUpperCase()}
          </div>

          <div className="profile-info">
            <h2>{user.username}</h2>
            <p>{user.email}</p>
            <span className="role-badge">
              {user.role || "User"}
            </span>
          </div>
        </div>

        <div className="profile-actions">
          <Link to="/order" className="secondary-btn">
            My Orders
          </Link>

          <button
            className="danger-btn"
            onClick={() => setShowLogoutModal(true)}
          >
            Logout
          </button>
        </div>
      </div>

      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="logout-modal">
            <h3>Confirm Logout</h3>
            <p>You will be signed out from this device.</p>
            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>
              <button
                className="confirm-btn"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Userdetails;