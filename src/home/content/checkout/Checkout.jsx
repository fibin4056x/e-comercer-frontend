import React, { useContext, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Context } from "../../../registrationpage/loginpages/Logincontext";
import { useNavigate } from "react-router-dom";
import { request } from "../../../services/api";
import "./checkout.css";

export default function Checkout() {
  const { cart, user, setCart } = useContext(Context);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const BASE_URL = "http://localhost:5000";

  const items = Array.isArray(cart?.items) ? cart.items : [];

  const subtotal = useMemo(() => {
    return items.reduce(
      (sum, item) =>
        sum +
        ((item.product?.price || 0) *
          (item.quantity || 0)),
      0
    );
  }, [items]);

  const shipping = subtotal > 0 ? 99 : 0;
  const total = subtotal + shipping;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    if (!user) {
      toast.error("Login required");
      navigate("/login");
      return;
    }

    if (items.length === 0) {
      toast.error("Cart is empty");
      navigate("/");
      return;
    }

    try {
      setLoading(true);

      await request("/orders", "POST", {
        shippingAddress: {
          address: data.address.trim(),
          city: data.city.trim(),
          postalCode: data.postalCode.trim(),
          country: data.country,
        },
      });

      toast.success("Order placed successfully");

      setCart({ items: [], total: 0 });
      reset();
      navigate("/");
    } catch (err) {
      toast.error(err.message || "Order failed");
    } finally {
      setLoading(false);
    }
  };

  /* ===== PROFESSIONAL CONDITION HANDLING ===== */

  if (!user) {
    return (
      <div className="checkout-state">
        <h2>Login Required</h2>
        <button onClick={() => navigate("/login")}>
          Go to Login
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="checkout-state">
        <h2>Your Cart is Empty</h2>
        <button onClick={() => navigate("/")}>
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="premium-checkout">

      {loading && <div className="checkout-overlay">Processing...</div>}

      <div className="checkout-card">

        {/* LEFT - FORM */}
        <div className="checkout-left">
          <h2>Shipping Details</h2>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>

            <input
              placeholder="Full Address"
              {...register("address", { required: true })}
            />
            {errors.address && <p className="error">Address required</p>}

            <input
              placeholder="City"
              {...register("city", { required: true })}
            />
            {errors.city && <p className="error">City required</p>}

            <input
              placeholder="Postal Code"
              {...register("postalCode", { required: true })}
            />
            {errors.postalCode && (
              <p className="error">Postal code required</p>
            )}

            <select {...register("country", { required: true })}>
              <option value="">Select Country</option>
              <option value="India">India</option>
              <option value="USA">USA</option>
              <option value="UK">UK</option>
              <option value="Canada">Canada</option>
            </select>

            <button
              type="submit"
              disabled={loading}
              className="primary-btn"
            >
              {loading ? "Processing..." : "Place Order"}
            </button>

          </form>
        </div>

        {/* RIGHT - SUMMARY */}
        <div className="checkout-right">
          <h2>Order Summary</h2>

          {items.map((item, index) => (
            <div key={index} className="summary-item">

              <img
                src={
                  item.product?.images?.[0]
                    ? `${BASE_URL}${item.product.images[0]}`
                    : "/placeholder.png"
                }
                alt={item.product?.name}
                className="summary-img"
              />

              <div className="summary-info">
                <p className="product-name">
                  {item.product?.name}
                </p>
                <p className="variant">
                  {item.size} • {item.color}
                </p>
                <p>Qty: {item.quantity}</p>
              </div>

              <div className="summary-price">
                ₹{(
                  (item.product?.price || 0) *
                  item.quantity
                ).toFixed(2)}
              </div>

            </div>
          ))}

          <hr />

          <div className="summary-breakdown">
            <div>
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div>
              <span>Shipping</span>
              <span>₹{shipping.toFixed(2)}</span>
            </div>
          </div>

          <div className="summary-total">
            <strong>Total</strong>
            <strong>₹{total.toFixed(2)}</strong>
          </div>

        </div>
      </div>
    </div>
  );
}