import React, { useEffect, useState, useContext } from "react";
import { request } from "../../services/api";
import { Context } from "../../registrationpage/loginpages/Logincontext";
import { toast } from "react-toastify";
import "./Orderpage.css";

export default function Orderpage() {
  const { user } = useContext(Context);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const BASE_URL = "http://localhost:5000";

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await request("/orders/admin"); // admin route
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        toast.error(err.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const markDelivered = async (id) => {
    try {
      await request(`/orders/${id}/deliver`, "PUT");
      toast.success("Order marked as delivered");

      setOrders((prev) =>
        prev.map((o) =>
          o._id === id ? { ...o, isDelivered: true } : o
        )
      );
    } catch (err) {
      toast.error("Failed to update order");
    }
  };

  const cancelOrder = async (id) => {
    try {
      await request(`/orders/${id}/cancel`, "PUT");
      toast.success("Order cancelled");

      setOrders((prev) =>
        prev.map((o) =>
          o._id === id ? { ...o, status: "Cancelled" } : o
        )
      );
    } catch (err) {
      toast.error("Failed to cancel order");
    }
  };

  if (loading) return <p className="admin-loading">Loading orders...</p>;
  if (!orders.length) return <p className="admin-empty">No orders found</p>;

  return (
    <div className="admin-orders-container">
      <h1 className="admin-title">Admin Order Management</h1>

      {orders.map((order) => (
        <div key={order._id} className="admin-order-card">

          <div className="admin-order-header">
            <div>
              <h3>Order #{order._id.slice(-6)}</h3>
              <p className="admin-date">
                {new Date(order.createdAt).toLocaleString()}
              </p>
              <p className="admin-customer">
                {order.user?.username} ({order.user?.email})
              </p>
            </div>

            <div className="admin-badges">
              <span className={`badge ${order.isPaid ? "paid" : "unpaid"}`}>
                {order.isPaid ? "Paid" : "Unpaid"}
              </span>

              <span className={`badge ${order.isDelivered ? "delivered" : "pending"}`}>
                {order.isDelivered ? "Delivered" : "Pending"}
              </span>
            </div>
          </div>

          <div className="admin-items">
            {order.orderItems?.map((item, i) => (
              <div key={i} className="admin-item">

                <img
                  src={
                    item.image
                      ? `${BASE_URL}${item.image}`
                      : "/placeholder.png"
                  }
                  alt={item.name}
                  className="admin-item-image"
                />

                <div className="admin-item-info">
                  <p className="item-name">{item.name}</p>
                  <p>{item.size} • {item.color}</p>
                  <p>Qty: {item.quantity}</p>
                </div>

                <div className="admin-item-price">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="admin-footer">
            <div className="admin-shipping">
              <strong>Shipping:</strong>
              <p>{order.shippingAddress?.address}</p>
              <p>
                {order.shippingAddress?.city},{" "}
                {order.shippingAddress?.postalCode},{" "}
                {order.shippingAddress?.country}
              </p>
            </div>

            <div className="admin-total">
              ₹{order.totalPrice?.toFixed(2)}
            </div>

            <div className="admin-actions">
              {!order.isDelivered && (
                <button
                  className="btn-deliver"
                  onClick={() => markDelivered(order._id)}
                >
                  Mark Delivered
                </button>
              )}

              {order.status !== "Cancelled" && (
                <button
                  className="btn-cancel"
                  onClick={() => cancelOrder(order._id)}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

        </div>
      ))}
    </div>
  );
}