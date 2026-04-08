import { useContext, useMemo, useState } from "react";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Context } from "../../../registrationpage/loginpages/LogincontextV2";
import { getAssetUrl, request } from "../../../services/apiClient";
import formatCurrency from "../../../utilitis/formatCurrency";

export default function CartPage() {
  const { cart, setCart, user } = useContext(Context) || {};
  const [updatingKey, setUpdatingKey] = useState("");

  const items = useMemo(() => (Array.isArray(cart?.items) ? cart.items : []), [cart?.items]);

  const subtotal = useMemo(
    () =>
      items.reduce(
        (total, item) => total + (item.product?.price || 0) * (item.quantity || 0),
        0
      ),
    [items]
  );

  const handleUpdateQuantity = async (item, quantity) => {
    try {
      setUpdatingKey(`${item.product?._id}-${item.size}-${item.color}`);

      const updatedCart = await request("/cart", "PUT", {
        productId: item.product?._id,
        quantity,
        size: item.size,
        color: item.color,
      });

      setCart(updatedCart);
    } catch (error) {
      toast.error(error.message || "Unable to update quantity");
    } finally {
      setUpdatingKey("");
    }
  };

  const handleRemove = async (item) => {
    try {
      setUpdatingKey(`${item.product?._id}-${item.size}-${item.color}`);

      const updatedCart = await request(
        `/cart/${item.product?._id}/${encodeURIComponent(item.size)}/${encodeURIComponent(item.color)}`,
        "DELETE"
      );

      setCart(updatedCart);
      toast.success("Item removed from cart");
    } catch (error) {
      toast.error(error.message || "Unable to remove item");
    } finally {
      setUpdatingKey("");
    }
  };

  if (!user) {
    return (
      <section className="store-section store-empty-state">
        <h1>Sign in to view your cart</h1>
        <p>Your saved items, quantities, and checkout summary live inside your account.</p>
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
        <p>Explore the latest arrivals and add a pair that deserves a place in your rotation.</p>
        <Link to="/" className="store-primary-button">
          Continue shopping
        </Link>
      </section>
    );
  }

  return (
    <div className="store-section cart-layout">
      <section className="store-section-card cart-items-panel">
        <div className="section-title-row">
          <div>
            <p className="store-kicker">Bag summary</p>
            <h1>Shopping cart</h1>
          </div>
          <span>{items.length} line item(s)</span>
        </div>

        <div className="cart-item-list">
          {items.map((item) => {
            const itemKey = `${item.product?._id}-${item.size}-${item.color}`;
            const isUpdating = updatingKey === itemKey;

            return (
              <article key={itemKey} className="cart-item-card">
                <img
                  src={getAssetUrl(item.product?.images?.[0])}
                  alt={item.product?.name}
                  className="cart-item-image"
                  loading="lazy"
                  decoding="async"
                />

                <div className="cart-item-copy">
                  <div>
                    <h2>{item.product?.name}</h2>
                    <p>{item.product?.brand || "Sole Society"}</p>
                    <span>
                      {item.size} / {item.color}
                    </span>
                  </div>

                  <div className="cart-item-controls">
                    <div className="quantity-stepper">
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(item, Math.max(1, item.quantity - 1))}
                        disabled={isUpdating}
                      >
                        <Minus size={14} />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                        disabled={isUpdating}
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <button
                      type="button"
                      className="store-ghost-danger"
                      onClick={() => handleRemove(item)}
                      disabled={isUpdating}
                    >
                      <Trash2 size={14} />
                      <span>{isUpdating ? "Updating..." : "Remove"}</span>
                    </button>
                  </div>
                </div>

                <strong>{formatCurrency((item.product?.price || 0) * (item.quantity || 0))}</strong>
              </article>
            );
          })}
        </div>
      </section>

      <aside className="store-section-card cart-summary-panel">
        <div className="section-title-row">
          <div>
            <p className="store-kicker">Checkout</p>
            <h2>Order summary</h2>
          </div>
          <ShoppingBag size={18} />
        </div>

        <div className="summary-line">
          <span>Subtotal</span>
          <strong>{formatCurrency(subtotal)}</strong>
        </div>
        <div className="summary-line">
          <span>Shipping</span>
          <strong>Free</strong>
        </div>
        <div className="summary-line">
          <span>Taxes</span>
          <strong>Included at checkout</strong>
        </div>

        <div className="summary-total">
          <span>Total</span>
          <strong>{formatCurrency(subtotal)}</strong>
        </div>

        <Link to="/checkout" className="store-primary-button">
          Proceed to checkout
        </Link>
      </aside>
    </div>
  );
}
