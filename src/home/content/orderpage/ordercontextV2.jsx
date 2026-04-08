import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { request } from "../../../services/apiClient";
import { Context } from "../../../registrationpage/loginpages/LogincontextV2";

const OrderContext = createContext();

export default function OrderProvider({ children }) {
  const { user, loadingUser } = useContext(Context);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (loadingUser) {
      return [];
    }

    if (!user) {
      setOrders([]);
      setLoading(false);
      return [];
    }

    try {
      setLoading(true);
      const data = await request("/orders/my");
      const nextOrders = Array.isArray(data) ? data : [];
      setOrders(nextOrders);
      return nextOrders;
    } catch (error) {
      toast.error(error.message || "Failed to fetch orders");
      setOrders([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [loadingUser, user]);

  const cancelOrder = useCallback(async (id) => {
    await request(`/orders/${id}/cancel`, "PUT");

    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order._id === id ? { ...order, status: "Cancelled" } : order
      )
    );

    toast.success("Order cancelled");
  }, []);

  useEffect(() => {
    if (!loadingUser) {
      fetchOrders();
    }
  }, [fetchOrders, loadingUser]);

  const value = useMemo(
    () => ({
      orders,
      setOrders,
      loading,
      fetchOrders,
      cancelOrder,
    }),
    [cancelOrder, fetchOrders, loading, orders]
  );

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export { OrderContext };
