import React, { createContext, useEffect, useState } from "react";
import { request } from "../../services/api";

export const Context = createContext();

function Logincontext({ children }) {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState({ items: [] });
  const [loadingUser, setLoadingUser] = useState(true);

  /* =========================
     RESTORE USER FROM COOKIE
     (No token needed)
  ========================= */
  useEffect(() => {
    const restoreUser = async () => {
      try {
        console.log("🔄 Checking existing session...");

        const profile = await request(
          "/auth/profile",
          "GET",
          null,
          true
        );

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
        const data = await request("/cart", "GET", null, true);
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

      await request("/auth/logout", "POST", null, true);

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