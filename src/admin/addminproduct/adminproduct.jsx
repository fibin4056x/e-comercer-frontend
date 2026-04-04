import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./AdminProducts.css";

axios.defaults.withCredentials = true;

// ✅ Your REAL backend
const BASE_URL = "https://e-comerce-backend-cfkk.onrender.com";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/products`);

      console.log("Admin Data Check:", res.data);

      const dataArray =
        res.data?.products || (Array.isArray(res.data) ? res.data : []);

      setProducts(dataArray);
    } catch (err) {
      console.error("Fetch Error:", err);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      // ✅ FIXED missing slash
      await axios.delete(`${BASE_URL}/api/products/${id}`);
      toast.success("Deleted successfully");
      fetchProducts();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="admin-products-page">
      <div className="admin-header">
        <h2>Product Management</h2>
        <button onClick={() => navigate("/addproduct")} className="add-btn">
          + Add Product
        </button>
      </div>

      {loading ? (
        <p>Updating Inventory...</p>
      ) : (
        (products || []).map((product) => (
          <div key={product._id} className="product-row">
            <img
              // ✅ FIXED image URL
              src={`${BASE_URL}${product.images?.[0] || "/placeholder.png"}`}
              alt={product.name}
            />

            <div className="info">
              <h4>{product.name}</h4>
              <p>₹{product.price}</p>
              <span className="stock-tag">
                Stock: {product.variants?.[0]?.stock || 0}
              </span>
            </div>

            <div className="actions">
              <button
                className="edit"
                onClick={() => navigate(`/admin/update/${product._id}`)}
              >
                Edit
              </button>

              <button
                className="delete"
                onClick={() => deleteProduct(product._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}

      {!loading && products.length === 0 && (
        <p>No products found in the catalog.</p>
      )}
    </div>
  );
}