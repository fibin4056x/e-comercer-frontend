import { useEffect, useState, useContext, useMemo } from "react";
import { Link } from "react-router-dom";
import "./women.css";
import { WishlistContext } from "../../../registrationpage/wishlisht/wishlistcontext";
import { Context as Logincontext } from "../../../registrationpage/loginpages/Logincontext";
import { getAssetUrl, request } from "../../../services/apiClient";
import { toast } from "react-toastify";

export default function Women() {
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

  useEffect(() => {
    const fetchWomen = async () => {
      try {
        setLoading(true);

        const res = await request("/products?category=women");

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
  <div className="home">

    <h1 className="home-title">Women's Collection</h1>

    <p className="home-subtitle">
      Discover premium footwear for women.
    </p>

    <div className="controls">
      <div className="search-box">
        <input
          type="text"
          placeholder="Search women's products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <select
        className="sort-dropdown"
        value={sortOption}
        onChange={(e) => setSortOption(e.target.value)}
      >
        <option value="">Sort By Price</option>
        <option value="lowtohigh">Low to High</option>
        <option value="hightolow">High to Low</option>
      </select>
    </div>

    <div className="product-grid">
      {loading ? (
        <p className="loading-text">Loading...</p>
      ) : error ? (
        <p className="error-text">{error}</p>
      ) : filteredProducts.length === 0 ? (
        <p className="error-text">No products found</p>
      ) : (
        filteredProducts.map((item) => (
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
                  src={getAssetUrl(item.images?.[0])}
                  alt={item.name}
                  className="product-image"
                />
              </div>

              <h3 className="product-name">{item.name}</h3>
              <p className="product-brand">{item.brand}</p>
              <p className="product-price">₹{item.price}</p>
            </Link>

          </div>
        ))
      )}
    </div>

  </div>
);
}
