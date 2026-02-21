import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Details.css";
import { Context } from "../../../registrationpage/loginpages/Logincontext";
import { toast } from "react-toastify";

function Details() {
  const [data, setData] = useState(null);
  const { id } = useParams();
  const { addtocart, user, cart } = useContext(Context);
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    axios
      .get(`http://localhost:3000/products/${id}`)
      .then((res) => setData(res.data))
      .catch((err) => console.log(err));
  }, [id]);

  const handleAddToCart = () => {
    if (!user || !user.id) {
      setShowLoginModal(true);
      return;
    }
    const inCart = cart?.some((item) => item.id === data.id);
    if (!inCart) {
      addtocart(data);
      toast.success("Added to cart!");
    } else {
      toast.info("Already in cart!");
    }
  };

  const goToCart = () => navigate("/cart");

  if (!data) return <h2>Loading...</h2>;

  const inCart = cart?.some((item) => item.id === data.id);

  return (
    <div className="details unique-details">
      <div className="details-left">
        <img src={data.images[0]} alt={data.name} className="details-image" />
        {data.images.length > 1 && (
          <div className="details-thumbnails">
            {data.images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`thumb-${index}`}
                className={`details-thumb ${index === 0 ? "active-thumb" : ""}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="details-right">
        <h1 className="details-title">{data.name}</h1>
        <p className="details-brand">{data.brand}</p>
        <p className="details-price">${data.price}</p>
        {data.discount > 0 && (
          <p className="details-discount">{data.discount}% OFF</p>
        )}
        <p className="details-description">{data.description}</p>

        <div className="cart-buttons">
          {inCart ? (
            <button className="go-cart-btn" onClick={goToCart}>
              🛒 Go to Cart
            </button>
          ) : (
            <button className="add-cart-btn" onClick={handleAddToCart}>
              ➕ Add to Cart
            </button>
          )}
        </div>
      </div>

      {showLoginModal && (
        <div className="modal-overlay">
          <div className="login-modal unique-modal">
            <h3>Login Required</h3>
            <p>You must login to add items to your cart.</p>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowLoginModal(false)}>
                Cancel
              </button>
              <button className="confirm-btn" onClick={() => navigate("/login")}>
                Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Details;
