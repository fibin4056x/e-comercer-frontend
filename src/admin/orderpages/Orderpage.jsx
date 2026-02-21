import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Context } from "../../registrationpage/loginpages/Logincontext";
import { toast } from "react-toastify";
import "./Orderpage.css";


export default function Orderpage() {
  const { user } = useContext(Context);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState({ visible: false, type: "", orderId: null });

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      try {
        let res;
        if (user.role?.toLowerCase() === "admin") {
          res = await axios.get("db.json");
        } else {
          res = await axios.get(`http://localhost:3000/order?userId=${user.id}`);
        }

        const normalized = res.data.map((o) => ({
          ...o,
          status: o.status || "Pending",
          items: o.items || [],
        }));

        setOrders(normalized);
      } catch (err) {
        console.error("Error fetching orders:", err);
        toast.error("Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);


  const handleSetDelivery = async (orderId, minutes) => {
    try {
      const deliveryTime = Date.now() + minutes * 60 * 1000;
      await axios.patch(`http://localhost:3000/order/${orderId}`, {
        deliveryTime,
        status: "Pending",
      });
      toast.success(`Delivery time set for ${minutes} minute(s)`);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, deliveryTime, status: "Pending" } : o
        )
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to set delivery time");
    }
  };


  const handleCancel = (orderId) => {
    setConfirmModal({ visible: true, type: "single", orderId });
  };

  const handleCancelConfirmed = async () => {
    if (confirmModal.type === "single") {
      try {
        await axios.patch(`http://localhost:3000/order/${confirmModal.orderId}`, { status: "Cancelled" });
        setOrders((prev) =>
          prev.map((o) =>
            o.id === confirmModal.orderId ? { ...o, status: "Cancelled" } : o
          )
        );
        toast.success("Order cancelled");
      } catch (err) {
        console.error(err);
        toast.error("Failed to cancel order");
      }
    }
    setConfirmModal({ visible: false, type: "", orderId: null });
  };

  const handleCancelDecline = () => {
    setConfirmModal({ visible: false, type: "", orderId: null });
  };

  const handleRemoveOrder = (orderId) => {
    setConfirmModal({ visible: true, type: "remove", orderId });
  };

  const handleRemoveConfirmed = async () => {
    try {
      await axios.delete(`http://localhost:3000/order/${confirmModal.orderId}`);
      setOrders((prev) => prev.filter((o) => o.id !== confirmModal.orderId));
      toast.success("Order removed");
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove order");
    }
    setConfirmModal({ visible: false, type: "", orderId: null });
  };


  useEffect(() => {
    const interval = setInterval(() => {
      setOrders((prevOrders) =>
        prevOrders.map((order) => {
          if (order.deliveryTime && order.status === "Pending") {
            if (Date.now() >= order.deliveryTime) {
              axios.patch(`http://localhost:3000/order/${order.id}`, { status: "Delivered" }).catch(console.error);
              return { ...order, status: "Delivered" };
            }
          }
          return order;
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getCountdown = (deliveryTime) => {
    if (!deliveryTime) return "00:00";
    const diff = deliveryTime - Date.now();
    if (diff <= 0) return "00:00";
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) return <p className="upage-loading-text">Loading orders...</p>;
  if (!orders || orders.length === 0) return <p className="upage-no-orders">No orders found!</p>;

  return (
    <div className="upage-orders-container">
      <h1 className="upage-orders-title">Your Orders</h1>
      {orders.map((order) => (
        <div key={order.id} className="upage-order-card">
          <div className="upage-order-header">
            <h3>
              Order #{order.id} – {order.firstname || ""} {order.lastname || ""}
            </h3>
            {user.role?.toLowerCase() === "admin" && (
              <button className="upage-remove-btn" onClick={() => handleRemoveOrder(order.id)}>
                Remove
              </button>
            )}
          </div>

          <p className="upage-order-contact">Contact: {order.contact || "N/A"}</p>
          <p className="upage-order-address">
            Address: {order.address || ""}, {order.city || ""}, {order.postalcode || ""}
          </p>
          <p className="upage-order-total">
            <strong>Total: ₹{order.total || 0}</strong>
          </p>

          <h4>Items</h4>
          <ul className="upage-order-items">
            {order.items.length > 0
              ? order.items.map((item, i) => (
                  <li key={i} className="upage-order-item">
                    {item.name || "Item"} – {item.quantity || 0} × ₹{item.price || 0}
                  </li>
                ))
              : "No items"}
          </ul>

          {order.status === "Pending" && order.deliveryTime && (
            <p className="upage-countdown">Delivery in: {getCountdown(order.deliveryTime)}</p>
          )}

          <p className={`upage-order-status ${order.status.toLowerCase()}`}>
            Status: {order.status || "Unknown"}
          </p>

          {/* Admin delivery buttons */}
          {user.role?.toLowerCase() === "admin" && order.status === "Pending" && (
            <div className="upage-admin-actions">
              <button onClick={() => handleSetDelivery(order.id, 1)}>1 min</button>
              <button onClick={() => handleSetDelivery(order.id, 5)}>5 min</button>
              <button onClick={() => handleSetDelivery(order.id, 30)}>30 min</button>
            </div>
          )}

          {user.role?.toLowerCase() === "customer" && order.status === "Pending" && (
            <button className="upage-cancel-btn" onClick={() => handleCancel(order.id)}>
              Cancel Order
            </button>
          )}
        </div>
      ))}


      {confirmModal.visible && (
        <div className="upage-confirm-modal">
          <div className="upage-confirm-box">
            <p>
              {confirmModal.type === "single"
                ? "Are you sure you want to cancel this order?"
                : confirmModal.type === "remove"
                ? "Are you sure you want to remove this order?"
                : ""}
            </p>
            <div className="upage-confirm-buttons">
              <button
                className="upage-confirm-btn yes"
                onClick={
                  confirmModal.type === "single" ? handleCancelConfirmed : handleRemoveConfirmed
                }
              >
                Yes
              </button>
              <button className="upage-confirm-btn no" onClick={handleCancelDecline}>
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
