/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { request } from "../../services/apiClient";

export const Context = createContext();

const getStoredUser = () => {
  try {
    const rawUser = localStorage.getItem("user");
    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    return null;
  }
};

function Logincontext({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loadingUser, setLoadingUser] = useState(true);

  const syncUser = useCallback((nextUser) => {
    setUser(nextUser);

    if (nextUser) {
      localStorage.setItem("user", JSON.stringify(nextUser));
    } else {
      localStorage.removeItem("user");
    }
  }, []);

  const restoreUser = useCallback(async () => {
    try {
      const profile = await request("/auth/profile", "GET");
      syncUser(profile);
      return profile;
    } catch {
      syncUser(null);
      return null;
    } finally {
      setLoadingUser(false);
    }
  }, [syncUser]);

  const fetchCart = useCallback(async () => {
    if (!user) {
      setCart({ items: [], total: 0 });
      return;
    }

    try {
      const data = await request("/cart", "GET");
      setCart(data || { items: [], total: 0 });
    } catch {
      setCart({ items: [], total: 0 });
    }
  }, [user]);

  useEffect(() => {
    restoreUser();
  }, [restoreUser]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const logout = useCallback(async () => {
    try {
      await request("/auth/logout", "POST");
    } catch {
      // Clear local state even if the server-side session has already expired.
    } finally {
      syncUser(null);
      setCart({ items: [], total: 0 });
    }
  }, [syncUser]);

  const value = useMemo(
    () => ({
      user,
      setUser: syncUser,
      cart,
      setCart,
      logout,
      loadingUser,
      restoreUser,
      fetchCart,
    }),
    [cart, fetchCart, loadingUser, logout, restoreUser, syncUser, user]
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export default Logincontext;
