import React, { useEffect, useState } from "react";
import { request } from "../../../services/api";
import { toast } from "react-toastify";
import "./order.css";

export default function Orders() {

  const [orders,setOrders] = useState([]);
  const [loading,setLoading] = useState(true);

  const BASE_URL = "https://e-comerce-backend-cfkk.onrender.com";

  /* ================= FETCH ORDERS ================= */

  const fetchOrders = async()=>{

    try{

      setLoading(true);

      const data = await request("/orders/my");

      setOrders(Array.isArray(data) ? data : []);

    }catch(err){

      console.error("❌ Orders error:",err);
      toast.error("Failed to load orders");

    }finally{

      setLoading(false);

    }

  };

  useEffect(()=>{
    fetchOrders();
  },[]);



  /* ================= CANCEL ORDER ================= */

  const cancelOrder = async(id)=>{

    const confirm = window.confirm("Cancel this order?");
    if(!confirm) return;

    try{

      await request(`/orders/${id}/cancel`,"PUT");

      toast.success("Order cancelled");

      fetchOrders(); // refresh from server

    }catch(err){

      console.error("Cancel error:",err);
      toast.error("Cancel failed");

    }

  };



  /* ================= STATUS CLASS ================= */

  const statusClass = (status)=>{

    switch(status){
      case "Delivered":
        return "status delivered";

      case "Cancelled":
        return "status cancelled";

      case "Shipped":
        return "status shipped";

      default:
        return "status processing";
    }

  };



  /* ================= LOADING ================= */

  if(loading){

    return(
      <div className="orders-loading">
        Loading your orders...
      </div>
    );

  }



  /* ================= EMPTY ================= */

  if(!orders.length){

    return(
      <div className="orders-empty">

        <h2>No orders yet</h2>
        <p>Looks like you haven't placed an order.</p>

      </div>
    );

  }



  /* ================= UI ================= */

  return(

    <div className="orders-container">

      <h1 className="orders-title">
        My Orders
      </h1>


      {orders.map(order => (

        <div key={order._id} className="order-card">

          {/* HEADER */}

          <div className="order-header">

            <div>

              <p className="order-id">
                Order #{order._id.slice(-6)}
              </p>

              <p className="order-date">
                {new Date(order.createdAt).toLocaleString()}
              </p>

            </div>


            <div className="order-badges">

              <span className={`status-badge ${statusClass(order.status)}`}>
                {order.status || "Processing"}
              </span>

              <span className={`payment-badge ${order.isPaid ? "paid" : "unpaid"}`}>
                {order.isPaid ? "Paid" : "Unpaid"}
              </span>

            </div>

          </div>



          {/* ITEMS */}

          <div className="order-items">

            {(order.orderItems || []).map((item,i)=>(

              <div key={i} className="order-item">

                <img
                  src={item.image ? `${BASE_URL}${item.image}` : "/placeholder.png"}
                  alt={item.name}
                  className="order-thumb"
                />

                <div className="order-item-info">

                  <p className="item-name">
                    {item.name}
                  </p>

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



          {/* FOOTER */}

          <div className="order-footer">

            <div className="shipping-info">

              <p>
                <strong>Address:</strong>
              </p>

              <p>{order.shippingAddress?.address}</p>

              <p>
                {order.shippingAddress?.city},{" "}
                {order.shippingAddress?.postalCode},{" "}
                {order.shippingAddress?.country}
              </p>

            </div>


            <div className="order-summary">

              <p className="total-price">
                ₹{order.totalPrice?.toFixed(2)}
              </p>


              {order.status === "Processing" && (

                <button
                  className="cancel-btn"
                  onClick={()=>cancelOrder(order._id)}
                >
                  Cancel Order
                </button>

              )}

            </div>

          </div>

        </div>

      ))}

    </div>

  );

}