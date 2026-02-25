import React, { useContext, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { WishlistContext } from "./wishlistcontext";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "./wishlist.css";

function Wishlist() {
  const {
    wishlist = [],
    removeFromWishlist,
    loading,
    error,
  } = useContext(WishlistContext);

  /* =============================
     DEBUG LOGS
  ============================== */
  useEffect(() => {
    console.log("📦 Wishlist Data:", wishlist);
    if (error) {
      console.error("🔥 Wishlist Error:", error);
    }
  }, [wishlist, error]);

  const handleRemove = async (productId) => {
    try {
      console.log("❌ Removing from wishlist:", productId);
      await removeFromWishlist(productId);
      toast.success("Removed from wishlist");
    } catch (err) {
      console.error("🔥 Remove error:", err);
      toast.error("Failed to remove item");
    }
  };

  if (loading) {
    return <div className="wishlist-loading">Loading wishlist...</div>;
  }

  if (!wishlist || wishlist.length === 0) {
    return (
      <div className="wishlist-empty">
        <h2>Your Wishlist is Empty ❤️</h2>
        <p>Browse products and add your favorites.</p>
      </div>
    );
  }

  return (
    <div className="wishlist-wrapper">
      <h1 className="wishlist-heading">My Wishlist</h1>

      <div className="wishlist-grid">
        {wishlist.map((item) => (
          <div key={item._id} className="wishlist-card">

            <Link
              to={`/product/${item._id}`}
              className="wishlist-link"
            >
              <div className="wishlist-image-wrapper">
                <img
                  src={
                    item.images?.[0] ||
                    "https://via.placeholder.com/300"
                  }
                  alt={item.name}
                  className="wishlist-image"
                />
              </div>

              <h2 className="wishlist-title">
                {item.name}
              </h2>
            </Link>

            <p className="wishlist-price">
              ₹{item.price}
            </p>

            <button
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

export default Wishlist;