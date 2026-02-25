import React, { useContext, useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Details.css";
import { Context } from "../../../registrationpage/loginpages/Logincontext";
import { toast } from "react-toastify";
import { request } from "../../../services/api";

function Details() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, cart, setCart } = useContext(Context);

  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);

  /* ================= FETCH PRODUCT ================= */

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await request(`/products/${id}`);
        setProduct(data);
        setMainImage(data.images?.[0] || "/placeholder.png");
      } catch (err) {
        toast.error("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  /* ================= AUTO SELECT FIRST SIZE ================= */

  useEffect(() => {
    if (product?.variants?.length > 0) {
      const firstSize = product.variants[0].size;
      setSelectedSize(firstSize);
    }
  }, [product]);

  /* ================= DERIVED VALUES ================= */

  const sizes = useMemo(() => {
    if (!product?.variants) return [];
    return [...new Set(product.variants.map(v => v.size))];
  }, [product]);

  const colors = useMemo(() => {
    if (!product?.variants || !selectedSize) return [];
    return product.variants
      .filter(v => v.size === selectedSize)
      .map(v => v.color);
  }, [product, selectedSize]);

  /* AUTO SELECT FIRST COLOR WHEN SIZE CHANGES */
  useEffect(() => {
    if (colors.length > 0) {
      setSelectedColor(colors[0]);
    }
  }, [colors]);

  const selectedVariant = useMemo(() => {
    if (!product?.variants) return null;
    return product.variants.find(
      v => v.size === selectedSize && v.color === selectedColor
    );
  }, [product, selectedSize, selectedColor]);

  /* ================= SAFE INCART CHECK ================= */

  const inCart = useMemo(() => {
    if (!cart?.items || !product) return false;

    return cart.items.some(item => {
      const itemProductId =
        typeof item.product === "object"
          ? item.product._id
          : item.product;

      return (
        itemProductId === product._id &&
        item.size === selectedSize &&
        item.color === selectedColor
      );
    });
  }, [cart, product, selectedSize, selectedColor]);

  /* ================= ADD TO CART ================= */

  const handleAddToCart = async () => {
    if (!user?.token) {
      setShowLoginModal(true);
      return;
    }

    if (!selectedVariant) {
      toast.warning("Please select size and color");
      return;
    }

    if (selectedVariant.stock <= 0) {
      toast.error("Out of stock");
      return;
    }

    try {
      setAdding(true);

      const updatedCart = await request(
        "/cart",
        "POST",
        {
          productId: product._id,
          quantity: 1,
          size: selectedSize,
          color: selectedColor,
        },
        user.token
      );

      setCart(updatedCart);
      toast.success("Added to cart!");
    } catch (err) {
      toast.error(err.message || "Failed to add to cart");
    } finally {
      setAdding(false);
    }
  };

  /* ================= LOADING ================= */

  if (loading)
    return <h2 style={{ textAlign: "center" }}>Loading...</h2>;

  if (!product)
    return <h2 style={{ textAlign: "center" }}>Product not found</h2>;

  /* ================= UI ================= */

  return (
    <div className="unique-details">
      {/* LEFT SIDE */}
      <div className="details-left">
        <img
          src={mainImage}
          alt={product.name}
          className="details-image"
        />

        {product.images?.length > 1 && (
          <div className="details-thumbnails">
            {product.images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`thumb-${index}`}
                className={`details-thumb ${
                  mainImage === img ? "active-thumb" : ""
                }`}
                onClick={() => setMainImage(img)}
              />
            ))}
          </div>
        )}
      </div>

      {/* RIGHT SIDE */}
      <div className="details-right">
        <h1 className="details-title">{product.name}</h1>
        <p className="details-brand">{product.brand}</p>

        <div className="price-section">
          <span className="price">₹{product.price}</span>

          {product.originalPrice && (
            <span className="original-price">
              ₹{product.originalPrice}
            </span>
          )}

          {product.discount > 0 && (
            <span className="discount">
              {product.discount}% OFF
            </span>
          )}
        </div>

        <p className="rating">
          ⭐ {product.rating} ({product.reviews} reviews)
        </p>

        {/* SIZE */}
        <div className="variant-section">
          <p>Select Size:</p>
          <div className="variant-options">
            {sizes.map(size => (
              <button
                key={size}
                className={`variant-btn ${
                  selectedSize === size ? "active" : ""
                }`}
                onClick={() => setSelectedSize(size)}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* COLOR */}
        <div className="variant-section">
          <p>Select Color:</p>
          <div className="variant-options">
            {colors.map(color => (
              <button
                key={color}
                className={`variant-btn ${
                  selectedColor === color ? "active" : ""
                }`}
                onClick={() => setSelectedColor(color)}
              >
                {color}
              </button>
            ))}
          </div>
        </div>

        {/* STOCK */}
        {selectedVariant && (
          <p
            className={
              selectedVariant.stock <= 5
                ? "low-stock"
                : "in-stock"
            }
          >
            {selectedVariant.stock > 0
              ? `Only ${selectedVariant.stock} left`
              : "Out of stock"}
          </p>
        )}

        <p className="details-description">
          {product.description}
        </p>

        <div className="cart-buttons">
          {inCart ? (
            <button
              className="go-cart-btn"
              onClick={() => navigate("/cart")}
            >
              🛒 Go to Cart
            </button>
          ) : (
            <button
              className="add-cart-btn"
              onClick={handleAddToCart}
              disabled={
                adding ||
                !selectedVariant ||
                selectedVariant.stock === 0
              }
            >
              {adding ? "Adding..." : "Add to Cart"}
            </button>
          )}
        </div>
      </div>

      {/* LOGIN MODAL */}
      {showLoginModal && (
        <div className="modal-overlay">
          <div className="login-modal">
            <h3>Login Required</h3>
            <p>Please login to add items to cart.</p>
            <div className="modal-actions">
              <button onClick={() => setShowLoginModal(false)}>
                Cancel
              </button>
              <button onClick={() => navigate("/login")}>
                Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Details;