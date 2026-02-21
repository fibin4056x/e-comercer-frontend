import React from "react";
import { Link } from "react-router-dom";
import "./AdminHomepage.css";

function AdminHomepage() {
  return (
    <div className="admin-home">
      <h1 className="admin-title">Admin Dashboard</h1>
      <p className="admin-subtitle">Manage your e-commerce store</p>

      <div className="admin-actions">
        <Link to="/addproduct" className="admin-card">
          <h2>Add Product</h2>
          <p>Create new products and add them to your store.</p>
        </Link>

        <Link to="/removeproduct" className="admin-card">
          <h2>Remove Product</h2>
          <p>Delete or update products from your catalog.</p>
        </Link>

      <Link to="/orderpage" className="admin-card">
  <h2>Manage Orders</h2>
  <p>View and process customer orders.</p>
</Link>


        <Link to="/users" className="admin-card">
          <h2>Manage Users</h2>
          <p>View registered customers and update roles.</p>
        </Link>
      </div>
    </div>
  );
}

export default AdminHomepage;
