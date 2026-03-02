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
const [reviewRating, setReviewRating] = useState(0);
const [reviewComment, setReviewComment] = useState("");
const [editingReviewId, setEditingReviewId] = useState(null);
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
      } catch {
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
    return product.variants.filter(v => v.size === selectedSize);
  }, [product, selectedSize]);

  useEffect(() => {
    if (colors.length > 0) {
      setSelectedColor(colors[0].color);
    }
  }, [colors]);

  const selectedVariant = useMemo(() => {
    if (!product?.variants) return null;
    return product.variants.find(
      v => v.size === selectedSize && v.color === selectedColor
    );
  }, [product, selectedSize, selectedColor]);

  /* ================= ADD TO CART ================= */

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Login required");
      return;
    }

    if (!selectedVariant) {
      toast.warning("Select size and color");
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
      toast.success("Added to cart");
    } catch (err) {
      toast.error(err.message || "Failed");
    } finally {
      setAdding(false);
    }
  };
/* ================= REVIEW ACTIONS ================= */

const submitReview = async () => {
  if (!user) {
    toast.error("Login required");
    return;
  }

  if (!reviewRating || !reviewComment.trim()) {
    toast.error("Add rating and comment");
    return;
  }

  try {
    if (editingReviewId) {
      await request(
        `/products/${product._id}/reviews/${editingReviewId}`,
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
      toast.success("Review added");
    }

    const updated = await request(`/products/${id}`);
    setProduct(updated);

    setReviewRating(0);
    setReviewComment("");
    setEditingReviewId(null);

  } catch (err) {
    toast.error(err.message || "Review action failed");
  }
};

const deleteReview = async (reviewId) => {
  try {
    await request(
      `/products/${product._id}/reviews/${reviewId}`,
      "DELETE"
    );

    toast.success("Review deleted");

    const updated = await request(`/products/${id}`);
    setProduct(updated);

  } catch (err) {
    toast.error("Failed to delete review");
  }
};

const renderStars = (rating = 0) =>
  [...Array(5)].map((_, i) => (
    <span key={i}>
      {i < Math.round(rating) ? "★" : "☆"}
    </span>
  ));
  if (loading) return <h2 style={{ textAlign: "center" }}>Loading...</h2>;
  if (!product) return <h2 style={{ textAlign: "center" }}>Not Found</h2>;

  return (
    <div className="unique-details">
    <div className="details-left">
  <div className="main-image-wrapper">
    <img
      src={mainImage}
      alt={product.name}
      className="details-image premium-image"
      key={mainImage}
    />
  </div>

  {product.images?.length > 1 && (
    <div className="thumbnail-row">
      {product.images.map((img, index) => {
        const fullImg = `${BASE_URL}${img}`;
        return (
          <div
            key={index}
            className={`thumb-wrapper ${
              mainImage === fullImg ? "active-thumb" : ""
            }`}
            onClick={() => setMainImage(fullImg)}
          >
            <img
              src={fullImg}
              alt="thumbnail"
              className="thumbnail"
            />
          </div>
        );
      })}
    </div>
  )}
</div>

      <div className="details-right">
        <h1>{product.name}</h1>
        <p>{product.brand}</p>
        <h2>₹{product.price}</h2>

        {/* ================= SIZE SELECT ================= */}
        {sizes.length > 0 && (
          <div className="variant-section">
            <h4>Select Size</h4>
            <div className="variant-options">
              {sizes.map(size => {
                const sizeStock = product.variants
                  .filter(v => v.size === size)
                  .reduce((sum, v) => sum + v.stock, 0);

                return (
                  <button
                    key={size}
                    disabled={sizeStock === 0}
                    className={`variant-btn ${
                      selectedSize === size ? "active-variant" : ""
                    }`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size} ({sizeStock})
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= COLOR SELECT ================= */}
        {colors.length > 0 && (
          <div className="variant-section">
            <h4>Select Color</h4>
            <div className="variant-options">
              {colors.map(v => (
                <button
                  key={v.color}
                  disabled={v.stock === 0}
                  className={`variant-btn ${
                    selectedColor === v.color ? "active-variant" : ""
                  }`}
                  onClick={() => setSelectedColor(v.color)}
                >
                  {v.color} ({v.stock})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ================= SELECTED STOCK ================= */}
        {selectedVariant && (
          <p className="stock-info">
            {selectedVariant.stock > 0
              ? `In Stock: ${selectedVariant.stock}`
              : "Out of Stock"}
          </p>
        )}

        <button
          className="add-cart-btn"
          onClick={handleAddToCart}
          disabled={!selectedVariant || selectedVariant.stock === 0}
        >
          {selectedVariant?.stock === 0
            ? "Out of Stock"
            : adding
            ? "Adding..."
            : "Add to Cart"}
        </button>
      </div>
      {/* ================= REVIEWS SECTION ================= */}

<div className="review-section">

  <h3 className="review-title">
    Reviews ({product.reviews?.length || 0})
  </h3>

  {/* Average Rating */}
  <div className="review-average">
    <div className="stars">
      {renderStars(product.rating)}
    </div>
    <span>{product.rating?.toFixed(1) || 0} / 5</span>
  </div>

  {/* Review List */}
  {product.reviews?.length > 0 ? (
    product.reviews.map((rev) => (
      <div key={rev._id} className="review-card">
        <div className="review-header">
          <strong>{rev.name}</strong>
          <div>{renderStars(rev.rating)}</div>
        </div>

        <p className="review-comment">{rev.comment}</p>

       {user &&
  (rev.user === user._id ||
   rev.user?._id === user._id ||
   rev.user?.toString() === user._id) &&  (
          <div className="review-actions">
            <button
              onClick={() => {
                setEditingReviewId(rev._id);
                setReviewRating(rev.rating);
                setReviewComment(rev.comment);
              }}
              className="edit-review-btn"
            >
              Edit
            </button>

            <button
              onClick={() => deleteReview(rev._id)}
              className="delete-review-btn"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    ))
  ) : (
    <p className="no-review">No reviews yet</p>
  )}

  {/* Add / Edit Review */}
  {user && (
    <div className="review-form">
      <h4>{editingReviewId ? "Edit Review" : "Write Review"}</h4>

      <div className="star-select">
        {[1,2,3,4,5].map((star) => (
          <span
            key={star}
            onClick={() => setReviewRating(star)}
            className={`star ${
              star <= reviewRating ? "active-star" : ""
            }`}
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
        className="submit-review-btn"
      >
        {editingReviewId ? "Update Review" : "Submit Review"}
      </button>
    </div>
  )}

</div>
    </div>
  );
}

export default Details;