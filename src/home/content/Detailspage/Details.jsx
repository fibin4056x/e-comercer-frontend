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

  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");

  const BASE_URL = "http://localhost:5000";

  /* ================= FETCH PRODUCT ================= */

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await request(`/products/${id}`);
        setProduct(data);

        setMainImage(
          data.images?.[0]
            ? `${BASE_URL}${data.images[0]}`
            : "/placeholder.png"
        );
      } catch (err) {
        toast.error("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  /* ================= VARIANTS ================= */

  useEffect(() => {
    if (product?.variants?.length > 0) {
      setSelectedSize(product.variants[0].size);
    }
  }, [product]);

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
    if (!user) {
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
        }
      );

      setCart(updatedCart);
      toast.success("Added to cart!");
    } catch (err) {
      toast.error(err.message || "Failed to add to cart");
    } finally {
      setAdding(false);
    }
  };

  /* ================= REVIEW LOGIC ================= */

  const renderStars = (rating = 0) => {
    return [...Array(5)].map((_, i) => (
      <span key={i}>
        {i < Math.round(rating) ? "★" : "☆"}
      </span>
    ));
  };

  const submitReview = async () => {
    if (!user) {
      toast.error("Login required");
      return;
    }

    if (!reviewRating || !reviewComment.trim()) {
      toast.error("Please add rating and comment");
      return;
    }

    try {
      const hasReviewed =
        Array.isArray(product.reviews) &&
        product.reviews.some(
          (rev) => rev.user && rev.user._id === user._id
        );

      if (hasReviewed) {
        await request(
          `/products/${product._id}/reviews`,
          "PUT",
          { rating: reviewRating, comment: reviewComment }
        );
        toast.success("Review updated");
      } else {
        await request(
          `/products/${product._id}/reviews`,
          "POST",
          { rating: reviewRating, comment: reviewComment }
        );
        toast.success("Review submitted");
      }

      const updated = await request(`/products/${id}`);
      setProduct(updated);

      setReviewRating(0);
      setReviewComment("");

    } catch (err) {
      toast.error(err.message || "Action failed");
    }
  };

  if (loading)
    return <h2 style={{ textAlign: "center" }}>Loading...</h2>;

  if (!product)
    return <h2 style={{ textAlign: "center" }}>Product not found</h2>;

  /* ================= UI ================= */

  return (
    <div className="unique-details">
      <div className="details-left">
        <img
          src={mainImage}
          alt={product.name}
          className="details-image"
        />
      </div>

      <div className="details-right">
        <h1 className="details-title">{product.name}</h1>
        <p className="details-brand">{product.brand}</p>

        <div className="price-section">
          <span className="price">₹{product.price}</span>
        </div>

        <div className="rating">
          <div className="stars">
            {renderStars(product.rating)}
          </div>
          <span>
            {product.rating?.toFixed(1)} (
            {Array.isArray(product.reviews)
              ? product.reviews.length
              : 0} reviews)
          </span>
        </div>

        {/* Review List */}
        <div className="review-list">
          <h3>Customer Reviews</h3>

          {Array.isArray(product.reviews) &&
            product.reviews.length === 0 && (
              <p>No reviews yet</p>
          )}

          {Array.isArray(product.reviews) &&
            product.reviews.map((rev) => {
              const isOwner =
                user && rev.user && rev.user._id === user._id;

              return (
                <div key={rev._id} className="review-item">
                  <div className="review-header">
                    <strong>{rev.name}</strong>
                    <div>
                      {"★".repeat(rev.rating)}
                      {"☆".repeat(5 - rev.rating)}
                    </div>
                  </div>

                  <p>{rev.comment}</p>

                  {isOwner && (
                    <div className="review-actions">
                      <button
                        className="edit-review-btn"
                        onClick={() => {
                          setReviewRating(rev.rating);
                          setReviewComment(rev.comment);
                        }}
                      >
                        Edit
                      </button>

                      <button
                        className="delete-review-btn"
                        onClick={async () => {
                          try {
                            await request(
                              `/products/${product._id}/reviews`,
                              "DELETE"
                            );
                            const updated = await request(`/products/${id}`);
                            setProduct(updated);
                            toast.success("Review removed");
                          } catch {
                            toast.error("Delete failed");
                          }
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              );
          })}
        </div>

        {/* Review Form */}
        <div className="review-section">
          <h3>Write a Review</h3>

          <div className="star-select">
            {[1,2,3,4,5].map((star) => (
              <span
                key={star}
                onClick={() => setReviewRating(star)}
                style={{
                  cursor: "pointer",
                  fontSize: "20px",
                  color: star <= reviewRating ? "#f5a623" : "#ccc"
                }}
              >
                ★
              </span>
            ))}
          </div>

          <textarea
            placeholder="Write your review..."
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
          />

          <button
            onClick={submitReview}
            className="premium-review-btn"
          >
            Submit Review
          </button>
        </div>

        <div className="cart-buttons">
          <button
            className="add-cart-btn"
            onClick={handleAddToCart}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default Details;