import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./AdminProducts.css";

axios.defaults.withCredentials = true;

export default function AdminProducts() {

  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/products"
      );
      setProducts(res.data);
    } catch {
      toast.error("Failed to load products");
    }
  };

  const deleteProduct = async (id) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/products/${id}`
      );
      toast.success("Deleted");
      fetchProducts();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="admin-products-page">

      <div className="admin-header">
        <h2>Product Management</h2>
        <button
          onClick={() => navigate("/addproduct")}
          className="add-btn"
        >
          + Add Product
        </button>
      </div>

      {products.map((product) => (
        <div key={product._id} className="product-row">

          <img
            src={`http://localhost:5000${product.images?.[0]}`}
            alt={product.name}
          />

          <div className="info">
            <h4>{product.name}</h4>
            <p>₹{product.price}</p>
          </div>

          <div className="actions">
            <button
              className="edit"
              onClick={() =>
                navigate(`/admin/update/${product._id}`)
              }
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
      ))}

    </div>
  );
}