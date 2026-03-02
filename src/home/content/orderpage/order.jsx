import React, { useEffect, useState } from "react";
import { request, } from "../../../services/api";
import { toast } from "react-toastify";
import "./order.css";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [countdowns, setCountdowns] = useState({});
  const BASE_URL= "http://localhost:5000";
  /* ================= FETCH ORDERS ================= */

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        console.log("📥 Fetching orders...");
        const data = await request("/orders");
        console.log("📦 Orders received:", data);
        setOrders(data || []);
      } catch (err) {
        console.error("❌ Orders fetch error:", err);
        toast.error(err.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  /* ================= DELIVERY COUNTDOWN ================= */

  useEffect(() => {
    const interval = setInterval(() => {
      const newCountdowns = {};

      orders.forEach((order) => {
        if (order.deliveryTime && order.status === "Pending") {
          const diff = order.deliveryTime - Date.now();

          const mins = Math.floor(diff / 60000);
          const secs = Math.floor((diff % 60000) / 1000);

          newCountdowns[order._id] =
            diff > 0
              ? `${mins.toString().padStart(2, "0")}:${secs
                  .toString()
                  .padStart(2, "0")}`
              : "Delivered";

          if (diff <= 0 && order.status !== "Delivered") {
            setOrders((prev) =>
              prev.map((o) =>
                o._id === order._id
                  ? { ...o, status: "Delivered" }
                  : o
              )
            );
          }
        }
      });

      setCountdowns(newCountdowns);
    }, 1000);

    return () => clearInterval(interval);
  }, [orders]);

  /* ================= LOADING / EMPTY ================= */

  if (loading)
    return <h2 className="orders-message">Loading orders...</h2>;

  if (!orders || orders.length === 0)
    return <h2 className="orders-message">No orders found</h2>;

  /* ================= UI ================= */

  return (
    <div className="premium-orders">
      <h1 className="orders-title">My Orders</h1>

      {orders.map((order) => (
        <div key={order._id} className="order-card">
          <div className="order-header">
            <div>
              <p className="order-id">
                Order #{order._id.slice(-6)}
              </p>
              <p className="order-date">
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>

            <div className={`status-badge ${order.status?.toLowerCase()}`}>
              {order.status || "Pending"}
            </div>
          </div>

          <div className="order-items">
            {order.orderItems?.map((item, index) => (
              <div key={index} className="order-item">
               <img
  src={
    item.image
      ? `${BASE_URL}${item.image}`
      : "/placeholder.png"
  }
  alt={item.name}
  className="order-thumb"
/>

                <div className="order-item-info">
                  <p className="item-name">{item.name}</p>
                  <p className="item-variant">
                    {item.size} • {item.color}
                  </p>
                  <p className="item-qty">
                    Qty: {item.quantity}
                  </p>
                </div>

                <div className="order-price">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="order-footer">
            <div className="shipping-info">
              <p><strong>Address:</strong> {order.shippingAddress?.address}</p>
              <p><strong>City:</strong> {order.shippingAddress?.city}</p>
              <p><strong>Country:</strong> {order.shippingAddress?.country}</p>
            </div>

            <div className="order-summary">
              <p className="total-label">Total</p>
              <p className="total-price">
                ₹{order.totalPrice?.toFixed(2)}
              </p>

              {countdowns[order._id] && (
                <p className="delivery-timer">
                  Delivery in: {countdowns[order._id]}
                </p>
              )}
            </div>
          </div>

        </div>
      ))}
    </div>
  );
}