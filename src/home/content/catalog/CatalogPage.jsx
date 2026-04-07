import { useContext, useEffect, useMemo, useState } from "react";
import { Heart, Search, SlidersHorizontal, Sparkles, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Context as Logincontext } from "../../../registrationpage/loginpages/LogincontextV2";
import { WishlistContext } from "../../../registrationpage/wishlisht/wishlistcontextV2";
import { getAssetUrl, request } from "../../../services/apiClient";
import formatCurrency from "../../../utilitis/formatCurrency";

export default function CatalogPage({
  category,
  title,
  subtitle,
  searchPlaceholder,
}) {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [wishlistLoading, setWishlistLoading] = useState(null);

  const { user } = useContext(Logincontext) || {};
  const {
    wishlist = [],
    addToWishlist,
    removeFromWishlist,
    fetchWishlist,
  } = useContext(WishlistContext) || {};

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const query = category
          ? `/products?category=${encodeURIComponent(category)}&pageSize=100`
          : "/products?pageSize=100";

        const data = await request(query);
        setProducts(Array.isArray(data?.products) ? data.products : []);
      } catch (fetchError) {
        setError(fetchError.message || "Failed to load products");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [fetchWishlist, user]);

  const wishlistIds = useMemo(() => new Set(wishlist.map((item) => item._id)), [wishlist]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const nextProducts = products.filter((product) =>
      product?.name?.toLowerCase().includes(normalizedSearch)
    );

    if (sortOption === "lowtohigh") {
      return [...nextProducts].sort((a, b) => a.price - b.price);
    }

    if (sortOption === "hightolow") {
      return [...nextProducts].sort((a, b) => b.price - a.price);
    }

    return nextProducts;
  }, [products, searchTerm, sortOption]);

  const totalStock = useMemo(
    () =>
      filteredProducts.reduce(
        (total, product) =>
          total +
          (product?.variants || []).reduce(
            (variantTotal, variant) => variantTotal + (variant.stock || 0),
            0
          ),
        0
      ),
    [filteredProducts]
  );

  const featuredCount = useMemo(
    () => filteredProducts.filter((product) => product.isFeatured).length,
    [filteredProducts]
  );

  const averagePrice = useMemo(() => {
    if (!filteredProducts.length) {
      return 0;
    }

    return (
      filteredProducts.reduce((total, product) => total + (product.price || 0), 0) /
      filteredProducts.length
    );
  }, [filteredProducts]);

  const toggleWishlist = async (product) => {
    if (!user) {
      toast.info("Please login to use wishlist");
      return;
    }

    try {
      setWishlistLoading(product._id);

      if (wishlistIds.has(product._id)) {
        await removeFromWishlist(product._id);
        toast.success("Removed from wishlist");
      } else {
        await addToWishlist(product);
        toast.success("Added to wishlist");
      }
    } catch (wishlistError) {
      toast.error(wishlistError.message || "Wishlist update failed");
    } finally {
      setWishlistLoading(null);
    }
  };

  return (
    <div className="home">
      <h1 className="home-title">{title}</h1>
      <p className="home-subtitle">{subtitle}</p>

      <div className="controls">
        <input
          type="text"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder={searchPlaceholder}
        />

        <select value={sortOption} onChange={(event) => setSortOption(event.target.value)}>
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
                type="button"
                disabled={wishlistLoading === item._id}
                onClick={() => toggleWishlist(item)}
              >
                {wishlistLoading === item._id
                  ? "..."
                  : wishlistIds.has(item._id)
                    ? "♥"
                    : "♡"}
              </button>

              <Link to={`/product/${item._id}`}>
                <img src={getAssetUrl(item.images?.[0])} alt={item.name} />
                <h3>{item.name}</h3>
                <p>{item.brand}</p>
                <p>{formatCurrency(item.price)}</p>
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
