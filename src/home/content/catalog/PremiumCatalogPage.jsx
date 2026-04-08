import { useContext, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Heart, Search, SlidersHorizontal, Sparkles, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import SmartImage from "../../../components/SmartImage";
import { Context as Logincontext } from "../../../registrationpage/loginpages/LogincontextV2";
import { WishlistContext } from "../../../registrationpage/wishlisht/wishlistcontextV2";
import { request } from "../../../services/apiClient";
import formatCurrency from "../../../utilitis/formatCurrency";

const PAGE_SIZE = 24;

export default function PremiumCatalogPage({
  category,
  title,
  subtitle,
  searchPlaceholder,
}) {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [wishlistLoading, setWishlistLoading] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const previousCategoryRef = useRef(category);
  const deferredSearchTerm = useDeferredValue(searchTerm);

  const { user } = useContext(Logincontext) || {};
  const isAdmin = user?.role === "admin";
  const {
    wishlist = [],
    addToWishlist,
    removeFromWishlist,
  } = useContext(WishlistContext) || {};

  useEffect(() => {
    if (previousCategoryRef.current !== category) {
      previousCategoryRef.current = category;
      setProducts([]);
      setError("");
      setPageNumber(1);
      setTotalProducts(0);
      setTotalPages(1);
      return;
    }

    let active = true;

    const fetchProducts = async () => {
      try {
        if (pageNumber === 1) {
          setLoading(true);
          setProducts([]);
          setError("");
        } else {
          setLoadingMore(true);
        }

        const query = category
          ? `/products?category=${encodeURIComponent(category)}&pageSize=${PAGE_SIZE}&pageNumber=${pageNumber}`
          : `/products?pageSize=${PAGE_SIZE}&pageNumber=${pageNumber}`;

        const data = await request(query);
        if (!active) {
          return;
        }

        const nextProducts = Array.isArray(data?.products) ? data.products : [];
        const resolvedTotalProducts = Number(data?.totalProducts ?? data?.totalproducts);
        const resolvedTotalPages = Math.max(1, Number(data?.pages) || 1);

        setProducts((currentProducts) =>
          pageNumber === 1
            ? nextProducts
            : [
                ...currentProducts,
                ...nextProducts.filter(
                  (product) =>
                    !currentProducts.some((currentProduct) => currentProduct._id === product._id)
                ),
              ]
        );
        setTotalProducts(
          Number.isFinite(resolvedTotalProducts) ? resolvedTotalProducts : nextProducts.length
        );
        setTotalPages(resolvedTotalPages);
      } catch (fetchError) {
        if (!active) {
          return;
        }

        setError(fetchError.message || "Failed to load products");
        if (pageNumber === 1) {
          setProducts([]);
          setTotalProducts(0);
          setTotalPages(1);
        }
      } finally {
        if (active) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    };

    fetchProducts();

    return () => {
      active = false;
    };
  }, [category, pageNumber]);

  const wishlistIds = useMemo(() => new Set(wishlist.map((item) => item._id)), [wishlist]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = deferredSearchTerm.trim().toLowerCase();
    const nextProducts = products.filter((product) =>
      product?.name?.toLowerCase().includes(normalizedSearch)
    );

    if (isAdmin && sortOption === "lowtohigh") {
      return [...nextProducts].sort((a, b) => a.price - b.price);
    }

    if (isAdmin && sortOption === "hightolow") {
      return [...nextProducts].sort((a, b) => b.price - a.price);
    }

    return nextProducts;
  }, [deferredSearchTerm, isAdmin, products, sortOption]);

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

  const hasMoreProducts = pageNumber < totalPages;

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
    <section className="store-section">
      <div className="store-hero-card">
        <div>
          <p className="store-kicker">{category ? "Curated category" : "Premium storefront"}</p>
          <h1 className="home-title">{title}</h1>
          <p className="home-subtitle">{subtitle}</p>
        </div>

        <div className="store-hero-metrics">
          {isAdmin ? (
            <>
              <div>
                <span>Visible</span>
                <strong>{filteredProducts.length}</strong>
              </div>
              <div>
                <span>Featured</span>
                <strong>{featuredCount}</strong>
              </div>
              <div>
                <span>Avg. price</span>
                <strong>{formatCurrency(averagePrice)}</strong>
              </div>
              <div>
                <span>Catalog</span>
                <strong>{totalProducts || filteredProducts.length}</strong>
              </div>
            </>
          ) : (
            <>
              <div>
                <span>Catalog</span>
                <strong>Visible styles only</strong>
              </div>
              <div>
                <span>Browse</span>
                <strong>Product details</strong>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="store-toolbar">
        <label className="store-search-field">
          <Search size={16} />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={searchPlaceholder}
          />
        </label>

        {isAdmin ? (
          <label className="store-filter-field">
            <SlidersHorizontal size={16} />
            <select value={sortOption} onChange={(event) => setSortOption(event.target.value)}>
              <option value="">Sort by price</option>
              <option value="lowtohigh">Low to high</option>
              <option value="hightolow">High to low</option>
            </select>
          </label>
        ) : null}
      </div>

      <div className="product-grid premium-product-grid">
        {loading ? (
          <div className="store-loading-state">
            <div className="store-loader" />
            <p>Loading products...</p>
          </div>
        ) : error ? (
          <div className="store-empty-state store-empty-state--compact">
            <h3>Catalog unavailable</h3>
            <p>{error}</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map((item) => (
            <article key={item._id} className="product-card">
              <button
                type="button"
                className="wishlist-button"
                disabled={wishlistLoading === item._id}
                onClick={() => toggleWishlist(item)}
              >
                <Heart
                  size={18}
                  fill={wishlistIds.has(item._id) ? "currentColor" : "none"}
                />
              </button>

              <Link to={`/product/${item._id}`} className="product-card-link">
                <div className="product-image-container">
                  <SmartImage
                    assetPath={item.images?.[0]}
                    alt={item.name}
                    className="product-image"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="product-badges">
                    {item.isFeatured ? (
                      <span className="product-badge">
                        <Sparkles size={12} />
                        Featured
                      </span>
                    ) : null}
                    {item.isNewArrival ? <span className="product-badge">New</span> : null}
                  </div>
                </div>

                <div className="product-copy">
                  <div className="product-copy-top">
                    <div>
                      <p className="product-brand">{item.brand || "Sole Society"}</p>
                      <h3 className="product-name">{item.name}</h3>
                    </div>
                    <div className="product-rating">
                      <Star size={14} fill="currentColor" />
                      <span>{(item.rating || 0).toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="product-copy-bottom">
                    {isAdmin ? (
                      <>
                        <p className="product-price">{formatCurrency(item.price)}</p>
                        <span className="product-stock">
                          {(item.variants || []).reduce(
                            (total, variant) => total + (variant.stock || 0),
                            0
                          )}{" "}
                          units
                        </span>
                      </>
                    ) : (
                      <span className="product-stock">
                        {item.inStock === false ? "Currently unavailable" : "View product"}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </article>
          ))
        ) : (
          <div className="store-empty-state store-empty-state--compact">
            <h3>No products found</h3>
            <p>Try a different search term or explore another curated category.</p>
          </div>
        )}
      </div>

      {!loading && !error && hasMoreProducts ? (
        <div className="store-load-more-row">
          <button
            type="button"
            className="store-secondary-button"
            onClick={() => setPageNumber((currentPage) => currentPage + 1)}
            disabled={loadingMore}
          >
            {loadingMore ? "Loading more..." : "Load more products"}
          </button>
        </div>
      ) : null}
    </section>
  );
}
