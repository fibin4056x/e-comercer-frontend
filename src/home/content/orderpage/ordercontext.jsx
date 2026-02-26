import axios from "axios";
import React, { createContext, useEffect, useState, useContext } from "react";
import { toast } from "react-toastify";
import { Context } from "../../../registrationpage/loginpages/Logincontext";

const OrderContext = createContext();

export default function OrderProvider({ children }) {
  const { user } = useContext(Context);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const API = "http://localhost:5000/api/orders";

  useEffect(() => {
    const fetchOrders = async () => {

      if (!user) {
        console.log("⚠ No user found. Clearing orders.");
        setOrders([]);
        return;
      }

      try {
        setLoading(true);

        console.log("📥 Fetching orders (cookie-based)...");

        const response = await axios.get(
          API,
          {
            withCredentials: true, // 🔥 REQUIRED FOR COOKIE AUTH
          }
        );

        console.log("📦 Orders response:", response.data);

        setOrders(response.data || []);

      } catch (error) {
        console.error("❌ Error fetching orders:", error.response?.data || error);

        if (error.response?.status === 401) {
          toast.error("Session expired. Please login again.");
        } else {
          toast.error("Failed to fetch orders");
        }

        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

  }, [user]);

  return (
    <OrderContext.Provider
      value={{ orders, setOrders, loading }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export { OrderContext };