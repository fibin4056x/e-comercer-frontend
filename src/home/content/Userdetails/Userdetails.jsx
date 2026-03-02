import React, { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Cropper from "react-easy-crop";
import { Camera, Pencil, Trash2 } from "lucide-react";
import { Context } from "../../../registrationpage/loginpages/Logincontext";
import { request } from "../../../services/api";
import  getCroppedImg  from "../../../utilitis/cropImage";
import "./Userdetails.css";

function Userdetails() {
  const { user, setUser } = useContext(Context);
  const navigate = useNavigate();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  /* =========================
     SELECT IMAGE
  ========================= */
  const handleSelectImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result);
    reader.readAsDataURL(file);
  };

  /* =========================
     SAVE CROPPED IMAGE
  ========================= */
  const handleSaveCropped = async () => {
    try {
      const croppedImage = await getCroppedImg(
        imageSrc,
        croppedAreaPixels
      );

      const formData = new FormData();
      formData.append("image", croppedImage);

      const res = await request(
        "/auth/profile-image",
        "PUT",
        formData
      );

      setUser(res);
      localStorage.setItem("user", JSON.stringify(res));
      setImageSrc(null);

    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  /* =========================
     DELETE AVATAR
  ========================= */
  const handleDeleteAvatar = async () => {
    try {
      const res = await request(
        "/auth/profile-image",
        "DELETE"
      );

      setUser(res);
      localStorage.setItem("user", JSON.stringify(res));

    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  /* =========================
     LOGOUT
  ========================= */
  const handleLogout = async () => {
    try {
      await request("/auth/logout", "POST");
      setUser(null);
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

          {/* AVATAR */}
          <div className="avatar-wrapper">
            <div className="avatar">
              {user.profileImage ? (
                <img
                  src={`http://localhost:5000${user.profileImage}`}
                  alt="Profile"
                  className="avatar-img"
                />
              ) : (
                <span className="avatar-initials">
                  {user.username?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {/* EDIT BUTTON */}
            <button
              className="avatar-edit-btn"
              onClick={() =>
                document.getElementById("profileUpload").click()
              }
            >
              {user.profileImage ? (
                <Pencil size={16} />
              ) : (
                <Camera size={16} />
              )}
            </button>

            {/* DELETE BUTTON */}
            {user.profileImage && (
              <button
                className="avatar-delete-btn"
                onClick={handleDeleteAvatar}
              >
                <Trash2 size={14} />
              </button>
            )}

            {/* Hidden File Input */}
            <input
              id="profileUpload"
              type="file"
              accept="image/*"
              hidden
              onChange={handleSelectImage}
            />

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

      {/* CROP MODAL */}
      {imageSrc && (
        <div className="crop-overlay">
          <div className="crop-modal">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(croppedArea, croppedAreaPixels) =>
                setCroppedAreaPixels(croppedAreaPixels)
              }
            />

            <div className="zoom-control">
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) =>
                  setZoom(Number(e.target.value))
                }
              />
            </div>

            <div className="crop-buttons">
              <button
                className="cancel-btn"
                onClick={() => setImageSrc(null)}
              >
                Cancel
              </button>

              <button
                className="save-btn"
                onClick={handleSaveCropped}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOGOUT MODAL */}
      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="logout-modal">
            <h3>Confirm Logout</h3>
            <p>You will be signed out from this device.</p>
            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() =>
                  setShowLogoutModal(false)
                }
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