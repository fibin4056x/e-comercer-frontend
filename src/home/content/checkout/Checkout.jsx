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
    if (!user?.token) {
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

      await request(
        "/orders",
        "POST",
        orderData,
        user.token
      );

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
    <div className="checkout-container">
      <div className="checkout-left">
        <h2>Shipping Details</h2>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>

          {/* ADDRESS */}
          <input
            placeholder="Address"
            {...register("address", {
              required: "Address is required",
              minLength: {
                value: 5,
                message: "Address must be at least 5 characters",
              },
              validate: (value) =>
                value.trim().length > 0 ||
                "Address cannot be empty",
            })}
          />
          {errors.address && <p className="error">{errors.address.message}</p>}

          {/* CITY */}
          <input
            placeholder="City"
            {...register("city", {
              required: "City is required",
              minLength: {
                value: 2,
                message: "City must be at least 2 characters",
              },
              pattern: {
                value: /^[A-Za-z\s]+$/,
                message: "City must contain only letters",
              },
            })}
          />
          {errors.city && <p className="error">{errors.city.message}</p>}

          {/* POSTAL CODE */}
          <input
            placeholder="Postal Code"
            {...register("postalCode", {
              required: "Postal code is required",
              pattern: {
                value: /^[0-9]{6}$/,
                message: "Postal code must be 6 digits",
              },
            })}
          />
          {errors.postalCode && (
            <p className="error">{errors.postalCode.message}</p>
          )}

          {/* COUNTRY (Dropdown – Recommended) */}
          <select
            {...register("country", {
              required: "Please select a country",
            })}
          >
            <option value="">Select Country</option>
            <option value="India">India</option>
            <option value="USA">USA</option>
            <option value="UK">UK</option>
            <option value="Canada">Canada</option>
          </select>
          {errors.country && (
            <p className="error">{errors.country.message}</p>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Placing Order..." : "Place Order"}
          </button>
        </form>
      </div>

      <div className="checkout-right">
        <h2>Order Summary</h2>

        {items.map((item, index) => (
          <div key={index} className="summary-row">
            <span>
              {item.product.name} × {item.quantity}
            </span>
            <span>
              ₹
              {(item.product.price *
                item.quantity).toFixed(2)}
            </span>
          </div>
        ))}

        <hr />

        <div className="summary-total">
          <strong>Total</strong>
          <strong>₹{total.toFixed(2)}</strong>
        </div>
      </div>
    </div>
  );
}