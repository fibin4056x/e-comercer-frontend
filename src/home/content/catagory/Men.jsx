import axios from 'axios';
import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import './men.css';
import { WishlistContext } from '../../../registrationpage/wishlisht/wishlistcontext';
import { Context as Logincontext } from '../../../registrationpage/loginpages/Logincontext';

export default function Men() {
  const [filteredProducts, setFilteredProducts] = useState([]);
  const { user } = useContext(Logincontext);
  const { wishlist, addToWishlist, removeFromWishlist, fetchWishlist } = useContext(WishlistContext);
  const [zoomStyles, setZoomStyles] = useState({}); 

  useEffect(() => {
    axios.get('http://localhost:3000/products')
      .then((res) => {
        setFilteredProducts(res.data.filter(item => item.category === "Men"));
      })
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    if (user) fetchWishlist();
  }, [user, fetchWishlist]);

  const handleSort = (e) => {
    const sortBy = e.target.value;
    let sortedData = [...filteredProducts];

    if (sortBy === "lowtohigh") {
      sortedData.sort((a, b) => a.price - b.price);
    } else if (sortBy === "hightolow") {
      sortedData.sort((a, b) => b.price - a.price);
    }
    setFilteredProducts(sortedData);
  };

  const toggleWishlist = (product) => {
    if (!user) {
      alert("Please login to add item to wishlist");
      return;
    }
    const exists = wishlist.some((item) => item.id === product.id);
    if (exists) {
      const itemInWishlist = wishlist.find((w) => w.id === product.id);
      removeFromWishlist(itemInWishlist.id);
    } else {
      addToWishlist(product);
    }
  };

  const isInWishlist = (product) => wishlist.some((item) => item.id === product.id);

  const handleMouseMove = (e, id) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setZoomStyles((prev) => ({
      ...prev,
      [id]: {
        transform: `scale(1.15) translate(-${x - 50}%, -${y - 50}%)`,
        transformOrigin: `${x}% ${y}%`,
      },
    }));
  };

  const resetZoom = (id) => {
    setZoomStyles((prev) => ({
      ...prev,
      [id]: { transform: "scale(1)", transformOrigin: "center center" },
    }));
  };

  return (
    <div className="men-container">
      <h2 className="men-title">Men's Collection</h2>

      <div className="controls">
        <select name="sort" id="sort" className="sort-dropdown" onChange={handleSort}>
          <option value="">Sort By Price</option>
          <option value="lowtohigh">Low to High</option>
          <option value="hightolow">High to Low</option>
        </select>
      </div>

      {filteredProducts.length === 0 ? (
        <p className="no-products">No products found</p>
      ) : (
        <div className="men-grid">
          {filteredProducts.map((item) => (
            <div key={item.id} className="product-card">
              <button
                className={`wishlist-button ${isInWishlist(item) ? "active" : ""}`}
                onClick={() => toggleWishlist(item)}
              >
                {isInWishlist(item) ? "♥" : "♡"}
              </button>

              <Link to={`/product/${item.id}`} className="product-card-link">
                <div
                  className="product-image-container"
                  onMouseMove={(e) => handleMouseMove(e, item.id)}
                  onMouseLeave={() => resetZoom(item.id)}
                >
                  <img
                    src={item.images?.[0] || 'placeholder.jpg'}
                    alt={item.name}
                    className="product-image"
                    style={zoomStyles[item.id] || {}}
                  />
                </div>
                <h3 className="product-name">{item.name}</h3>
                <p className="product-brand">{item.brand}</p>
                <p className="product-price">${item.price}</p>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
