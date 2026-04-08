import { useContext, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { getNames } from "country-list";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import SmartImage from "../../../components/SmartImage";
import { Context } from "../../../registrationpage/loginpages/LogincontextV2";
import { OrderContext } from "../orderpage/ordercontextV2";
import { request } from "../../../services/apiClient";
import formatCurrency from "../../../utilitis/formatCurrency";

const countries = getNames();

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, setCart, user } = useContext(Context) || {};
  const { fetchOrders } = useContext(OrderContext) || {};
  const [submitting, setSubmitting] = useState(false);

  const items = useMemo(() => (Array.isArray(cart?.items) ? cart.items : []), [cart?.items]);
  const subtotal = useMemo(
    () =>
      items.reduce(
        (total, item) => total + (item.product?.price || 0) * (item.quantity || 0),
        0
      ),
    [items]
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      address: "",
      city: "",
      postalCode: "",
      country: "India",
      paymentMethod: "COD",
    },
  });

  const onSubmit = async (values) => {
    try {
      setSubmitting(true);

      await request("/orders", "POST", {
        shippingAddress: {
          address: values.address.trim(),
          city: values.city.trim(),
          postalCode: values.postalCode.trim(),
          country: values.country.trim(),
        },
        paymentMethod: values.paymentMethod,
      });

      setCart({ items: [], total: 0 });
      await fetchOrders?.();
      toast.success("Order placed successfully");
      navigate("/order", { replace: true });
    } catch (error) {
      toast.error(error.message || "Unable to place order");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <section className="store-section store-empty-state">
        <h1>Login required</h1>
        <p>Sign in first so we can attach shipping and order history to your account.</p>
        <Link to="/login" className="store-primary-button">
          Login
        </Link>
      </section>
    );
  }

  if (!items.length) {
    return (
      <section className="store-section store-empty-state">
        <h1>Your cart is empty</h1>
        <p>Add something to your bag before moving to checkout.</p>
        <Link to="/" className="store-primary-button">
          Browse products
        </Link>
      </section>
    );
  }

  return (
    <div className="store-section checkout-layout">
      <form className="store-section-card checkout-form-panel" onSubmit={handleSubmit(onSubmit)}>
        <div className="section-title-row">
          <div>
            <p className="store-kicker">Shipping details</p>
            <h1>Checkout</h1>
          </div>
        </div>

        <div className="store-form-grid">
          <label className="store-field">
            <span>Address</span>
            <textarea
              rows="4"
              placeholder="Apartment, street, area, and landmarks"
              {...register("address", {
                required: "Address is required",
                minLength: {
                  value: 10,
                  message: "Address should be at least 10 characters",
                },
              })}
            />
            {errors.address ? <small>{errors.address.message}</small> : null}
          </label>

          <label className="store-field">
            <span>City</span>
            <input
              type="text"
              placeholder="City"
              {...register("city", { required: "City is required" })}
            />
            {errors.city ? <small>{errors.city.message}</small> : null}
          </label>

          <label className="store-field">
            <span>Postal code</span>
            <input
              type="text"
              placeholder="Postal code"
              {...register("postalCode", { required: "Postal code is required" })}
            />
            {errors.postalCode ? <small>{errors.postalCode.message}</small> : null}
          </label>

          <label className="store-field">
            <span>Country</span>
            <select {...register("country", { required: "Country is required" })}>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </label>

          <label className="store-field">
            <span>Payment method</span>
            <select {...register("paymentMethod", { required: true })}>
              <option value="COD">Cash on Delivery</option>
              <option value="Stripe">Stripe</option>
              <option value="Paypal">PayPal</option>
            </select>
          </label>
        </div>

        <div className="checkout-note">
          Payment integrations can be enabled later, but the selected method is still saved for operational accuracy.
        </div>

        <div className="checkout-actions">
          <Link to="/cart" className="store-secondary-button">
            Back to cart
          </Link>
          <button type="submit" className="store-primary-button" disabled={submitting}>
            {submitting ? "Placing order..." : "Place order"}
          </button>
        </div>
      </form>

      <aside className="store-section-card checkout-summary-panel">
        <div className="section-title-row">
          <div>
            <p className="store-kicker">Review items</p>
            <h2>Order summary</h2>
          </div>
        </div>

        <div className="checkout-item-list">
          {items.map((item) => (
            <article
              key={`${item.product?._id}-${item.size}-${item.color}`}
              className="checkout-item-card"
            >
              <SmartImage
                assetPath={item.product?.images?.[0]}
                alt={item.product?.name}
                className="checkout-item-image"
                loading="lazy"
                decoding="async"
              />

              <div>
                <strong>{item.product?.name}</strong>
                <p>
                  {item.size} / {item.color}
                </p>
                <span>Qty {item.quantity}</span>
              </div>

              <strong>{formatCurrency((item.product?.price || 0) * (item.quantity || 0))}</strong>
            </article>
          ))}
        </div>

        <div className="summary-line">
          <span>Subtotal</span>
          <strong>{formatCurrency(subtotal)}</strong>
        </div>
        <div className="summary-line">
          <span>Shipping</span>
          <strong>Free</strong>
        </div>
        <div className="summary-total">
          <span>Grand total</span>
          <strong>{formatCurrency(subtotal)}</strong>
        </div>
      </aside>
    </div>
  );
}
