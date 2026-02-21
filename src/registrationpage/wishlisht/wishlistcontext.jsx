import axios from "axios";
import React, { createContext, useState, useContext, useEffect } from "react";
import { Context as LoginContext } from "../loginpages/Logincontext"; 

const WishlistContext = createContext();

function WishlistProvider({ children }) {
  const { user } = useContext(LoginContext);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    if (user && user.id) {
      fetchWishlist();
    } else {
      setWishlist([]);
    }
  }, [user]);

  const fetchWishlist = () => {
    if (!user || !user.id) return;
    axios
      .get(`http://localhost:3000/wishlist?userId=${user.id}`)
      .then((res) => setWishlist(res.data))
      .catch((err) => {
        console.error("Failed to fetch wishlist:", err);
        setWishlist([]);
      });
  };


  const addToWishlist = (item) => {
    if (!user || !user.id) {
      alert("Please login to add item to wishlist");
      return;
    }

    const exists = wishlist.some((w) => w.id === item.id);
    if (!exists) {
      const newItem = { ...item, userId: user.id };
      axios
        .post("http://localhost:3000/wishlist", newItem)
        .then((res) => setWishlist([...wishlist, res.data]))
        .catch((err) => console.error("Failed to add to wishlist:", err));
    } else {
      alert("Item already in wishlist");
    }
  };


  const removeFromWishlist = (itemId) => {
    axios
      .delete(`http://localhost:3000/wishlist/${itemId}`)
      .then(() => setWishlist(wishlist.filter((w) => w.id !== itemId)))
      .catch((err) => console.error("Failed to remove from wishlist:", err));
  };

  return (
    <WishlistContext.Provider
      value={{ wishlist, setWishlist, addToWishlist, removeFromWishlist, fetchWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export { WishlistContext };
export default WishlistProvider;
