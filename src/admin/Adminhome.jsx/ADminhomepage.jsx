import React from "react";
import { Link } from "react-router-dom";
import {
  FaBoxOpen,
  FaShoppingCart,
  FaUsers,
  FaPlus,
  FaTrash
} from "react-icons/fa";
import "./AdminHomepage.css";

function AdminHomepage() {
  return (
    <div className="admin-container">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <h2 className="logo">AdminPanel</h2>
        <nav>
          <Link to="/addproduct" className="nav-item">
            <FaPlus /> Add Product
          </Link>
          <Link to="/removeproduct" className="nav-item">
            <FaTrash /> Remove Product
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
          <h1>Dashboard</h1>
          <p>Manage your store efficiently</p>
        </header>

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