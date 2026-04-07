import { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./Home.css";
import { Context as Logincontext } from "../registrationpage/loginpages/Logincontext";
import { WishlistContext } from "../registrationpage/wishlisht/wishlistcontext";
import { toast } from "react-toastify";
import { request } from "../services/api";

export default function Home() {
  const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://e-comerce-backend-cfkk.onrender.com";
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

  /* ================= FETCH PRODUCTS ================= */

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const res = await request("/products");

        const productsData =
          res?.products || res?.data?.products || res?.data || res;

        if (Array.isArray(productsData)) {
          setData(productsData);
        } else if (res && typeof res === "object" && Array.isArray(res.products)) {
          setData(res.products);
        } else {
          setData([]);
        }

      } catch (err) {
        console.error("Product Fetch Error:", err);
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  /* ================= FETCH WISHLIST ================= */

  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user]);

  /* ================= CURSOR ================= */

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

  /* ================= WISHLIST ================= */

  const wishlistIds = useMemo(() => {
    return new Set(wishlist.map((w) => w._id));
  }, [wishlist]);

  const isInWishlist = (productId) => {
    return wishlistIds.has(productId);
  };

  /* ================= FILTER ================= */

  const filteredProducts = useMemo(() => {
    let result = (data || []).filter((p) =>
      p?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortOption === "lowtohigh") {
      result.sort((a, b) => a.price - b.price);
    }

    if (sortOption === "hightolow") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [data, searchTerm, sortOption]);

  /* ================= WISHLIST TOGGLE ================= */

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
      console.error("Wishlist Error:", err);
      toast.error("Wishlist update failed");
    } finally {
      setWishlistLoading(null);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="home">
      <h1 className="home-title">
        Welcome, {user?.username || "Guest"}!
      </h1>

      <p className="home-subtitle">
        Discover the latest trends in footwear.
      </p>

      <div className="controls">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search products..."
        />

        <select onChange={(e) => setSortOption(e.target.value)}>
          <option value="">Sort By Price</option>
          <option value="lowtohigh">Low to High</option>
          <option value="hightolow">High to Low</option>
        </select>
      </div>

      <div className="product-grid">
        {loading ? (
          <p>Loading products...</p>
        ) : error ? (
          <p>{error}</p>
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map((item) => (
            <div key={item._id} className="product-card">
              
              <button
                disabled={wishlistLoading === item._id}
                onClick={() => toggleWishlist(item)}
              >
                {wishlistLoading === item._id
                  ? "..."
                  : isInWishlist(item._id)
                  ? "♥"
                  : "♡"}
              </button>

              <Link to={`/product/${item._id}`}>
                <img
                  src={
                    item.images?.[0]
                      ? `${BASE_URL}${item.images[0]}`
                      : "https://via.placeholder.com/200"
                  }
                  alt={item.name}
                />

                <h3>{item.name}</h3>
                <p>{item.brand}</p>
                <p>₹{item.price}</p>
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