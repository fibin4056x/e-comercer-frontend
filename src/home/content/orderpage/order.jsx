import React, { useContext, useEffect, useState } from "react";
import { OrderContext } from "./ordercontext";
import "./order.css";
import { Context } from "../../../registrationpage/loginpages/Logincontext";
import axios from "axios";
import { toast } from "react-toastify";

export default function Orders() {
  const { user } = useContext(Context);
  const { orders, setOrders, cancelOrderById, cancelAllOrders } =
    useContext(OrderContext);

  const [countdowns, setCountdowns] = useState({});
  const [confirmModal, setConfirmModal] = useState({
    visible: false,
    type: "",
    orderId: null,
  });

  useEffect(() => {
    console.log("USER:", user);
    console.log("ORDERS:", orders);
  }, [user, orders]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!orders) return;

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
              : "00:00";

          if (diff <= 0 && order.status !== "Delivered") {
            setOrders((prev) =>
              prev.map((o) =>
                o._id === order._id
                  ? { ...o, status: "Delivered" }
                  : o
              )
            );

            axios
              .patch(
                `http://localhost:5000/api/orders/${order._id}`,
                { status: "Delivered" }
              )
              .catch(console.error);

            toast.info(`Order ${order._id} delivered!`);
          }
        }
      });

      setCountdowns(newCountdowns);
    }, 1000);

    return () => clearInterval(interval);
  }, [orders, setOrders]);

  if (!user) return <h2>Please login to see your orders</h2>;
  if (!orders || orders.length === 0)
    return <p className="no-orders">No orders found</p>;

  return (
    <div className="orders-wrapper">
      {orders.map((order) => (
        <div key={order._id} className="order-card">
          <div className="order-header">
            <h2>Order #{order._id.slice(-6)}</h2>
          </div>

          <p><strong>Address:</strong> {order.shippingAddress?.address}</p>
          <p><strong>City:</strong> {order.shippingAddress?.city}</p>
          <p><strong>Country:</strong> {order.shippingAddress?.country}</p>

          <h3>Items</h3>
          {order.orderItems?.map((item, index) => (
            <div key={index} className="order-item">
              <p>{item.name}</p>
              <p>Qty: {item.quantity}</p>
              <p>₹ {item.price}</p>
            </div>
          ))}

          <h3>Total: ₹ {order.totalPrice}</h3>

          <p className={`status ${order.status?.toLowerCase()}`}>
            {order.status || "Pending"}
          </p>
        </div>
      ))}
    </div>
  );
}