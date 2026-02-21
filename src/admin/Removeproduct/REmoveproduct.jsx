import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
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
      const res = await axios.get("http://localhost:3000/products");
      setProducts(res.data);
    } catch (err) {
      console.error(err);
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
      await axios.delete(`http://localhost:3000/products/${selectedProduct.id}`);
      toast.success(`"${selectedProduct.name}" removed successfully`);
      setProducts(products.filter((p) => p.id !== selectedProduct.id));
      setConfirmOpen(false);
      setSelectedProduct(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove product");
    }
  };

  const handleCancel = () => {
    setConfirmOpen(false);
    setSelectedProduct(null);
  };

  return (
    <div className="remove-product">
      <h2 className="remove-title">Remove Product</h2>
      {products.length === 0 ? (
        <p className="no-products">No products available</p>
      ) : (
        <ul className="product-list">
          {products.map((product) => (
            <li key={product.id} className="product-item">
              <span className="product-name">{product.name}</span>
              <span className="product-price">₹{product.price}</span>
              <button
                onClick={() => openConfirm(product)}
                className="delete-btn"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Modal style similar to navbar logout modal */}
      {confirmOpen && (
        <div className="modal-overlay">
          <div className="logout-modal">
            <h3>Delete Product</h3>
            <p>Are you sure you want to delete <strong>{selectedProduct.name}</strong>?</p>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
              <button className="confirm-btn" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
