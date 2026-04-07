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

  /* =========================
     RESTORE USER FROM COOKIE
     (No token needed)
  ========================= */
  useEffect(() => {
    const restoreUser = async () => {
      try {
        console.log("🔄 Checking existing session...");
const profile = await request("/auth/profile", "GET");

        console.log("✅ Session restored:", profile);

        setUser(profile);
        localStorage.setItem("user", JSON.stringify(profile));

      } catch (error) {
        console.log("⚠ No active session");
        setUser(null);
        localStorage.removeItem("user");
      } finally {
        setLoadingUser(false);
      }
    };

    restoreUser();
  }, []);

  /* =========================
     FETCH CART WHEN USER CHANGES
     (Cookie-based)
  ========================= */
  useEffect(() => {
    const fetchCart = async () => {
      if (!user) {
        setCart({ items: [] });
        return;
      }

      try {
        console.log("🛒 Fetching cart...");
       const data = await request("/cart", "GET");
        setCart(data || { items: [] });
      } catch (error) {
        console.error("❌ Cart fetch error:", error);
        setCart({ items: [] });
      }
    };

    fetchCart();
  }, [user]);

  /* =========================
     LOGOUT
  ========================= */
  const logout = async () => {
    try {
      console.log("🚪 Logging out...");

     await request("/auth/logout", "POST");

      setUser(null);
      setCart({ items: [] });
      localStorage.removeItem("user");

      console.log("✅ Logout successful");
    } catch (error) {
      console.error("❌ Logout error:", error);
    }
  };

  return (
    <Context.Provider
      value={{
        user,
        setUser,
        cart,
        setCart,
        logout,
        loadingUser,
      }}
    >
      {children}
    </Context.Provider>
  );
}

export default Logincontext;
