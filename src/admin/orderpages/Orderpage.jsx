import React, { useEffect, useState, useContext, useMemo } from "react";
import { request } from "../../services/api";
import { Context } from "../../registrationpage/loginpages/Logincontext";
import { toast } from "react-toastify";
import { FiPackage, FiTruck, FiCheckCircle, FiXCircle, FiClock, FiTrendingUp, FiShoppingBag } from "react-icons/fi";
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
        const data = await request("/orders/admin");
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("❌ Error fetching orders:", err);
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);
    const pending = orders.filter(o => o.status !== "Delivered" && o.status !== "Cancelled").length;
    return { totalRevenue, pending, count: orders.length };
  }, [orders]);

  const markDelivered = async (id) => {
    if (!window.confirm("Confirm delivery update?")) return;
    try {
      await request(`/orders/${id}/deliver`, "PUT");
      setOrders(prev => prev.map(o => o._id === id ? { ...o, isDelivered: true, status: "Delivered" } : o));
      toast.success("Order status updated to Delivered");
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const cancelOrder = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      await request(`/orders/${id}/cancel`, "PUT");
      setOrders(prev => prev.map(o => o._id === id ? { ...o, status: "Cancelled" } : o));
      toast.warn("Order has been cancelled");
    } catch (err) {
      toast.error("Cancellation failed");
    }
  };

  if (loading) return (
    <div className="premium-loader-wrapper">
      <div className="premium-loader"></div>
      <p>Syncing Ledger...</p>
    </div>
  );

  return (
    <div className="admin-page-wrapper">
      <header className="premium-admin-header">
        <div className="header-brand">
          <h1>Fulfillments</h1>
          <p>Real-time transaction & logistics monitor</p>
        </div>
        
        <div className="stats-container">
          <div className="premium-stat-card revenue">
            <div className="stat-icon"><FiTrendingUp /></div>
            <div className="stat-info">
              <span>Total Revenue</span>
              <h3>₹{stats.totalRevenue.toLocaleString()}</h3>
            </div>
          </div>
          <div className="premium-stat-card active">
            <div className="stat-icon"><FiShoppingBag /></div>
            <div className="stat-info">
              <span>Active Orders</span>
              <h3>{stats.pending}</h3>
            </div>
          </div>
        </div>
      </header>

      {!orders.length ? (
        <div className="premium-empty-state">
          <div className="empty-icon-pulse">
            <FiPackage size={60} />
          </div>
          <h3>The desk is clear</h3>
          <p>No customer orders found in the database.</p>
        </div>
      ) : (
        <div className="premium-orders-grid">
          {orders.map(order => (
            <div key={order._id} className="order-glass-card">
              <div className="card-header-row">
                <div className="id-tag">
                  <span className="hash">ID</span>
                  <span className="value">{order._id.slice(-6).toUpperCase()}</span>
                </div>
                <div className={`premium-badge ${order.status?.toLowerCase()}`}>
                  {order.status || "Pending"}
                </div>
              </div>

              <div className="card-body">
                <div className="user-profile-section">
                  <div className="avatar-circle">
                    {order.user?.username?.charAt(0) || "G"}
                  </div>
                  <div className="user-text">
                    <h6>{order.user?.username || "Guest Customer"}</h6>
                    <p>{order.user?.email || "No email provided"}</p>
                  </div>
                  <div className="time-stamp">
                     <FiClock /> {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="items-scroll-area">
                  {order.orderItems?.map((item, i) => (
                    <div key={i} className="scroll-item">
                      <div className="item-thumb">
                        <img src={item.image ? `${BASE_URL}${item.image}` : "/placeholder.png"} alt="" />
                      </div>
                      <div className="item-meta">
                        <p className="item-name">{item.name}</p>
                        <p className="item-sub">Qty: <b>{item.quantity}</b> • {item.size}</p>
                      </div>
                      <p className="item-price">₹{item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card-action-footer">
                <div className="grand-total-section">
                  <span className="label">Amount Paid</span>
                  <span className="currency">₹{order.totalPrice?.toLocaleString()}</span>
                </div>
                
                <div className="button-group">
                  {order.status !== "Delivered" && order.status !== "Cancelled" && (
                    <>
                      <button className="action-btn cancel-flat" onClick={() => cancelOrder(order._id)}>
                        <FiXCircle /> <span>cancel</span>
                      </button>
                      <button className="action-btn ship-main" onClick={() => markDelivered(order._id)}>
                        <FiTruck /> <span>Ship Now</span>
                      </button>
                    </>
                  )}
                  {order.status === "Delivered" && (
                     <div className="delivered-mark"><FiCheckCircle /> Completed</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}