import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Context as LoginContext } from "../loginpages/LogincontextV2";
import { request } from "../../services/apiClient";

const WishlistContext = createContext();

function WishlistProvider({ children }) {
  const { user, loadingUser } = useContext(LoginContext);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchWishlist = useCallback(async () => {
    if (loadingUser) {
      return [];
    }

    if (!user) {
      setWishlist([]);
      setError("");
      setLoading(false);
      return [];
    }

    try {
      setLoading(true);
      setError("");

      const data = await request("/wishlist", "GET");
      const nextWishlist = Array.isArray(data) ? data : [];
      setWishlist(nextWishlist);
      return nextWishlist;
    } catch (fetchError) {
      setWishlist([]);
      setError(fetchError.message || "Failed to load wishlist");
      return [];
    } finally {
      setLoading(false);
    }
  }, [loadingUser, user]);

  useEffect(() => {
    if (!loadingUser) {
      fetchWishlist();
    }
  }, [fetchWishlist, loadingUser]);

  const addToWishlist = useCallback(
    async (product) => {
      if (!user) {
        throw new Error("Please login to use wishlist");
      }

      const data = await request("/wishlist", "POST", {
        productId: product._id,
      });

      const nextWishlist = Array.isArray(data) ? data : [];
      setWishlist(nextWishlist);
      setError("");
      return nextWishlist;
    },
    [user]
  );

  const removeFromWishlist = useCallback(
    async (productId) => {
      if (!user) {
        throw new Error("Please login to use wishlist");
      }

      const data = await request(`/wishlist/${productId}`, "DELETE");
      const nextWishlist = Array.isArray(data) ? data : [];
      setWishlist(nextWishlist);
      setError("");
      return nextWishlist;
    },
    [user]
  );

  const value = useMemo(
    () => ({
      wishlist,
      loading,
      error,
      addToWishlist,
      removeFromWishlist,
      fetchWishlist,
    }),
    [addToWishlist, error, fetchWishlist, loading, removeFromWishlist, wishlist]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export { WishlistContext };
export default WishlistProvider;
