import { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./Home.css";
import { Context as Logincontext } from "../registrationpage/loginpages/Logincontext";
import { WishlistContext } from "../registrationpage/wishlisht/wishlistcontext";
import { Search } from "lucide-react";
import { toast } from "react-toastify";
import { request } from "../services/api";

export default function Home() {

  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [cardStyles, setCardStyles] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [wishlistLoading, setWishlistLoading] = useState(null);

  const { user } = useContext(Logincontext) || {};

  const {
    wishlist = [],
    addToWishlist,
    removeFromWishlist,
    fetchWishlist
  } = useContext(WishlistContext) || {};

  /* =========================
     FETCH PRODUCTS
  ========================= */


useEffect(() => {
  const fetchProducts = async () => {
    try {
      console.log("📦 Fetching products...");
      setLoading(true);

      const res = await request("/products");

      // Log this to your browser console to verify the structure
      console.log("API response:", res);

      /**
       * FIX: Your backend returns an object like { products: [], pages: 1... }
       * We need to drill into 'products' correctly.
       */
      const productsData = res?.products || res?.data?.products || res?.data || res;

      // Ensure we only set the state if we found an actual array
      if (Array.isArray(productsData)) {
        console.log("✅ Products loaded:", productsData.length);
        setData(productsData);
      } else if (res && typeof res === 'object' && Array.isArray(res.products)) {
        setData(res.products);
      } else {
        console.error("❌ Array not found. Structure is:", res);
        setData([]);
      }

    } catch (err) {
      console.error("🔥 Product Fetch Error:", err);
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  fetchProducts();
}, []);

  /* =========================
     FETCH WISHLIST WHEN USER LOGS IN
  ========================= */

  useEffect(() => {

    if (user) {

      console.log("❤️ Fetching wishlist...");
      fetchWishlist();

    }

  }, [user]);

  /* =========================
     CURSOR ANIMATION
  ========================= */

  useEffect(() => {

    const handleMouseMove = (e) => {
      setCursorPos({
        x: e.clientX,
        y: e.clientY
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };

  }, []);

  /* =========================
     OPTIMIZED WISHLIST LOOKUP
  ========================= */

  const wishlistIds = useMemo(() => {
    return new Set(wishlist.map((w) => w._id));
  }, [wishlist]);

  const isInWishlist = (productId) => {
    return wishlistIds.has(productId);
  };

  /* =========================
     FILTER + SORT
  ========================= */

  const filteredProducts = useMemo(() => {

    let result = (data || []).filter((p) =>
      p?.name?.toLowerCase().includes(
        searchTerm.toLowerCase()
      )
    );

    if (sortOption === "lowtohigh") {
      result.sort((a, b) => a.price - b.price);
    }

    if (sortOption === "hightolow") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;

  }, [data, searchTerm, sortOption]);

  /* =========================
     WISHLIST TOGGLE
  ========================= */

  const toggleWishlist = async (product) => {

    if (!user) {
      toast.info("Please login to use wishlist");
      return;
    }

    try {

      setWishlistLoading(product._id);

      if (isInWishlist(product._id)) {

        await removeFromWishlist(product._id);
        toast.success("Removed from wishlist");

      } else {

        await addToWishlist(product);
        toast.success("Added to wishlist");

      }

    } catch (err) {

      console.error("🔥 Wishlist Toggle Error:", err);
      toast.error("Wishlist update failed");

    } finally {

      setWishlistLoading(null);

    }
  };

  /* =========================
     CARD HOVER EFFECT
  ========================= */

  const handleCardHover = (e, id) => {

    const rect = e.currentTarget.getBoundingClientRect();

    const x =
      ((e.clientX - rect.left) / rect.width - 0.5) * 20;

    const y =
      ((e.clientY - rect.top) / rect.height - 0.5) * 20;

    setCardStyles((prev) => ({
      ...prev,
      [id]: `rotateY(${x}deg) rotateX(${-y}deg) scale(1.05)`
    }));

  };

  const resetCard = (id) => {

    setCardStyles((prev) => ({
      ...prev,
      [id]: "rotateY(0deg) rotateX(0deg) scale(1)"
    }));

  };

  /* =========================
     UI
  ========================= */

  return (

    <div className="home">

      <h1 className="home-title">
        Welcome, {user?.username || "Guest"}!
      </h1>

      <p className="home-subtitle">
        Discover the latest trends in footwear.
      </p>

      <div className="controls">

        <div className="search-box">

          <input
            type="text"
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
            placeholder="Search products..."
          />

        </div>

        <select
          className="sort-dropdown"
          onChange={(e) =>
            setSortOption(e.target.value)
          }
        >
          <option value="">Sort By Price</option>
          <option value="lowtohigh">Low to High</option>
          <option value="hightolow">High to Low</option>
        </select>

      </div>

      <div className="product-grid">

        {loading ? (

          <p>Loading products...</p>

        ) : error ? (

          <p className="error-text">{error}</p>

        ) : filteredProducts.length > 0 ? (

          filteredProducts.map((item) => (

            <div
              key={item._id}
              className="product-card"
              onMouseMove={(e) =>
                handleCardHover(e, item._id)
              }
              onMouseLeave={() =>
                resetCard(item._id)
              }
              style={{
                transform:
                  cardStyles[item._id] || "none"
              }}
            >

              <button
                disabled={
                  wishlistLoading === item._id
                }
                className={`wishlist-button ${
                  isInWishlist(item._id)
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  toggleWishlist(item)
                }
              >
                {wishlistLoading === item._id
                  ? "..."
                  : isInWishlist(item._id)
                  ? "♥"
                  : "♡"}
              </button>

              <Link to={`/product/${item._id}`}>

                <div className="product-image-container">

                  <img
                    src={
                      item.images?.[0]
                        ? `http://localhost:5000${item.images[0]}`
                        : "https://via.placeholder.com/200"
                    }
                    alt={item.name}
                    className="product-image"
                  />

                </div>

                <h3 className="product-name">
                  {item.name}
                </h3>

                <p className="product-brand">
                  {item.brand}
                </p>

                <p className="product-price">
                  ₹{item.price}
                </p>

              </Link>

            </div>

          ))

        ) : (

          <p>No products found</p>

        )}

      </div>

    </div>

  );
}