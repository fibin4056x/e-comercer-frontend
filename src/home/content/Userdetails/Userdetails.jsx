import React, { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Context } from "../../../registrationpage/loginpages/Logincontext";
import "./Userdetails.css";

function Userdetails() {
  const { user, setuser } = useContext(Context); // logged-in user
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setuser(null);
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="userdetails-container">
      {!user ? (
        <p>No user logged in. Please <Link to="/login">login</Link>.</p>
      ) : (
        <>
          <h2>My Profile</h2>

          {/* Logout button */}
          <button className="logout-btn" onClick={() => setShowLogoutModal(true)}>
            Logout
          </button>

          {/* Link to Orders page */}
          <Link to="/order">
            <button className="order-btn">My Orders</button>
          </Link>

          <div className="user-item">
            <strong>Name:</strong> {user.username} <br />
            <strong>Email:</strong> {user.email} <br />
            <strong>Role:</strong> {user.role || "User"}
          </div>

          {/* Custom Logout Confirmation Modal */}
          {showLogoutModal && (
            <div className="modal-overlay">
              <div className="logout-modal">
                <h3>Confirm Logout</h3>
                <p>Are you sure you want to logout?</p>
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
        </>
      )}
    </div>
  );
}

export default Userdetails;
