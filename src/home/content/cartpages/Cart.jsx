import React, { useContext } from "react";
import { Context } from "../../../registrationpage/loginpages/Logincontext";
import "./cart.css";
import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

export default function Cart() {
  const { cart, user, setcart } = useContext(Context);

  const increaseQuantity = async (item) => {
    try {
      const updatedData = { quantity: item.quantity + 1 };
      await axios.patch(`http://localhost:3000/cart/${item.id}`, updatedData);
      setcart(
        cart.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to increase quantity");
    }
  };

  const decreaseQuantity = async (item) => {
    if (item.quantity <= 1) {
      try {
        await axios.delete(`http://localhost:3000/cart/${item.id}`);
        setcart(cart.filter((i) => i.id !== item.id));
        toast.info(`${item.name} removed from cart`);
      } catch (err) {
        console.error(err);
        toast.error("Failed to remove item");
      }
      return;
    }
    try {
      const updatedData = { quantity: item.quantity - 1 };
      await axios.patch(`http://localhost:3000/cart/${item.id}`, updatedData);
      setcart(
        cart.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i
        )
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to decrease quantity");
    }
  };

  const removeItem = async (item) => {
    try {
      await axios.delete(`http://localhost:3000/cart/${item.id}`);
      setcart(cart.filter((i) => i.id !== item.id));
      toast.info(`${item.name} removed from cart`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove item");
    }
  };

  if (!user) return <h2>Please login to see your cart</h2>;
  if (!cart) return <h2>Loading cart...</h2>;

  return (
    <div className="cart-container cool-cart">
      <h1>{user.username}'s Cart 🛒</h1>

      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul className="cart-list">
            {cart.map((item) => (
              <li key={item.id} className="cart-item">
                <img
                  src={item.images?.[0] || "/placeholder.png"}
                  alt={item.name || "Product"}
                  className="cart-item-img"
                />
                <div className="cart-item-info">
                  <h3>{item.name}</h3>
                  <p>Price: ${item.price}</p>
                  <div className="quantity-buttons">
                    <button onClick={() => decreaseQuantity(item)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => increaseQuantity(item)}>+</button>
                    <button
                      className="remove"
                      onClick={() => removeItem(item)}
                    >
                      Remove
                    </button>
                  </div>
               
                </div>
              </li>
            ))}
          </ul>

          <div className="checkout-container">
            <Link to={`order/`} className="checkout-btn">
              Checkout All
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
