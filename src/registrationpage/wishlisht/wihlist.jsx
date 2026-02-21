import React, { useContext } from "react";
import { Trash2 } from "lucide-react";
import { WishlistContext } from "./wishlistcontext";
import { Link } from "react-router-dom"; 
import "./wishlist.css";

function Wishlist() {
  const { wishlist, removeFromWishlist } = useContext(WishlistContext);

  if (!wishlist || wishlist.length === 0) {
    return (
      <div className="wishlist-empty">
        Your wishlist is empty ❤️
      </div>
    );
  }

  return (
    <div className="wishlist-container">
      {wishlist.map((item) => (
        <div key={item.id} className="wishlist-card">
 
          <Link to={`/product/${item.id}`} className="wishlist-link">
            <img
              src={item.images}
              alt={item.name}
              className="wishlist-image"
            />
            <h2 className="wishlist-title">{item.name}</h2>
          </Link>

          <p className="wishlist-price">₹{item.price}</p>

          <button
            onClick={() => removeFromWishlist(item.id)}
            className="wishlist-remove-btn"
          >
            <Trash2 size={18} />
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}

export default Wishlist;
