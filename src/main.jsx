import { createRoot } from "react-dom/client";
import WishlistProvider from "./registrationpage/wishlisht/wishlistcontextV2.jsx";
import App from "./App.jsx";
import Logincontext from "./registrationpage/loginpages/LogincontextV2.jsx";
import OrderProvider from "./home/content/orderpage/ordercontextV2.jsx";
import "./home/Home.css";
import "./admin/admin.css";

createRoot(document.getElementById("root")).render(
  <Logincontext>
    <WishlistProvider>
      <OrderProvider>
        <App />
      </OrderProvider>
    </WishlistProvider>
  </Logincontext>,
);
