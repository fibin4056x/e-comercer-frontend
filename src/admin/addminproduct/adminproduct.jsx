import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getAssetUrl, request } from "../../services/apiClient";
import "./AdminProducts.css";

// ✅ Your REAL backend

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
      const data = await request("/products");
      const dataArray =
        data?.products || (Array.isArray(data) ? data : []);

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
      await request(`/products/${id}`, "DELETE");
      toast.success("Deleted successfully");
      fetchProducts();
    } catch (error) {
      toast.error(error.message || "Delete failed");
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
              src={getAssetUrl(product.images?.[0])}
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
