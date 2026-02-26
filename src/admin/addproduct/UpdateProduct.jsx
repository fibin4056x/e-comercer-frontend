import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./UpdateProduct.css";

axios.defaults.withCredentials = true;

export default function UpdateProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [preview, setPreview] = useState([]);

  const [product, setProduct] = useState({
    name: "",
    brand: "",
    category: "",
    type: "",
    description: "",
    price: "",
    originalPrice: "",
    discount: 0,
    variants: [],
    isFeatured: false,
    isNewArrival: false,
  });

  /* ================= FETCH PRODUCT ================= */

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/products/${id}`
        );

        setProduct({
          ...res.data,
          variants: res.data.variants || [],
        });

        if (res.data.images?.length > 0) {
          setPreview(
            res.data.images.map(
              (img) => `http://localhost:5000${img}`
            )
          );
        }

      } catch (err) {
        console.error(err);
        toast.error("Failed to load product");
      }
    };

    fetchProduct();
  }, [id]);

  /* ================= HANDLERS ================= */

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setProduct({
      ...product,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleVariantChange = (index, field, value) => {
    const updated = [...product.variants];
    updated[index][field] =
      field === "stock" ? Number(value) : value;

    setProduct({ ...product, variants: updated });
  };

  const addVariant = () => {
    setProduct({
      ...product,
      variants: [
        ...product.variants,
        { size: "", color: "", stock: 0 },
      ],
    });
  };

  const removeVariant = (index) => {
    const updated = product.variants.filter(
      (_, i) => i !== index
    );
    setProduct({ ...product, variants: updated });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);

    const previews = files.map((file) =>
      URL.createObjectURL(file)
    );
    setPreview(previews);
  };

  const finalPrice = useMemo(() => {
    const price = Number(product.price) || 0;
    const discount = Number(product.discount) || 0;
    return Math.max(
      0,
      price - (price * discount) / 100
    );
  }, [product.price, product.discount]);

  /* ================= UPDATE ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const formData = new FormData();

      Object.keys(product).forEach((key) => {
        if (key === "variants") {
          formData.append(
            "variants",
            JSON.stringify(product.variants)
          );
        } else {
          formData.append(key, product[key]);
        }
      });

      images.forEach((img) => {
        formData.append("images", img);
      });

      await axios.put(
        `http://localhost:5000/api/products/${id}`,
        formData
      );

      toast.success("Product updated successfully");
      navigate("/admin/products");

    } catch (error) {
      console.error(error);
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (!product) return <h2>Loading...</h2>;

  return (
    <div className="update-wrapper">
      <form onSubmit={handleSubmit} className="update-card">

        <h2>Update Product</h2>

        {/* BASIC INFO */}
        <div className="section">
          <h3>Basic Information</h3>

          <input
            name="name"
            value={product.name}
            onChange={handleChange}
            placeholder="Product Name"
          />

          <input
            name="brand"
            value={product.brand}
            onChange={handleChange}
            placeholder="Brand"
          />

          <select
            name="category"
            value={product.category}
            onChange={handleChange}
          >
            <option value="">Select Category</option>
            <option value="Men">Men</option>
            <option value="Women">Women</option>
          </select>

          <input
            name="type"
            value={product.type}
            onChange={handleChange}
            placeholder="Type"
          />

          <textarea
            name="description"
            value={product.description}
            onChange={handleChange}
            placeholder="Description"
          />
        </div>

        {/* PRICING */}
        <div className="section">
          <h3>Pricing</h3>

          <input
            type="number"
            name="price"
            value={product.price}
            onChange={handleChange}
            placeholder="Price"
          />

          <input
            type="number"
            name="originalPrice"
            value={product.originalPrice}
            onChange={handleChange}
            placeholder="Original Price"
          />

          <input
            type="number"
            name="discount"
            value={product.discount}
            onChange={handleChange}
            placeholder="Discount %"
          />

          <p className="final-price">
            Final Price: ₹{finalPrice}
          </p>
        </div>

        {/* VARIANTS */}
        <div className="section">
          <h3>Variants</h3>

          {product.variants.map((variant, index) => (
            <div key={index} className="variant-row">
              <input
                value={variant.size}
                onChange={(e) =>
                  handleVariantChange(
                    index,
                    "size",
                    e.target.value
                  )
                }
                placeholder="Size"
              />

              <input
                value={variant.color}
                onChange={(e) =>
                  handleVariantChange(
                    index,
                    "color",
                    e.target.value
                  )
                }
                placeholder="Color"
              />

              <input
                type="number"
                value={variant.stock}
                onChange={(e) =>
                  handleVariantChange(
                    index,
                    "stock",
                    e.target.value
                  )
                }
                placeholder="Stock"
              />

              <button
                type="button"
                onClick={() => removeVariant(index)}
                className="remove-btn"
              >
                ✕
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addVariant}
            className="add-variant"
          >
            + Add Variant
          </button>
        </div>

        {/* IMAGES */}
        <div className="section">
          <h3>Images</h3>

          <input
            type="file"
            multiple
            onChange={handleImageUpload}
          />

          <div className="preview-grid">
            {preview.map((img, i) => (
              <img key={i} src={img} alt="preview" />
            ))}
          </div>
        </div>

        {/* FLAGS */}
        <div className="section flags">
          <label>
            <input
              type="checkbox"
              name="isFeatured"
              checked={product.isFeatured}
              onChange={handleChange}
            />
            Featured
          </label>

          <label>
            <input
              type="checkbox"
              name="isNewArrival"
              checked={product.isNewArrival}
              onChange={handleChange}
            />
            New Arrival
          </label>
        </div>

        <button
          type="submit"
          className="update-btn"
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Product"}
        </button>

      </form>
    </div>
  );
}