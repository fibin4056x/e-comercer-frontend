import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AddProduct.css";
import axios from "axios";
import { toast } from "react-toastify";

export default function AddProduct() {
  const navigate = useNavigate();

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    image: "",
    stock: "",
    brand: "",
    type: "",
  });

  
  function handleChange(e) {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

 
    const productToAdd = {
      id: Date.now().toString(), 
      name: newProduct.name,
      brand: newProduct.brand,
      category: newProduct.category,
      type: newProduct.type,
      description: newProduct.description,
      price: parseFloat(newProduct.price),
      originalPrice: null,
      sizes: [],
      colors: [],
      images: [newProduct.image],
      stock: parseInt(newProduct.stock) || 0,
      rating: 0,
      reviews: 0,
      discount: 0,
      isFeatured: false,
      isNewArrival: true,
    };

    try {
      const res = await axios.post("http://localhost:3000/products", productToAdd);
      console.log("✅ Product added:", res.data);
      toast.info("Product added successfully!");
      navigate("/"); 
    } catch (error) {
      console.error("❌ Error adding product:", error);
      toast.warning("Failed to add product. Please try again.");
    }
  }

  return (
    <div className="add-container">
      <h1>Add New Product</h1>
      <form onSubmit={handleSubmit} className="add-form">
        <input
          type="text"
          name="name"
          value={newProduct.name}
          placeholder="Product Name"
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="brand"
          value={newProduct.brand}
          placeholder="Brand"
          onChange={handleChange}
        />
        <input
          type="text"
          name="type"
          value={newProduct.type}
          placeholder="Type (Sneaker, Running, Casual, etc.)"
          onChange={handleChange}
        />
        <input
          type="number"
          name="price"
          value={newProduct.price}
          placeholder="Price"
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          value={newProduct.description}
          placeholder="Product Description"
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="category"
          value={newProduct.category}
          placeholder="Category (Men, Women, etc.)"
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="stock"
          value={newProduct.stock}
          placeholder="Stock Quantity"
          onChange={handleChange}
        />
        <input
          type="text"
          name="image"
          value={newProduct.image}
          placeholder="Image URL"
          onChange={handleChange}
        />
        {newProduct.image && (
          <img src={newProduct.image} alt="Preview" className="preview-img" />
        )}
        <button type="submit">Add Product</button>
      </form>
    </div>
  );
}
