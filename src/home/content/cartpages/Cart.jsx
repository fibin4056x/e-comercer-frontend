import React, { useContext, useMemo } from "react";
import { Context } from "../../../registrationpage/loginpages/Logincontext";
import "./cart.css";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { request } from "../../../services/api";

export default function Cart() {
  const { cart, user, setCart } = useContext(Context);

  const BASE_URL = "http://localhost:5000"; // 🔥 Added

  const items = Array.isArray(cart?.items) ? cart.items : [];

  const updateQuantity = async (item, quantity) => {
    try {
      const productId =
        typeof item.product === "object"
          ? item.product._id
          : item.product;

      const updated = await request(
        "/cart",
        "PUT",
        {
          productId,
          quantity,
          size: item.size,
          color: item.color,
        }
      );

      setCart(updated);
    } catch (err) {
      toast.error(err.message || "Update failed");
    }
  };

  const removeItem = async (item) => {
    try {
      const productId =
        typeof item.product === "object"
          ? item.product._id
          : item.product;

      const encodedSize = encodeURIComponent(item.size);
      const encodedColor = encodeURIComponent(item.color);

      const updated = await request(
        `/cart/${productId}/${encodedSize}/${encodedColor}`,
        "DELETE"
      );

      setCart(updated);
      toast.success("Item removed");
    } catch (err) {
      toast.error(err.message || "Remove failed");
    }
  };

  const totalPrice = useMemo(() => {
    return items.reduce(
      (total, item) =>
        total +
        (item.product?.price || 0) *
          (item.quantity || 0),
      0
    );
  }, [items]);

  if (!user) return <h2 className="cart-msg">Login required</h2>;
  if (!cart) return <h2 className="cart-msg">Loading...</h2>;

  return (
    <div className="modern-cart">
      <div className="cart-left">
        <h1 className="cart-title">Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="empty-box">
            <p>Your cart is empty.</p>
            <Link to="/" className="shop-link">
              Continue Shopping
            </Link>
          </div>
        ) : (
          items.map((item, index) => (
            <div
              key={`${item.product._id}-${item.size}-${item.color}-${index}`}
              className="cart-row"
            >
              <img
                src={
                  item.product.images?.[0]
                    ? `${BASE_URL}${item.product.images[0]}`
                    : "/placeholder.png"
                }
                alt={item.product.name}
                className="cart-img"
              />

              <div className="cart-content">
                <h3>{item.product.name}</h3>

                <p className="variant">
                  {item.size} • {item.color}
                </p>

                <div className="cart-actions">
                  <div className="qty-box">
                    <button
                      onClick={() =>
                        updateQuantity(
                          item,
                          item.quantity - 1 <= 0
                            ? 1
                            : item.quantity - 1
                        )
                      }
                    >
                      −
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      onClick={() =>
                        updateQuantity(
                          item,
                          item.quantity + 1
                        )
                      }
                    >
                      +
                    </button>
                  </div>

                  <button
                    className="remove"
                    onClick={() => removeItem(item)}
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="cart-price">
                ₹
                {(item.product.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))
        )}
      </div>

      {items.length > 0 && (
        <div className="cart-right">
          <div className="summary-card">
            <h2>Order Summary</h2>

            <div className="summary-line">
              <span>Subtotal</span>
              <span>₹{totalPrice.toFixed(2)}</span>
            </div>

            <div className="summary-line">
              <span>Shipping</span>
              <span>Free</span>
            </div>

            <hr />

            <div className="summary-total">
              <span>Total</span>
              <span>₹{totalPrice.toFixed(2)}</span>
            </div>

            <Link to="/checkout" className="checkout-btn">
              Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}