import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Home.css";
import { Context as Logincontext } from "../registrationpage/loginpages/Logincontext";
import { WishlistContext } from "../registrationpage/wishlisht/wishlistcontext";
import { Search } from "lucide-react";
import { toast } from "react-toastify";

export default function Home() {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchterm, setSearchTerm] = useState("");
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [cardStyles, setCardStyles] = useState({});

  const { user } = useContext(Logincontext);
  const { wishlist, addToWishlist, removeFromWishlist, fetchWishlist } =
    useContext(WishlistContext);

  useEffect(() => {
    axios.get("http://localhost:3000/products").then((res) => {
      setData(res.data);
      setFiltered(res.data);
    });
  }, []);

  useEffect(() => handleSearch(), [searchterm]);

  useEffect(() => {
    if (user) fetchWishlist();
  }, [user]);

  useEffect(() => {
    const handleMouseMove = (e) => setCursorPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleSearch = () => {
    if (!searchterm.trim()) setFiltered(data);
    else setFiltered(data.filter((p) =>
      p.name.toLowerCase().includes(searchterm.toLowerCase())
    ));
  };

  const handleSort = (e) => {
    const sortBy = e.target.value;
    let sorted = [...filtered];
    if (sortBy === "lowtohigh") sorted.sort((a,b) => a.price-b.price);
    else if (sortBy === "hightolow") sorted.sort((a,b) => b.price-a.price);
    setFiltered(sorted);
  };

  const toggleWishlist = (product) => {
    if (!user) return toast.info("Please login to add to wishlist");
    const exists = wishlist.some((w) => w.id === product.id);
    if (exists) removeFromWishlist(product.id);
    else addToWishlist(product);
  };

  const isInWishlist = (product) => wishlist.some((w) => w.id === product.id);


  const handleCardHover = (e, id) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
    setCardStyles((prev) => ({ ...prev, [id]: `rotateY(${x}deg) rotateX(${-y}deg) scale(1.05)` }));
  };
  const resetCard = (id) => setCardStyles((prev) => ({ ...prev, [id]: "rotateY(0deg) rotateX(0deg) scale(1)" }));

  return (
    <div className="home">
    
      <div
        className="cursor-shape shape1"
        style={{ transform: `translate(${cursorPos.x/30}px, ${cursorPos.y/30}px)` }}
      />
      <div
        className="cursor-shape shape2"
        style={{ transform: `translate(${cursorPos.x/50}px, ${cursorPos.y/50}px)` }}
      />

      <h1 className="home-title">Welcome, {user?.username || "Guest"}!</h1>
      <p className="home-subtitle">
        Discover the latest trends in footwear. Step up your style with our exclusive shoe collection!
      </p>

      <div className="controls">
        <div className="search-box">
          <input
            type="text"
            value={searchterm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products..."
          />
          <button onClick={handleSearch}><Search size={16} /></button>
        </div>
        <select className="sort-dropdown" onChange={handleSort}>
          <option value="">Sort By Price</option>
          <option value="lowtohigh">Low to High</option>
          <option value="hightolow">High to Low</option>
        </select>
      </div>

      <div className="product-grid">
        {filtered.length > 0 ? filtered.map((item) => (
          <div
            key={item.id}
            className="product-card"
            onMouseMove={(e) => handleCardHover(e, item.id)}
            onMouseLeave={() => resetCard(item.id)}
            style={{ transform: cardStyles[item.id] || "none" }}
          >
            <button
              className={`wishlist-button ${isInWishlist(item) ? "active" : ""}`}
              onClick={() => toggleWishlist(item)}
            >
              {isInWishlist(item) ? "♥" : "♡"}
            </button>

            <Link to={`/product/${item.id}`}>
              <div className="product-image-container">
                <img src={item.images[0]} alt={item.name} className="product-image" />
              </div>
              <h3 className="product-name">{item.name}</h3>
              <p className="product-brand">{item.brand}</p>
              <p className="product-price">${item.price}</p>
            </Link>
          </div>
        )) : <p className="no-products">No products found</p>}
      </div>
    </div>
  );
}
