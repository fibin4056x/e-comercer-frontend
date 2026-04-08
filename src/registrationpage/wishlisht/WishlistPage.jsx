import React, { useContext } from "react";
import { Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import SmartImage from "../../components/SmartImage";
import { WishlistContext } from "./wishlistcontextV2";
import formatCurrency from "../../utilitis/formatCurrency";
import "./wishlist.css";

function WishlistPage() {
  const { wishlist = [], removeFromWishlist, loading, error } = useContext(WishlistContext);

  const handleRemove = async (productId) => {
    try {
      await removeFromWishlist(productId);
      toast.success("Removed from wishlist");
    } catch (removeError) {
      toast.error(removeError.message || "Failed to remove item");
    }
  };

  if (loading) {
    return <div className="wishlist-loading">Loading wishlist...</div>;
  }

  if (error) {
    return <div className="wishlist-empty">{error}</div>;
  }

  if (!wishlist.length) {
    return (
      <section className="wishlist-wrapper wishlist-empty">
        <h2>Your wishlist is empty</h2>
        <p>Browse the catalog and save the pairs you want to revisit later.</p>
        <Link to="/" className="wishlist-remove-btn">
          Browse products
        </Link>
      </section>
    );
  }

  return (
    <div className="wishlist-wrapper">
      <div className="wishlist-hero">
        <div>
          <p className="store-kicker">Saved edit</p>
          <h1 className="wishlist-heading">My Wishlist</h1>
          <p className="wishlist-subtitle">
            Keep a polished shortlist of styles you plan to revisit, compare, or buy later.
          </p>
        </div>
        <div className="wishlist-stat-card">
          <span>Saved products</span>
          <strong>{wishlist.length}</strong>
        </div>
      </div>

      <div className="wishlist-grid">
        {wishlist.map((item) => (
          <div key={item._id} className="wishlist-card">
            <Link to={`/product/${item._id}`} className="wishlist-link">
              <div className="wishlist-image-wrapper">
                <SmartImage
                  assetPath={item.images?.[0]}
                  alt={item.name}
                  className="wishlist-image"
                  loading="lazy"
                  decoding="async"
                />
              </div>

              <h2 className="wishlist-title">{item.name}</h2>
            </Link>

            <p className="wishlist-price">{formatCurrency(item.price)}</p>

            <button
              type="button"
              onClick={() => handleRemove(item._id)}
              className="wishlist-remove-btn"
            >
              <Trash2 size={16} />
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WishlistPage;
