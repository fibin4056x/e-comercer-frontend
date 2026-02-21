import axios from 'axios';
import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import './women.css';
import { WishlistContext } from '../../../registrationpage/wishlisht/wishlistcontext';
import { Context as Logincontext } from '../../../registrationpage/loginpages/Logincontext';

export default function Women() {
  const [filteredProducts, setFilteredProducts] = useState([]);
  const { user } = useContext(Logincontext);
  const { wishlist, addToWishlist, removeFromWishlist, fetchWishlist } = useContext(WishlistContext);

  useEffect(() => {
    axios.get("http://localhost:3000/products")
      .then((res) => {
        setFilteredProducts(
          res.data.filter(item => item.category.toLowerCase() === 'women')
        );
      })
      .catch(err => console.log(err));
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

  return (
    <div className="women-container">
      <h2 className="women-title">Women Products</h2>

      <div className="controls">
        <select name="sort" id="sort" className="sort-dropdown" onChange={handleSort}>
          <option value="">Sort By Price</option>
          <option value="lowtohigh">Low to High</option>
          <option value="hightolow">High to Low</option>
        </select>
      </div>

      {filteredProducts.length === 0 ? (
        <p className="no-products">No products</p>
      ) : (
        <div className="women-grid">
          {filteredProducts.map((item) => (
            <div key={item.id} className="product-card">
              <button
                className={`wishlist-button ${isInWishlist(item) ? "active" : ""}`}
                onClick={() => toggleWishlist(item)}
              >
                {isInWishlist(item) ? "♥" : "♡"}
              </button>

              <Link to={`/product/${item.id}`} className="product-card-link">
                <div className="product-image-container">
                  <img
                    src={item.images?.[0] || "placeholder.jpg"}
                    alt={item.name}
                    className="product-image"
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
