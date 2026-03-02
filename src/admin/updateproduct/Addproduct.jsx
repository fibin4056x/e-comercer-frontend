import React, { useState, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./AddProduct.css";

// 🔥 IMPORTANT: enable cookie sending
axios.defaults.withCredentials = true;

export default function AddProduct() {

  const [loading, setLoading] = useState(false);

  const [product, setProduct] = useState({
    name: "",
    brand: "",
    category: "",
    type: "",
    description: "",
    price: "",
    originalPrice: "",
    discount: 0,
    variants: [{ size: "", color: "", stock: 0 }],
    isFeatured: false,
    isNewArrival: false,
  });

  const [images, setImages] = useState([]);
  const [preview, setPreview] = useState([]);

  /* =========================
     INPUT HANDLER
  ========================= */

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "discount") {
      const safeValue = Math.min(100, Math.max(0, Number(value)));
      setProduct({ ...product, discount: safeValue });
      return;
    }

    setProduct({
      ...product,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  /* =========================
     VARIANTS
  ========================= */

  const handleVariantChange = (index, field, value) => {
    const updated = [...product.variants];
    updated[index][field] = field === "stock" ? Number(value) : value;
    setProduct({ ...product, variants: updated });
  };

  const addVariant = () => {
    setProduct({
      ...product,
      variants: [...product.variants, { size: "", color: "", stock: 0 }],
    });
  };

  /* =========================
     IMAGE UPLOAD
  ========================= */

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);

    const previews = files.map((file) =>
      URL.createObjectURL(file)
    );
    setPreview(previews);
  };

  /* =========================
     FINAL PRICE CALCULATION
  ========================= */

  const finalPrice = useMemo(() => {
    const price = Number(product.price) || 0;
    const discount = Number(product.discount) || 0;

    if (discount > 100) return price;
    return Math.max(0, price - (price * discount) / 100);
  }, [product.price, product.discount]);

  /* =========================
     VALIDATION
  ========================= */

  const validateProduct = () => {
    const errors = [];

    if (!product.name || product.name.trim().length < 3) {
      errors.push("Product name must be at least 3 characters");
    }

    if (!product.price || Number(product.price) <= 0) {
      errors.push("Price must be greater than 0");
    }

    if (
      product.originalPrice &&
      Number(product.originalPrice) < Number(product.price)
    ) {
      errors.push("Original price cannot be less than selling price");
    }

    if (product.discount < 0 || product.discount > 100) {
      errors.push("Discount must be between 0 and 100");
    }

    if (images.length === 0) {
      errors.push("At least one product image is required");
    }

    if (product.variants.length === 0) {
      errors.push("At least one variant is required");
    }

    product.variants.forEach((variant, index) => {
      if (!variant.size) {
        errors.push(`Variant ${index + 1}: Size is required`);
      }
      if (!variant.color) {
        errors.push(`Variant ${index + 1}: Color is required`);
      }
      if (variant.stock < 0) {
        errors.push(`Variant ${index + 1}: Stock cannot be negative`);
      }
    });

    return errors;
  };

  /* =========================
     SUBMIT
  ========================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateProduct();

    if (validationErrors.length > 0) {
      validationErrors.forEach((err) => toast.error(err));
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      Object.keys(product).forEach((key) => {
        if (key === "variants") {
          formData.append("variants", JSON.stringify(product.variants));
        } else {
          formData.append(key, product[key]);
        }
      });

      images.forEach((img) => {
        formData.append("images", img);
      });

      const response = await axios.post(
        "http://localhost:5000/api/products",
        formData,
        {
          withCredentials: true, // 🔥 THIS FIXES AUTH
        }
      );

      toast.success("Product Created Successfully");
      console.log("✅ Product Created:", response.data);

    } catch (error) {
      console.error("🔥 Upload Error:", error);

      if (error.response) {
        toast.error(error.response.data.message || "Server error");
      } else if (error.request) {
        toast.error("Server not responding");
      } else {
        toast.error("Unexpected error occurred");
      }

    } finally {
      setLoading(false);
    }
  };

  /* =========================
     UI (UNCHANGED)
  ========================= */

  return (
    <div className="ss-add-product-container">
      <h2 className="ss-add-product-title">Add New Product</h2>

      <form onSubmit={handleSubmit} className="ss-add-product-form">

        <div className="ss-add-product-section">
          <h3>Basic Information</h3>
          <input name="name" placeholder="Product Name" required onChange={handleChange}/>
          <input name="brand" placeholder="Brand" onChange={handleChange}/>
          <select
            name="category"
            value={product.category}
            onChange={handleChange}
            required
          >
            <option value="">Select Category</option>
            <option value="Men">Men</option>
            <option value="Women">Women</option>
          </select>
          <input name="type" placeholder="Type" onChange={handleChange}/>
          <textarea name="description" placeholder="Description" onChange={handleChange}/>
        </div>

        <div className="ss-add-product-section">
          <h3>Pricing</h3>
          <input type="number" name="price" placeholder="Price" required onChange={handleChange}/>
          <input type="number" name="originalPrice" placeholder="Original Price" onChange={handleChange}/>
          <input
            type="number"
            name="discount"
            placeholder="Discount %"
            min="0"
            max="100"
            onChange={handleChange}
          />

          {product.price && (
            <p style={{ marginTop: "10px", fontWeight: "600" }}>
              Final Price: ₹{finalPrice}
            </p>
          )}
        </div>

        <div className="ss-add-product-section">
          <h3>Variants</h3>
          {product.variants.map((variant, index) => (
            <div key={index} className="ss-add-product-variant-row">
              <input
                type="number"
                placeholder="Size"
                required
                onChange={(e)=>handleVariantChange(index,"size",e.target.value)}
              />
              <input
                placeholder="Color"
                required
                onChange={(e)=>handleVariantChange(index,"color",e.target.value)}
              />
              <input
                type="number"
                placeholder="Stock"
                required
                onChange={(e)=>handleVariantChange(index,"stock",e.target.value)}
              />
            </div>
          ))}
          <button type="button" className="ss-add-product-variant-btn" onClick={addVariant}>
            + Add Variant
          </button>
        </div>

        <div className="ss-add-product-section">
          <h3>Upload Images</h3>
          <input type="file" multiple onChange={handleImageUpload} />
          <div className="ss-add-product-preview">
            {preview.map((img, index) => (
              <img key={index} src={img} alt="preview" />
            ))}
          </div>
        </div>

        <div className="ss-add-product-section ss-add-product-flags">
          <label>
            <input type="checkbox" name="isFeatured" onChange={handleChange}/>
            Featured
          </label>

          <label>
            <input type="checkbox" name="isNewArrival" onChange={handleChange}/>
            New Arrival
          </label>
        </div>

        <button
          type="submit"
          className="ss-add-product-submit-btn"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Product"}
        </button>

      </form>
    </div>
  );
}