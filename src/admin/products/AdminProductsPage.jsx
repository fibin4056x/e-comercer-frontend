import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Boxes, Plus, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import AdminShell from "../components/AdminShell";
import { getAssetUrl, request } from "../../services/apiClient";
import formatCurrency from "../../utilitis/formatCurrency";

const getProductStock = (product) =>
  (product?.variants || []).reduce((total, variant) => total + (variant.stock || 0), 0);

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmProduct, setConfirmProduct] = useState(null);
  const [deletingId, setDeletingId] = useState("");

  useEffect(() => {
    let active = true;

    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await request("/products?pageSize=100");
        if (!active) {
          return;
        }

        setProducts(Array.isArray(data?.products) ? data.products : []);
      } catch (loadError) {
        if (!active) {
          return;
        }

        setError(loadError.message || "Failed to load products");
        toast.error(loadError.message || "Failed to load products");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      active = false;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return products;
    }

    return products.filter((product) =>
      [product.name, product.brand, product.category, product.type]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [products, searchTerm]);

  const featuredCount = useMemo(
    () => products.filter((product) => product.isFeatured).length,
    [products]
  );
  const lowStockCount = useMemo(
    () => products.filter((product) => getProductStock(product) <= 5).length,
    [products]
  );

  const handleDeleteProduct = async () => {
    if (!confirmProduct) {
      return;
    }

    try {
      setDeletingId(confirmProduct._id);
      await request(`/products/${confirmProduct._id}`, "DELETE");
      setProducts((currentProducts) =>
        currentProducts.filter((product) => product._id !== confirmProduct._id)
      );
      toast.success("Product removed");
      setConfirmProduct(null);
    } catch (error) {
      toast.error(error.message || "Failed to delete product");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <AdminShell
      title="Catalog control"
      description="Manage pricing, launch new SKUs, and keep merchandising quality high across every category."
      actions={
        <Link to="/admin/products/new" className="admin-primary-action">
          <Plus size={16} />
          <span>New product</span>
        </Link>
      }
    >
      <section className="admin-metric-grid">
        <article className="admin-metric-card">
          <div className="admin-metric-icon">
            <Boxes size={20} />
          </div>
          <div>
            <p>Total products</p>
            <strong>{products.length}</strong>
          </div>
        </article>

        <article className="admin-metric-card">
          <div className="admin-metric-icon">
            <AlertTriangle size={20} />
          </div>
          <div>
            <p>Low stock</p>
            <strong>{lowStockCount}</strong>
          </div>
        </article>

        <article className="admin-metric-card">
          <div className="admin-metric-icon">
            <Plus size={20} />
          </div>
          <div>
            <p>Featured</p>
            <strong>{featuredCount}</strong>
          </div>
        </article>
      </section>

      <section className="admin-section-card">
        <div className="admin-toolbar">
          <label className="admin-search">
            <Search size={16} />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search name, brand, category, or type"
            />
          </label>
        </div>

        {loading ? (
          <div className="admin-loading-state">
            <div className="admin-loader" />
            <p>Loading catalog...</p>
          </div>
        ) : error ? (
          <div className="admin-empty-state">
            <h2>Unable to load products</h2>
            <p>{error}</p>
          </div>
        ) : filteredProducts.length ? (
          <div className="admin-product-grid">
            {filteredProducts.map((product) => {
              const totalStock = getProductStock(product);

              return (
                <article key={product._id} className="admin-product-card">
                  <img
                    src={getAssetUrl(product.images?.[0])}
                    alt={product.name}
                    className="admin-product-hero"
                    loading="lazy"
                    decoding="async"
                  />

                  <div className="admin-product-body">
                    <div className="admin-product-copy">
                      <div>
                        <p className="admin-card-kicker">
                          {(product.category || "Uncategorized").toUpperCase()}
                        </p>
                        <h2>{product.name}</h2>
                      </div>
                      <span
                        className={`status-pill ${totalStock <= 5 ? "status-pill--cancelled" : "status-pill--processing"}`}
                      >
                        {totalStock} in stock
                      </span>
                    </div>

                    <p className="admin-product-meta">
                      {product.brand || "House label"} {product.type ? `· ${product.type}` : ""}
                    </p>

                    <div className="admin-product-pricing">
                      <strong>{formatCurrency(product.price || 0)}</strong>
                      {product.originalPrice ? (
                        <span>{formatCurrency(product.originalPrice)}</span>
                      ) : null}
                    </div>

                    <div className="admin-card-flags">
                      {product.isFeatured ? <span>Featured</span> : null}
                      {product.isNewArrival ? <span>New arrival</span> : null}
                      {product.discount ? <span>{product.discount}% off</span> : null}
                    </div>

                    <div className="admin-card-actions">
                      <Link
                        to={`/admin/products/${product._id}/edit`}
                        className="admin-secondary-action"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        className="admin-danger-action"
                        onClick={() => setConfirmProduct(product)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="admin-empty-state">
            <h2>No matching products</h2>
            <p>Try a broader search or add a new product to the catalog.</p>
          </div>
        )}
      </section>

      {confirmProduct ? (
        <div className="admin-modal-backdrop">
          <div className="admin-modal">
            <h2>Delete {confirmProduct.name}?</h2>
            <p>
              This removes the product from the live catalog. Existing orders stay intact, but
              the item will no longer be purchasable.
            </p>

            <div className="admin-modal-actions">
              <button
                type="button"
                className="admin-secondary-action"
                onClick={() => setConfirmProduct(null)}
                disabled={Boolean(deletingId)}
              >
                Keep product
              </button>
              <button
                type="button"
                className="admin-danger-action"
                onClick={handleDeleteProduct}
                disabled={deletingId === confirmProduct._id}
              >
                {deletingId === confirmProduct._id ? "Deleting..." : "Delete product"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
}
