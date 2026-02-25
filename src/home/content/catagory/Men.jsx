import { useEffect, useState, useContext, useMemo } from "react";
import { Link } from "react-router-dom";
import "./men.css";
import { WishlistContext } from "../../../registrationpage/wishlisht/wishlistcontext";
import { Context as Logincontext } from "../../../registrationpage/loginpages/Logincontext";
import { request } from "../../../services/api";
import { toast } from "react-toastify";

export default function Men() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { user } = useContext(Logincontext);
  const {
    wishlist = [],
    addToWishlist,
    removeFromWishlist,
    fetchWishlist,
  } = useContext(WishlistContext);

  /* ================= FETCH MEN PRODUCTS ================= */
  useEffect(() => {
    const fetchMen = async () => {
      try {
        console.log("📦 Fetching MEN products...");
        setLoading(true);

        const products = await request("/products?category=men");

        console.log("✅ MEN loaded:", products.length);
        setData(products || []);
      } catch (err) {
        console.error("🔥 MEN fetch error:", err);
        setError("Failed to load men's products");
      } finally {
        setLoading(false);
      }
    };

    fetchMen();
  }, []);

  /* ================= FETCH WISHLIST ================= */
  useEffect(() => {
    if (user?.token) {
      fetchWishlist();
    }
  }, [user, fetchWishlist]);

  /* ================= OPTIMIZED LOOKUP ================= */
  const wishlistIds = useMemo(
    () => new Set(wishlist.map((w) => w._id)),
    [wishlist]
  );

  const isInWishlist = (id) => wishlistIds.has(id);

  /* ================= FILTER + SORT ================= */
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

  /* ================= TOGGLE WISHLIST ================= */
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
      console.error("🔥 Wishlist error:", err);
      toast.error("Wishlist update failed");
    }
  };

  /* ================= UI ================= */
  return (
    <div className="men-container">
      <h2 className="men-title">Men's Collection</h2>

      <div className="controls">
        <input
          type="text"
          placeholder="Search men's products..."
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
        <div className="men-grid">
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
                    src={item.images?.[0] || "placeholder.jpg"}
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