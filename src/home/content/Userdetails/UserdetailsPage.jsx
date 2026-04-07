import { useContext, useState } from "react";
import Cropper from "react-easy-crop";
import { Camera, Heart, LogOut, ShoppingBag, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Context } from "../../../registrationpage/loginpages/LogincontextV2";
import { WishlistContext } from "../../../registrationpage/wishlisht/wishlistcontextV2";
import { OrderContext } from "../orderpage/ordercontextV2";
import { getAssetUrl, request } from "../../../services/apiClient";
import getCroppedImg from "../../../utilitis/cropImage";

export default function UserdetailsPage() {
  const navigate = useNavigate();
  const { user, setUser, logout, cart } = useContext(Context) || {};
  const { wishlist = [] } = useContext(WishlistContext) || {};
  const { orders = [] } = useContext(OrderContext) || {};

  const [imageSrc, setImageSrc] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleSelectImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setImageSrc(String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  const handleSaveAvatar = async () => {
    if (!imageSrc || !croppedAreaPixels) {
      return;
    }

    try {
      setSavingAvatar(true);
      const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels);
      const formData = new FormData();
      formData.append("image", croppedFile);

      const updatedUser = await request("/auth/profile-image", "PUT", formData);
      setUser(updatedUser);
      setImageSrc("");
      toast.success("Profile image updated");
    } catch (error) {
      toast.error(error.message || "Unable to upload image");
    } finally {
      setSavingAvatar(false);
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      const updatedUser = await request("/auth/profile-image", "DELETE");
      setUser(updatedUser);
      toast.success("Profile image removed");
    } catch (error) {
      toast.error(error.message || "Unable to delete image");
    }
  };

  const handleLogout = async () => {
    try {
      await logout?.();
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(error.message || "Unable to logout");
    }
  };

  if (!user) {
    return (
      <section className="store-section store-empty-state">
        <h1>No user session found</h1>
        <p>Login to manage your account, profile image, orders, and wishlist.</p>
        <Link to="/login" className="store-primary-button">
          Login
        </Link>
      </section>
    );
  }

  return (
    <div className="store-section profile-layout">
      <section className="store-section-card profile-panel">
        <div className="profile-header">
          <div className="profile-avatar-shell">
            {user.profileImage ? (
              <img
                src={getAssetUrl(user.profileImage)}
                alt={user.username}
                className="profile-avatar-image"
              />
            ) : (
              <div className="profile-avatar-fallback">
                {String(user.username || "U").charAt(0).toUpperCase()}
              </div>
            )}

            <label className="profile-avatar-action">
              <Camera size={16} />
              <input type="file" accept="image/*" hidden onChange={handleSelectImage} />
            </label>

            {user.profileImage ? (
              <button
                type="button"
                className="profile-avatar-delete"
                onClick={handleDeleteAvatar}
              >
                <Trash2 size={14} />
              </button>
            ) : null}
          </div>

          <div>
            <p className="store-kicker">Account details</p>
            <h1>{user.username}</h1>
            <p>{user.email}</p>
            <span className="status-pill status-pill--processing">{user.role}</span>
          </div>
        </div>

        <div className="profile-stats">
          <div>
            <span>Orders</span>
            <strong>{orders.length}</strong>
          </div>
          <div>
            <span>Wishlist</span>
            <strong>{wishlist.length}</strong>
          </div>
          <div>
            <span>Cart items</span>
            <strong>{cart?.items?.length || 0}</strong>
          </div>
        </div>

        <div className="profile-actions">
          <Link to="/order" className="store-secondary-button">
            <ShoppingBag size={16} />
            <span>My orders</span>
          </Link>
          <Link to="/wishlist" className="store-secondary-button">
            <Heart size={16} />
            <span>Wishlist</span>
          </Link>
          <button
            type="button"
            className="store-ghost-danger"
            onClick={() => setShowLogoutModal(true)}
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </section>

      {imageSrc ? (
        <div className="store-modal-backdrop">
          <div className="store-modal store-modal--wide">
            <h2>Adjust profile image</h2>
            <p>Crop your photo before saving it to the account profile.</p>

            <div className="cropper-shell">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
              />
            </div>

            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
            />

            <div className="store-modal-actions">
              <button type="button" className="store-secondary-button" onClick={() => setImageSrc("")}>
                Cancel
              </button>
              <button
                type="button"
                className="store-primary-button"
                onClick={handleSaveAvatar}
                disabled={savingAvatar}
              >
                {savingAvatar ? "Saving..." : "Save image"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showLogoutModal ? (
        <div className="store-modal-backdrop">
          <div className="store-modal">
            <h2>Logout now?</h2>
            <p>You will be signed out on this device and returned to the login page.</p>

            <div className="store-modal-actions">
              <button
                type="button"
                className="store-secondary-button"
                onClick={() => setShowLogoutModal(false)}
              >
                Stay signed in
              </button>
              <button type="button" className="store-ghost-danger" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
