import { useEffect, useState, useContext, useMemo } from "react";
import { Link } from "react-router-dom";
import "./women.css";
import { WishlistContext } from "../../../registrationpage/wishlisht/wishlistcontext";
import { Context as Logincontext } from "../../../registrationpage/loginpages/Logincontext";
import { request } from "../../../services/api";
import { toast } from "react-toastify";

export default function Women() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const BASE_URL = "http://localhost:5000"; // 🔥 Added

  const { user } = useContext(Logincontext);
  const {
    wishlist = [],
    addToWishlist,
    removeFromWishlist,
    fetchWishlist,
  } = useContext(WishlistContext);

  useEffect(() => {
    const fetchWomen = async () => {
      try {
        setLoading(true);
        const products = await request("/products?category=women");
        setData(products || []);
      } catch (err) {
        setError("Failed to load women's products");
      } finally {
        setLoading(false);
      }
    };

    fetchWomen();
  }, []);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user, fetchWishlist]);

  const wishlistIds = useMemo(
    () => new Set(wishlist.map((w) => w._id)),
    [wishlist]
  );

  const isInWishlist = (id) => wishlistIds.has(id);

  const filteredProducts = useMemo(() => {
    let result = data.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortOption === "lowtohigh") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOption === "hightolow") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [data, searchTerm, sortOption]);

  const toggleWishlist = async (product) => {
    if (!user) {
      toast.info("Please login first");
      return;
    }

    try {
      if (isInWishlist(product._id)) {
        await removeFromWishlist(product._id);
      } else {
        await addToWishlist(product);
      }
    } catch (err) {
      toast.error("Wishlist update failed");
    }
  };

  return (
    <div className="women-container">
      <h2 className="women-title">Women's Collection</h2>

      <div className="controls">
        <input
          type="text"
          placeholder="Search women's products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <select
          className="sort-dropdown"
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="">Sort By Price</option>
          <option value="lowtohigh">Low to High</option>
          <option value="hightolow">High to Low</option>
        </select>
      </div>

      {loading ? (
        <p className="loading-text">Loading...</p>
      ) : error ? (
        <p className="error-text">{error}</p>
      ) : filteredProducts.length === 0 ? (
        <p className="no-products">No products found</p>
      ) : (
        <div className="women-grid">
          {filteredProducts.map((item) => (
            <div key={item._id} className="product-card">
              <button
                className={`wishlist-button ${
                  isInWishlist(item._id) ? "active" : ""
                }`}
                onClick={() => toggleWishlist(item)}
              >
                {isInWishlist(item._id) ? "♥" : "♡"}
              </button>

              <Link to={`/product/${item._id}`}>
                <div className="product-image-container">
                  <img
                    src={
                      item.images?.[0]
                        ? `${BASE_URL}${item.images[0]}`
                        : "placeholder.jpg"
                    }
                    alt={item.name}
                    className="product-image"
                  />
                </div>
                <h3 className="product-name">{item.name}</h3>
                <p className="product-brand">{item.brand}</p>
                <p className="product-price">₹{item.price}</p>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}