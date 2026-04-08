import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Boxes,
  CircleDollarSign,
  ShoppingBag,
  Sparkles,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import AdminShell from "../components/AdminShell";
import SmartImage from "../../components/SmartImage";
import { request } from "../../services/apiClient";
import formatCurrency from "../../utilitis/formatCurrency";

const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "2-digit",
});

const formatMonthLabel = (entry) => {
  const year = Number(entry?._id?.year);
  const month = Number(entry?._id?.month);

  if (!year || !month) {
    return "N/A";
  }

  return monthFormatter.format(new Date(year, month - 1, 1));
};

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [revenueRows, setRevenueRows] = useState([]);

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [statsData, recentData, productsData, revenueData] = await Promise.all([
          request("/admin/stats"),
          request("/admin/recent-orders?limit=5"),
          request("/admin/top-products?limit=4"),
          request("/admin/monthly-revenue"),
        ]);

        if (!active) {
          return;
        }

        setStats(statsData);
        setRecentOrders(Array.isArray(recentData?.orders) ? recentData.orders : []);
        setTopProducts(Array.isArray(productsData?.products) ? productsData.products : []);
        setRevenueRows(Array.isArray(revenueData?.revenue) ? revenueData.revenue : []);
      } catch (loadError) {
        if (!active) {
          return;
        }

        setError(loadError.message || "Failed to load dashboard data");
        toast.error(loadError.message || "Failed to load dashboard data");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const statCards = useMemo(
    () => [
      {
        label: "Revenue",
        value: formatCurrency(stats?.revenue || 0),
        icon: CircleDollarSign,
      },
      {
        label: "Orders",
        value: stats?.orders || 0,
        icon: ShoppingBag,
      },
      {
        label: "Products",
        value: stats?.products || 0,
        icon: Boxes,
      },
      {
        label: "Users",
        value: stats?.users || 0,
        icon: Users,
      },
    ],
    [stats]
  );

  const lastSixRevenueRows = useMemo(() => revenueRows.slice(-6), [revenueRows]);
  const maxRevenue = useMemo(
    () => Math.max(1, ...lastSixRevenueRows.map((entry) => entry.revenue || 0)),
    [lastSixRevenueRows]
  );

  return (
    <AdminShell
      title="Command center"
      description="Monitor store health, fulfillment velocity, and high-performing catalog lines from one premium workspace."
      actions={
        <>
          <Link to="/admin/products/new" className="admin-primary-action">
            Add product
          </Link>
          <Link to="/admin/orders" className="admin-secondary-action">
            Review orders
          </Link>
        </>
      }
    >
      {loading ? (
        <section className="admin-section-card admin-loading-state">
          <div className="admin-loader" />
          <p>Syncing dashboard metrics...</p>
        </section>
      ) : error ? (
        <section className="admin-section-card admin-empty-state">
          <h2>Dashboard unavailable</h2>
          <p>{error}</p>
        </section>
      ) : (
        <>
          <section className="admin-metric-grid">
            {statCards.map((card) => {
              const Icon = card.icon;

              return (
                <article key={card.label} className="admin-metric-card">
                  <div className="admin-metric-icon">
                    <Icon size={20} />
                  </div>
                  <div>
                    <p>{card.label}</p>
                    <strong>{card.value}</strong>
                  </div>
                </article>
              );
            })}
          </section>

          <section className="admin-dashboard-grid">
            <article className="admin-section-card">
              <div className="admin-section-head">
                <div>
                  <p className="admin-section-kicker">Revenue trend</p>
                  <h2>Delivered revenue by month</h2>
                </div>
                <Sparkles size={18} />
              </div>

              {lastSixRevenueRows.length ? (
                <div className="admin-revenue-bars">
                  {lastSixRevenueRows.map((entry) => (
                    <div key={`${entry._id?.year}-${entry._id?.month}`} className="admin-revenue-row">
                      <div className="admin-revenue-labels">
                        <span>{formatMonthLabel(entry)}</span>
                        <strong>{formatCurrency(entry.revenue || 0)}</strong>
                      </div>
                      <div className="admin-revenue-track">
                        <span
                          className="admin-revenue-fill"
                          style={{
                            width: `${Math.max(
                              12,
                              ((entry.revenue || 0) / maxRevenue) * 100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="admin-empty-copy">
                  Revenue will appear once delivered orders start landing.
                </p>
              )}
            </article>

            <article className="admin-section-card">
              <div className="admin-section-head">
                <div>
                  <p className="admin-section-kicker">Recent activity</p>
                  <h2>Latest orders</h2>
                </div>
                <Link to="/admin/orders" className="admin-inline-link">
                  View all
                  <ArrowUpRight size={15} />
                </Link>
              </div>

              {recentOrders.length ? (
                <div className="admin-order-list">
                  {recentOrders.map((order) => (
                    <div key={order._id} className="admin-order-row">
                      <div>
                        <strong>#{order._id.slice(-6).toUpperCase()}</strong>
                        <p>{order.user?.username || "Guest"}</p>
                      </div>
                      <div>
                        <span className={`status-pill status-pill--${(order.status || "pending").toLowerCase()}`}>
                          {order.status || "Pending"}
                        </span>
                        <p>{formatCurrency(order.totalPrice || 0)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="admin-empty-copy">No recent orders yet.</p>
              )}
            </article>

            <article className="admin-section-card">
              <div className="admin-section-head">
                <div>
                  <p className="admin-section-kicker">Best sellers</p>
                  <h2>Top moving products</h2>
                </div>
                <Link to="/admin/products" className="admin-inline-link">
                  Manage catalog
                  <ArrowUpRight size={15} />
                </Link>
              </div>

              {topProducts.length ? (
                <div className="admin-product-list">
                  {topProducts.map((product) => (
                    <div key={`${product.name}-${product.totalSold}`} className="admin-product-row">
                      <SmartImage
                        assetPath={product.images?.[0]}
                        alt={product.name}
                        className="admin-product-thumb"
                        loading="lazy"
                        decoding="async"
                      />
                      <div>
                        <strong>{product.name}</strong>
                        <p>{formatCurrency(product.price || 0)}</p>
                      </div>
                      <span>{product.totalSold || 0} sold</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="admin-empty-copy">Top sellers will appear after the first batch of orders.</p>
              )}
            </article>
          </section>
        </>
      )}
    </AdminShell>
  );
}
