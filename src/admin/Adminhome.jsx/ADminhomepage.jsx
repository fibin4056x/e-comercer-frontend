import React from "react";
import { Link } from "react-router-dom";
import {
  FaBoxOpen,
  FaShoppingCart,
  FaUsers,
  FaCogs,
} from "react-icons/fa";
import "./AdminHomepage.css";

function AdminHomepage() {
  return (
    <div className="admin-container">

      {/* Sidebar */}
      <aside className="admin-sidebar">
        <h2 className="logo">AdminPanel</h2>

        <nav>
          <Link to="/admin/products" className="nav-item">
            <FaCogs /> Manage Products
          </Link>

          <Link to="/orderpage" className="nav-item">
            <FaShoppingCart /> Orders
          </Link>

          <Link to="/users" className="nav-item">
            <FaUsers /> Users
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="admin-main">

        <header className="admin-header">
          <h1>Admin Dashboard</h1>
          <p>Control your store from one place</p>
        </header>

        {/* Manage Products Section */}
        <div className="manage-section">
          <h2>Product Management</h2>

          <div className="button-group">
            <Link to="/addproduct" className="admin-btn create">
              Create Product
            </Link>

            <Link to="/admin/products" className="admin-btn update">
              Update Product
            </Link>

            <Link to="/removeproduct" className="admin-btn delete">
              Remove Product
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <FaBoxOpen className="stat-icon" />
            <h3>120</h3>
            <p>Total Products</p>
          </div>

          <div className="stat-card">
            <FaShoppingCart className="stat-icon" />
            <h3>45</h3>
            <p>Total Orders</p>
          </div>

          <div className="stat-card">
            <FaUsers className="stat-icon" />
            <h3>300</h3>
            <p>Total Users</p>
          </div>
        </div>

      </main>
    </div>
  );
}

export default AdminHomepage;