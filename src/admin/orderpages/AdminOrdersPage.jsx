import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { toast } from "react-toastify";
import AdminShell from "../components/AdminShell";
import { getAssetUrl, request } from "../../services/apiClient";
import formatCurrency from "../../utilitis/formatCurrency";

const STATUS_OPTIONS = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
const FINAL_STATUSES = new Set(["Delivered", "Cancelled"]);

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [statusDrafts, setStatusDrafts] = useState({});
  const [confirmAction, setConfirmAction] = useState(null);
  const [updatingId, setUpdatingId] = useState("");

  useEffect(() => {
    let active = true;

    const loadOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await request("/orders/admin");
        if (!active) {
          return;
        }

        const nextOrders = Array.isArray(data) ? data : [];
        setOrders(nextOrders);
        setStatusDrafts(
          nextOrders.reduce((drafts, order) => {
            drafts[order._id] = order.status || "Pending";
            return drafts;
          }, {})
        );
      } catch (loadError) {
        if (!active) {
          return;
        }

        setError(loadError.message || "Failed to load orders");
        toast.error(loadError.message || "Failed to load orders");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadOrders();

    return () => {
      active = false;
    };
  }, []);

  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesFilter = statusFilter === "all" || order.status === statusFilter;
      const matchesQuery =
        !normalizedQuery ||
        [
          order._id,
          order.user?.username,
          order.user?.email,
          order.shippingAddress?.city,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedQuery));

      return matchesFilter && matchesQuery;
    });
  }, [orders, query, statusFilter]);

  const orderMetrics = useMemo(
    () => ({
      total: orders.length,
      active: orders.filter((order) => !FINAL_STATUSES.has(order.status)).length,
      delivered: orders.filter((order) => order.status === "Delivered").length,
      revenue: orders
        .filter((order) => order.status !== "Cancelled")
        .reduce((total, order) => total + (order.totalPrice || 0), 0),
    }),
    [orders]
  );

  const queueStatusUpdate = (order) => {
    const nextStatus = statusDrafts[order._id] || order.status || "Pending";

    if (nextStatus === order.status) {
      toast.info("Choose a new status before updating");
      return;
    }

    setConfirmAction({
      id: order._id,
      orderLabel: order._id.slice(-6).toUpperCase(),
      nextStatus,
    });
  };

  const executeStatusUpdate = async () => {
    if (!confirmAction) {
      return;
    }

    try {
      setUpdatingId(confirmAction.id);
      const updatedOrder = await request(`/orders/${confirmAction.id}/status`, "PUT", {
        status: confirmAction.nextStatus,
      });

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order._id === updatedOrder._id ? { ...order, ...updatedOrder } : order
        )
      );
      setStatusDrafts((currentDrafts) => ({
        ...currentDrafts,
        [confirmAction.id]: updatedOrder.status,
      }));
      toast.success(`Order ${confirmAction.orderLabel} updated`);
      setConfirmAction(null);
    } catch (error) {
      toast.error(error.message || "Failed to update order");
    } finally {
      setUpdatingId("");
    }
  };

  return (
    <AdminShell
      title="Fulfillment flow"
      description="Track every order through its lifecycle, keep status changes intentional, and resolve bottlenecks fast."
    >
      <section className="admin-metric-grid">
        <article className="admin-metric-card">
          <div>
            <p>Total orders</p>
            <strong>{orderMetrics.total}</strong>
          </div>
        </article>
        <article className="admin-metric-card">
          <div>
            <p>Active</p>
            <strong>{orderMetrics.active}</strong>
          </div>
        </article>
        <article className="admin-metric-card">
          <div>
            <p>Delivered</p>
            <strong>{orderMetrics.delivered}</strong>
          </div>
        </article>
        <article className="admin-metric-card">
          <div>
            <p>GMV</p>
            <strong>{formatCurrency(orderMetrics.revenue)}</strong>
          </div>
        </article>
      </section>

      <section className="admin-section-card">
        <div className="admin-toolbar admin-toolbar--split">
          <label className="admin-search">
            <Search size={16} />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search order id, customer, email, or city"
            />
          </label>

          <label className="admin-filter">
            <SlidersHorizontal size={16} />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">All statuses</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
        </div>

        {loading ? (
          <div className="admin-loading-state">
            <div className="admin-loader" />
            <p>Loading orders...</p>
          </div>
        ) : error ? (
          <div className="admin-empty-state">
            <h2>Unable to load orders</h2>
            <p>{error}</p>
          </div>
        ) : filteredOrders.length ? (
          <div className="admin-order-card-list">
            {filteredOrders.map((order) => {
              const isFinal = FINAL_STATUSES.has(order.status);
              const draftStatus = statusDrafts[order._id] || order.status || "Pending";

              return (
                <article key={order._id} className="admin-order-card">
                  <div className="admin-order-card-header">
                    <div>
                      <p className="admin-card-kicker">Order #{order._id.slice(-6).toUpperCase()}</p>
                      <h2>{order.user?.username || "Guest customer"}</h2>
                      <p>{order.user?.email || "No email on file"}</p>
                    </div>

                    <div className="admin-order-card-summary">
                      <span className={`status-pill status-pill--${(order.status || "pending").toLowerCase()}`}>
                        {order.status || "Pending"}
                      </span>
                      <strong>{formatCurrency(order.totalPrice || 0)}</strong>
                    </div>
                  </div>

                  <div className="admin-order-item-list">
                    {(order.orderItems || []).map((item, index) => (
                      <div key={`${item.product}-${index}`} className="admin-order-item">
                        <img
                          src={getAssetUrl(item.image)}
                          alt={item.name}
                          className="admin-product-thumb"
                          loading="lazy"
                          decoding="async"
                        />
                        <div>
                          <strong>{item.name}</strong>
                          <p>
                            {item.size} / {item.color} / Qty {item.quantity}
                          </p>
                        </div>
                        <span>{formatCurrency((item.price || 0) * (item.quantity || 0))}</span>
                      </div>
                    ))}
                  </div>

                  <div className="admin-order-footer">
                    <div>
                      <p className="admin-card-kicker">Shipping</p>
                      <p>
                        {order.shippingAddress?.address}, {order.shippingAddress?.city},{" "}
                        {order.shippingAddress?.postalCode}, {order.shippingAddress?.country}
                      </p>
                    </div>

                    <div className="admin-order-actions">
                      <select
                        value={draftStatus}
                        onChange={(event) =>
                          setStatusDrafts((currentDrafts) => ({
                            ...currentDrafts,
                            [order._id]: event.target.value,
                          }))
                        }
                        disabled={isFinal}
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        className="admin-primary-action"
                        onClick={() => queueStatusUpdate(order)}
                        disabled={isFinal || updatingId === order._id}
                      >
                        {isFinal
                          ? "Finalized"
                          : updatingId === order._id
                            ? "Updating..."
                            : "Update status"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="admin-empty-state">
            <h2>No matching orders</h2>
            <p>Adjust the filters or search a different customer and city combination.</p>
          </div>
        )}
      </section>

      {confirmAction ? (
        <div className="admin-modal-backdrop">
          <div className="admin-modal">
            <h2>Update order {confirmAction.orderLabel}?</h2>
            <p>
              The status will change to <strong>{confirmAction.nextStatus}</strong>. Use this only
              when fulfillment progress is confirmed.
            </p>

            <div className="admin-modal-actions">
              <button
                type="button"
                className="admin-secondary-action"
                onClick={() => setConfirmAction(null)}
                disabled={Boolean(updatingId)}
              >
                Keep current status
              </button>
              <button
                type="button"
                className="admin-primary-action"
                onClick={executeStatusUpdate}
                disabled={updatingId === confirmAction.id}
              >
                {updatingId === confirmAction.id ? "Updating..." : "Confirm change"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
}
