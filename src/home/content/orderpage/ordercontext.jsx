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
      if (!user?.token) {
        setOrders([]);
        return;
      }

      try {
        setLoading(true);

        const response = await axios.get(
          `${API}/myorders`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );

        console.log("Fetched Orders:", response.data);

        setOrders(response.data || []);
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error("Failed to fetch orders");
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