import { useContext, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import SmartImage from "../../../components/SmartImage";
import { OrderContext } from "./ordercontextV2";
import formatCurrency from "../../../utilitis/formatCurrency";

const CANCELABLE_STATUSES = new Set(["Pending", "Processing"]);

export default function OrdersPage() {
  const { orders = [], loading, cancelOrder } = useContext(OrderContext) || {};
  const [pendingCancelId, setPendingCancelId] = useState("");
  const [submittingCancelId, setSubmittingCancelId] = useState("");

  const totalSpend = useMemo(
    () => orders.reduce((total, order) => total + (order.totalPrice || 0), 0),
    [orders]
  );

  const handleCancelOrder = async () => {
    if (!pendingCancelId) {
      return;
    }

    try {
      setSubmittingCancelId(pendingCancelId);
      await cancelOrder?.(pendingCancelId);
      setPendingCancelId("");
    } catch (error) {
      toast.error(error.message || "Unable to cancel order");
    } finally {
      setSubmittingCancelId("");
    }
  };

  if (loading) {
    return (
      <section className="store-section store-loading-state">
        <div className="store-loader" />
        <p>Loading your orders...</p>
      </section>
    );
  }

  if (!orders.length) {
    return (
      <section className="store-section store-empty-state">
        <h1>No orders yet</h1>
        <p>Once you place an order, the full fulfillment timeline will appear here.</p>
        <Link to="/" className="store-primary-button">
          Start shopping
        </Link>
      </section>
    );
  }

  return (
    <div className="store-section order-history-layout">
      <section className="store-section-card order-history-summary">
        <div className="section-title-row">
          <div>
            <p className="store-kicker">Purchase history</p>
            <h1>My orders</h1>
          </div>
          <strong>{formatCurrency(totalSpend)}</strong>
        </div>

        <p>
          Track every order, review the shipping address used, and manage cancellation before dispatch.
        </p>
      </section>

      <section className="order-history-list">
        {orders.map((order) => (
          <article key={order._id} className="store-section-card order-history-card">
            <div className="order-history-card-head">
              <div>
                <p className="store-kicker">Order #{order._id.slice(-6).toUpperCase()}</p>
                <h2>{new Date(order.createdAt).toLocaleString()}</h2>
              </div>
              <div className="order-history-badges">
                <span className={`status-pill status-pill--${(order.status || "pending").toLowerCase()}`}>
                  {order.status || "Pending"}
                </span>
                <span className={`status-pill ${order.isPaid ? "status-pill--delivered" : "status-pill--pending"}`}>
                  {order.isPaid ? "Paid" : "Pending payment"}
                </span>
              </div>
            </div>

            <div className="checkout-item-list">
              {(order.orderItems || []).map((item, index) => (
                <article key={`${item.product}-${index}`} className="checkout-item-card">
                  <SmartImage
                    assetPath={item.image}
                    alt={item.name}
                    className="checkout-item-image"
                    loading="lazy"
                    decoding="async"
                  />
                  <div>
                    <strong>{item.name}</strong>
                    <p>
                      {item.size} / {item.color}
                    </p>
                    <span>Qty {item.quantity}</span>
                  </div>
                  <strong>{formatCurrency((item.price || 0) * (item.quantity || 0))}</strong>
                </article>
              ))}
            </div>

            <div className="order-history-card-footer">
              <div>
                <p className="store-kicker">Ship to</p>
                <p>
                  {order.shippingAddress?.address}, {order.shippingAddress?.city},{" "}
                  {order.shippingAddress?.postalCode}, {order.shippingAddress?.country}
                </p>
              </div>

              <div className="order-history-total">
                <strong>{formatCurrency(order.totalPrice || 0)}</strong>
                {CANCELABLE_STATUSES.has(order.status) ? (
                  <button
                    type="button"
                    className="store-ghost-danger"
                    onClick={() => setPendingCancelId(order._id)}
                  >
                    Cancel order
                  </button>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </section>

      {pendingCancelId ? (
        <div className="store-modal-backdrop">
          <div className="store-modal">
            <h2>Cancel this order?</h2>
            <p>
              Stock will be restored and the order can no longer move through fulfillment once cancelled.
            </p>

            <div className="store-modal-actions">
              <button
                type="button"
                className="store-secondary-button"
                onClick={() => setPendingCancelId("")}
                disabled={Boolean(submittingCancelId)}
              >
                Keep order
              </button>
              <button
                type="button"
                className="store-ghost-danger"
                onClick={handleCancelOrder}
                disabled={submittingCancelId === pendingCancelId}
              >
                {submittingCancelId === pendingCancelId ? "Cancelling..." : "Confirm cancel"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
