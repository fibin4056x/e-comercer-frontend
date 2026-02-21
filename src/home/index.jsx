import { Link, NavLink, Outlet } from "react-router-dom";
import { useContext, useState } from "react";
import { Context } from "../registrationpage/loginpages/Logincontext";
import { WishlistContext } from "../registrationpage/wishlisht/wishlistcontext";
import { OrderContext } from "./content/orderpage/ordercontext";
import { LogIn, LogOut, ShoppingCart, Heart, Menu, User } from "lucide-react";
import "./index.css";

export default function Index() {
  const { user, logout, cart } = useContext(Context);
  const { Order } = useContext(OrderContext);
  const { wishlist } = useContext(WishlistContext);
  const [menuOpen, setMenuOpen] = useState(false);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const orderCount = Order.length;
  const wish = wishlist.length;

  const handleLogout = () => {
    if (logout) logout();
  };

  const handleLinkClick = () => setMenuOpen(false);

  return (
    <div>
      <nav className="navbar">
        <div className="navbar-left">
          <div className="brand">
            <Link to="/" onClick={handleLinkClick}>
              <span>sole society</span>
            </Link>
          </div>
          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            <Menu size={24} />
          </button>
        </div>

        <div className={`nav-links ${menuOpen ? "open" : ""}`}>
          <NavLink to="/" onClick={handleLinkClick}>Home</NavLink>
          <NavLink to="/men" onClick={handleLinkClick}>Men</NavLink>
          <NavLink to="/women" onClick={handleLinkClick}>Women</NavLink>
          <NavLink to="/cart" onClick={handleLinkClick} className="nav-icon">
            <ShoppingCart size={20} />
            {cartCount > 0 && <span className="badge">{cartCount}</span>}
          </NavLink>
          <NavLink to={user?.role === "admin" ? "/admin" : "/userdetails"} onClick={handleLinkClick} className="nav-icon">
            {user?.role === "admin" ? "Admin" : <User size={20} />}
            {orderCount > 0 && user?.role !== "admin" && <span className="badge">{orderCount}</span>}
          </NavLink>
          <NavLink to="/wishlist" onClick={handleLinkClick} className="nav-icon">
            <Heart size={20} />
            {wish > 0 && <span className="badge">{wish}</span>}
          </NavLink>
        </div>

        <div className="nav-right">
          {!user ? (
            <Link to="/login" className="login-btn" onClick={handleLinkClick}>
              <LogIn size={16} /> Login
            </Link>
          ) : (
            <span>Hi, {user.username}</span>
          )}
          
          {user && user.role === "admin" && (
            <button className="logout-btn" onClick={handleLogout}>
              <LogOut size={16} /> Logout
            </button>
          )}
          
       
        </div>
      </nav>

      <div className="page-content">
        <Outlet />
      </div>
    </div>
  );
}