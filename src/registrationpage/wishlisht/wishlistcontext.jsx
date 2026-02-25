import axios from "axios";
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback
} from "react";
import { Context as LoginContext } from "../loginpages/Logincontext";
import { request } from "../../services/api";

const WishlistContext = createContext();

function WishlistProvider({ children }) {
  const { user } = useContext(LoginContext);
  const [wishlist, setWishlist] = useState([]);

  /* =========================
     FETCH WISHLIST (MEMOIZED)
  ========================= */
  const fetchWishlist = useCallback(async () => {
    if (!user?.token) return;

    try {
      console.log("📦 Fetching wishlist...");

      const data = await request("/wishlist", "GET", null, user.token);

      console.log("✅ Wishlist count:", data.length);

      setWishlist(data || []);
    } catch (error) {
      console.error("🔥 Wishlist Fetch Error:", error);
      setWishlist([]);
    }
  }, [user]);

  /* =========================
     LOAD WHEN USER CHANGES
  ========================= */
  useEffect(() => {
    if (user?.token) {
      fetchWishlist();
    } else {
      setWishlist([]);
    }
  }, [user, fetchWishlist]);

  /* =========================
     ADD TO WISHLIST
  ========================= */
  const addToWishlist = async (product) => {
    try {
      console.log("❤️ Adding to wishlist:", product._id);

      const data = await request(
        "/wishlist",
        "POST",
        { productId: product._id },
        user.token
      );

      setWishlist(data);

      console.log("✅ Wishlist updated");
    } catch (error) {
      console.error("🔥 Add Wishlist Error:", error);
    }
  };

  /* =========================
     REMOVE FROM WISHLIST
  ========================= */
  const removeFromWishlist = async (productId) => {
    try {
      console.log("❌ Removing from wishlist:", productId);

      const data = await request(
        `/wishlist/${productId}`,
        "DELETE",
        null,
        user.token
      );

      setWishlist(data);

      console.log("✅ Wishlist updated");
    } catch (error) {
      console.error("🔥 Remove Wishlist Error:", error);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        fetchWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export { WishlistContext };
export default WishlistProvider;