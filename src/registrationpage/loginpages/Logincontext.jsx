import React, { createContext, useEffect, useState } from "react";
import { request } from "../../services/api";

export const Context = createContext();

function Logincontext({ children }) {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState({ items: [] });
  const [loadingUser, setLoadingUser] = useState(true);

  /* =========================
     RESTORE USER FROM LOCALSTORAGE
  ========================= */
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);

        if (parsedUser?.token) {
          setUser(parsedUser);
        } else {
          localStorage.removeItem("user");
        }
      } catch {
        localStorage.removeItem("user");
      }
    }

    setLoadingUser(false);
  }, []);

  /* =========================
     FETCH CART WHEN USER CHANGES
  ========================= */
  useEffect(() => {
    const fetchCart = async () => {
      if (!user?.token) {
        setCart({ items: [] });
        return;
      }

      try {
        const data = await request("/cart", "GET", null, user.token);
        setCart(data || { items: [] });
      } catch {
        setCart({ items: [] });
      }
    };

    fetchCart();
  }, [user]);

  /* =========================
     LOGOUT
  ========================= */
  const logout = () => {
    setUser(null);
    setCart({ items: [] });
    localStorage.removeItem("user");
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