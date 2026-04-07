import { Link, NavLink, Outlet } from "react-router-dom";
import { useContext, useState } from "react";
import { Context } from "../registrationpage/loginpages/LogincontextV2";
import { WishlistContext } from "../registrationpage/wishlisht/wishlistcontextV2";
import { OrderContext } from "./content/orderpage/ordercontextV2";
import {
  ChevronRight,
  LogIn,
  LogOut,
  ShoppingCart,
  Heart,
  Menu,
  User,
} from "lucide-react";
import "./index.css";

export default function Index() {
  const context = useContext(Context);
  const { user, logout, cart } = context || {};

  const { orders = [] } = useContext(OrderContext) || {};
  const { wishlist } = useContext(WishlistContext) || {};

  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  /* =========================
     DERIVED VALUES
  ========================= */

  const cartCount =
    cart?.items?.reduce(
      (sum, item) => sum + (item.quantity || 0),
      0
    ) ?? 0;

  const orderCount = orders.length || 0;
  const wishlistCount = wishlist?.length || 0;

  /* =========================
     HANDLERS
  ========================= */

  const confirmLogout = () => {
    logout?.();
    setShowLogoutModal(false);
    setMenuOpen(false);
  };

  const handleLinkClick = () => setMenuOpen(false);

  /* =========================
     UI
  ========================= */

  return (
    <div className="store-app-shell">
      <nav className="navbar">
        <div className="navbar-left">
          <Link to="/" className="brand" onClick={handleLinkClick}>
            <span className="brand-mark">SS</span>
            <span className="brand-copy">
              <strong>Sole Society</strong>
              <small>Elevated essentials</small>
            </span>
          </Link>

          <button
            type="button"
            className="menu-toggle"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <Menu size={24} />
          </button>
        </div>

        <div className={`nav-links ${menuOpen ? "open" : ""}`}>
          <NavLink to="/" onClick={handleLinkClick}>
            Home
          </NavLink>

          <NavLink to="/men" onClick={handleLinkClick}>
            Men
          </NavLink>

          <NavLink to="/women" onClick={handleLinkClick}>
            Women
          </NavLink>

          <NavLink
            to={user ? "/cart" : "/login"}
            onClick={handleLinkClick}
            className="nav-icon"
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="badge">{cartCount}</span>
            )}
          </NavLink>

          <NavLink
            to={
              user?.role === "admin"
                ? "/admin"
                : user
                ? "/userdetails"
                : "/login"
            }
            onClick={handleLinkClick}
            className="nav-icon"
          >
            {user?.role === "admin" ? (
              <span className="admin-label">Admin</span>
            ) : (
              <User size={20} />
            )}

            {orderCount > 0 && user?.role !== "admin" && (
              <span className="badge">{orderCount}</span>
            )}
          </NavLink>

          <NavLink
            to={user ? "/wishlist" : "/login"}
            onClick={handleLinkClick}
            className="nav-icon"
          >
            <Heart size={20} />
            {wishlistCount > 0 && (
              <span className="badge">{wishlistCount}</span>
            )}
          </NavLink>
        </div>

        <div className="nav-right">
          {!user ? (
            <Link
              to="/login"
              className="login-btn"
              onClick={handleLinkClick}
            >
              <LogIn size={16} /> Login
            </Link>
          ) : (
            <>
              <span className="welcome-text">
                Hi, {user.username}
              </span>

              <button
                type="button"
                className="logout-btn"
                onClick={() => setShowLogoutModal(true)}
              >
                <LogOut size={16} /> Logout
              </button>
            </>
          )}
        </div>
      </nav>

      <div className="page-content">
        <section className="store-top-banner">
          <p>
            New-season footwear, refined basics, and premium admin controls for every order cycle.
          </p>
          <Link to="/men" onClick={handleLinkClick}>
            Explore edit
            <ChevronRight size={14} />
          </Link>
        </section>
        <Outlet />
      </div>

      {/* =========================
         LOGOUT CONFIRMATION MODAL
      ========================= */}

      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="logout-modal">
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to logout?</p>

            <div className="modal-buttons">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="confirm-btn"
                onClick={confirmLogout}
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
