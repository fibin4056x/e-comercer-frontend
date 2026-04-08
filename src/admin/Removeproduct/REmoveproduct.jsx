import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getAssetUrl, request } from "../../services/apiClient";
import "./RemoveProduct.css";

export default function RemoveProduct() {
  const [products, setProducts] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await request("/products");

      // ✅ FIXED
      setProducts(Array.isArray(data?.products) ? data.products : []);

    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to fetch products");
    }
  };

  const openConfirm = (product) => {
    setSelectedProduct(product);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;

    try {
      await request(`/products/${selectedProduct._id}`, "DELETE");

      toast.success(`"${selectedProduct.name}" deleted`);

      setProducts(
        products.filter((p) => p._id !== selectedProduct._id)
      );

      setConfirmOpen(false);
      setSelectedProduct(null);

    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err.message || "Delete failed");
    }
  };

  const handleCancel = () => {
    setConfirmOpen(false);
    setSelectedProduct(null);
  };

  return (
    <div className="remove-container">
      <h2>Manage Products</h2>

      {products.length === 0 ? (
        <p className="empty-text">No products available</p>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <div key={product._id} className="product-card">
              
              {/* ✅ FIXED IMAGE */}
              <img
                src={getAssetUrl(product.images?.[0])}
                alt={product.name}
              />

              <h4>{product.name}</h4>
              <p>₹{product.price}</p>

              <button
                className="delete-btn"
                onClick={() => openConfirm(product)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {confirmOpen && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <h3>Delete Product</h3>
            <p>
              Are you sure you want to delete
              <strong> {selectedProduct.name}</strong>?
            </p>

            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                className="confirm-btn"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
