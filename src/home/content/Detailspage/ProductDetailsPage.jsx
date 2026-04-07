import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Context } from "../../../registrationpage/loginpages/LogincontextV2";
import { getAssetUrl, request } from "../../../services/apiClient";
import formatCurrency from "../../../utilitis/formatCurrency";

const renderStars = (rating, className = "") =>
  Array.from({ length: 5 }, (_, index) => {
    const filled = index < Math.round(rating || 0);

    return (
      <Star
        key={`${className}-${index}`}
        size={16}
        className={`${className} ${filled ? "star-icon star-icon--filled" : "star-icon"}`.trim()}
        fill={filled ? "currentColor" : "none"}
      />
    );
  });

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, setCart } = useContext(Context) || {};

  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [editingReviewId, setEditingReviewId] = useState("");
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [savingReview, setSavingReview] = useState(false);

  const loadProduct = useCallback(async () => {
    try {
      setLoading(true);
      const data = await request(`/products/${id}`);
      setProduct(data);
      setMainImage(getAssetUrl(data.images?.[0]));
    } catch (error) {
      toast.error(error.message || "Unable to load product");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  useEffect(() => {
    if (!product?.variants?.length) {
      return;
    }

    setSelectedSize(product.variants[0].size);
  }, [product]);

  const sizes = useMemo(
    () => [...new Set((product?.variants || []).map((variant) => variant.size))],
    [product]
  );

  const colors = useMemo(
    () =>
      (product?.variants || []).filter((variant) => variant.size === selectedSize),
    [product, selectedSize]
  );

  useEffect(() => {
    if (colors.length) {
      setSelectedColor(colors[0].color);
    }
  }, [colors]);

  const selectedVariant = useMemo(
    () =>
      (product?.variants || []).find(
        (variant) => variant.size === selectedSize && variant.color === selectedColor
      ),
    [product, selectedColor, selectedSize]
  );

  const totalStock = useMemo(
    () => (product?.variants || []).reduce((total, variant) => total + (variant.stock || 0), 0),
    [product]
  );

  const handleAddToCart = async () => {
    if (!user) {
      toast.info("Please login to add items to cart");
      navigate("/login");
      return;
    }

    if (!selectedVariant) {
      toast.warning("Choose a valid size and color");
      return;
    }

    try {
      setAddingToCart(true);

      const updatedCart = await request("/cart", "POST", {
        productId: product._id,
        quantity: 1,
        size: selectedVariant.size,
        color: selectedVariant.color,
      });

      setCart(updatedCart);
      toast.success("Added to cart");
    } catch (error) {
      toast.error(error.message || "Unable to add item to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const resetReviewEditor = () => {
    setEditingReviewId("");
    setReviewRating(5);
    setReviewComment("");
  };

  const handleSubmitReview = async () => {
    if (!user) {
      toast.info("Please login to leave a review");
      navigate("/login");
      return;
    }

    if (!reviewComment.trim()) {
      toast.warning("Add a comment before submitting");
      return;
    }

    try {
      setSavingReview(true);

      await request(
        editingReviewId
          ? `/products/${product._id}/reviews/${editingReviewId}`
          : `/products/${product._id}/reviews`,
        editingReviewId ? "PUT" : "POST",
        {
          rating: reviewRating,
          comment: reviewComment.trim(),
        }
      );

      await loadProduct();
      toast.success(editingReviewId ? "Review updated" : "Review added");
      resetReviewEditor();
    } catch (error) {
      toast.error(error.message || "Unable to save review");
    } finally {
      setSavingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await request(`/products/${product._id}/reviews/${reviewId}`, "DELETE");
      await loadProduct();
      toast.success("Review deleted");
      if (editingReviewId === reviewId) {
        resetReviewEditor();
      }
    } catch (error) {
      toast.error(error.message || "Unable to delete review");
    }
  };

  const canManageReview = (review) => {
    if (!user) {
      return false;
    }

    const reviewUserId =
      typeof review.user === "object" && review.user !== null ? review.user._id : review.user;

    return String(reviewUserId) === String(user._id);
  };

  if (loading) {
    return (
      <section className="store-section store-loading-state">
        <div className="store-loader" />
        <p>Loading product details...</p>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="store-section store-empty-state">
        <h1>Product not found</h1>
        <p>This item may have been removed from the catalog.</p>
      </section>
    );
  }

  return (
    <div className="store-section product-detail-layout">
      <section className="product-gallery-panel">
        <div className="product-main-image-shell">
          <img src={mainImage} alt={product.name} className="product-main-image" />
        </div>

        <div className="product-thumbnail-row">
          {(product.images || []).map((image) => {
            const resolvedImage = getAssetUrl(image);

            return (
              <button
                key={resolvedImage}
                type="button"
                className={`product-thumbnail-button${resolvedImage === mainImage ? " product-thumbnail-button--active" : ""}`}
                onClick={() => setMainImage(resolvedImage)}
              >
                <img src={resolvedImage} alt={product.name} className="product-thumbnail-image" />
              </button>
            );
          })}
        </div>
      </section>

      <section className="product-summary-panel">
        <div className="product-summary-head">
          <p className="store-kicker">{(product.category || "Signature line").toUpperCase()}</p>
          <h1>{product.name}</h1>
          <p className="product-meta-line">
            {product.brand || "Sole Society"} {product.type ? `· ${product.type}` : ""}
          </p>
        </div>

        <div className="product-rating-row">
          <div className="product-stars">{renderStars(product.rating)}</div>
          <span>
            {(product.rating || 0).toFixed(1)} rating · {product.numReviews || 0} reviews
          </span>
        </div>

        <div className="product-price-row">
          <strong>{formatCurrency(product.price || 0)}</strong>
          {product.originalPrice ? <span>{formatCurrency(product.originalPrice)}</span> : null}
          {product.discount ? <p>{product.discount}% seasonal markdown</p> : null}
        </div>

        <p className="product-description">
          {product.description || "No description has been added for this product yet."}
        </p>

        <div className="product-trust-grid">
          <div>
            <Truck size={18} />
            <span>Fast dispatch</span>
          </div>
          <div>
            <ShieldCheck size={18} />
            <span>Secure checkout</span>
          </div>
          <div>
            <CheckCircle2 size={18} />
            <span>{totalStock > 0 ? `${totalStock} units available` : "Currently out of stock"}</span>
          </div>
        </div>

        {sizes.length ? (
          <div className="product-option-group">
            <p>Select size</p>
            <div className="product-chip-row">
              {sizes.map((size) => {
                const stockForSize = (product.variants || [])
                  .filter((variant) => variant.size === size)
                  .reduce((total, variant) => total + (variant.stock || 0), 0);

                return (
                  <button
                    key={size}
                    type="button"
                    className={`product-chip${selectedSize === size ? " product-chip--active" : ""}`}
                    onClick={() => setSelectedSize(size)}
                    disabled={stockForSize === 0}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {colors.length ? (
          <div className="product-option-group">
            <p>Select color</p>
            <div className="product-chip-row">
              {colors.map((variant) => (
                <button
                  key={`${variant.size}-${variant.color}`}
                  type="button"
                  className={`product-chip${selectedColor === variant.color ? " product-chip--active" : ""}`}
                  onClick={() => setSelectedColor(variant.color)}
                  disabled={variant.stock === 0}
                >
                  {variant.color}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="product-purchase-row">
          <div className="product-stock-card">
            <span>Availability</span>
            <strong>
              {selectedVariant?.stock > 0
                ? `${selectedVariant.stock} left in this variant`
                : "Select an available variant"}
            </strong>
          </div>

          <button
            type="button"
            className="store-primary-button"
            onClick={handleAddToCart}
            disabled={!selectedVariant || selectedVariant.stock === 0 || addingToCart}
          >
            <ShoppingBag size={16} />
            <span>
              {addingToCart
                ? "Adding..."
                : selectedVariant?.stock === 0
                  ? "Out of stock"
                  : "Add to cart"}
            </span>
          </button>
        </div>
      </section>

      <section className="store-section-card review-panel">
        <div className="review-panel-head">
          <div>
            <p className="store-kicker">Customer feedback</p>
            <h2>Reviews and impressions</h2>
          </div>
          <div className="product-rating-row">
            <div className="product-stars">{renderStars(product.rating, "product-stars")}</div>
            <span>{product.numReviews || 0} total</span>
          </div>
        </div>

        <div className="review-list">
          {(product.reviews || []).length ? (
            product.reviews.map((review) => (
              <article key={review._id} className="review-card">
                <div className="review-card-head">
                  <div>
                    <strong>
                      {typeof review.user === "object" && review.user?.username
                        ? review.user.username
                        : review.name}
                    </strong>
                    <div className="product-stars">{renderStars(review.rating)}</div>
                  </div>
                  <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>

                <p>{review.comment}</p>

                {canManageReview(review) ? (
                  <div className="review-card-actions">
                    <button
                      type="button"
                      className="store-secondary-button"
                      onClick={() => {
                        setEditingReviewId(review._id);
                        setReviewRating(review.rating);
                        setReviewComment(review.comment);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="store-ghost-danger"
                      onClick={() => handleDeleteReview(review._id)}
                    >
                      Delete
                    </button>
                  </div>
                ) : null}
              </article>
            ))
          ) : (
            <div className="store-empty-state store-empty-state--compact">
              <h3>No reviews yet</h3>
              <p>Be the first customer to share how this pair feels in real life.</p>
            </div>
          )}
        </div>

        <div className="review-editor">
          <h3>{editingReviewId ? "Edit your review" : "Leave a review"}</h3>

          <div className="review-star-picker">
            {Array.from({ length: 5 }, (_, index) => {
              const ratingValue = index + 1;
              const active = ratingValue <= reviewRating;

              return (
                <button
                  key={ratingValue}
                  type="button"
                  className={`review-star-button${active ? " review-star-button--active" : ""}`}
                  onClick={() => setReviewRating(ratingValue)}
                >
                  <Star size={18} fill={active ? "currentColor" : "none"} />
                </button>
              );
            })}
          </div>

          <textarea
            rows="4"
            value={reviewComment}
            onChange={(event) => setReviewComment(event.target.value)}
            placeholder="Describe fit, comfort, quality, or styling notes."
          />

          <div className="review-editor-actions">
            {editingReviewId ? (
              <button type="button" className="store-secondary-button" onClick={resetReviewEditor}>
                Cancel edit
              </button>
            ) : null}
            <button
              type="button"
              className="store-primary-button"
              onClick={handleSubmitReview}
              disabled={savingReview}
            >
              {savingReview ? "Saving..." : editingReviewId ? "Update review" : "Submit review"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
