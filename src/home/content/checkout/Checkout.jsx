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

  const BASE_URL = "http://localhost:5000"; // 🔥 Added for images

  const items = Array.isArray(cart?.items) ? cart.items : [];

  const total = useMemo(() => {
    return items.reduce(
      (sum, item) =>
        sum +
        (item.product?.price || 0) *
          (item.quantity || 0),
      0
    );
  }, [items]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    if (!user) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    try {
      setLoading(true);

      const orderData = {
        shippingAddress: {
          address: data.address.trim(),
          city: data.city.trim(),
          postalCode: data.postalCode.trim(),
          country: data.country,
        },
      };

      const response = await request("/orders", "POST", orderData);

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

  if (!user)
    return <h2 className="checkout-msg">Login required</h2>;

  if (items.length === 0)
    return <h2 className="checkout-msg">Cart is empty</h2>;

  return (
    <div className="premium-checkout">
      <div className="checkout-card">
        <div className="checkout-left">
          <h2>Shipping Details</h2>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>

            <input
              placeholder="Address"
              {...register("address", { required: true })}
            />
            {errors.address && (
              <p className="error">Address required</p>
            )}

            <input
              placeholder="City"
              {...register("city", { required: true })}
            />
            {errors.city && (
              <p className="error">City required</p>
            )}

            <input
              placeholder="Postal Code"
              {...register("postalCode", { required: true })}
            />
            {errors.postalCode && (
              <p className="error">Postal code required</p>
            )}

            <select
              {...register("country", { required: true })}
            >
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

        <div className="checkout-right">
          <h2>Order Summary</h2>

          {items.map((item, index) => (
            <div key={index} className="summary-item">

              <img
                src={
                  item.product.images?.[0]
                    ? `${BASE_URL}${item.product.images[0]}`
                    : "/placeholder.png"
                }
                alt={item.product.name}
                className="summary-img"
              />

              <div className="summary-info">
                <p className="product-name">
                  {item.product.name}
                </p>
                <p className="variant">
                  {item.size} • {item.color}
                </p>
                <p>Qty: {item.quantity}</p>
              </div>

              <div className="summary-price">
                ₹{(
                  item.product.price *
                  item.quantity
                ).toFixed(2)}
              </div>

            </div>
          ))}

          <hr />

          <div className="summary-total">
            <strong>Total</strong>
            <strong>₹{total.toFixed(2)}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}