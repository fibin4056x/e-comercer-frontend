import React, { useContext } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Index from "./home";
import Login from "./registrationpage/loginpages/LoginPage";
import Registration from "./registrationpage/RegistrationPage";
import Home from "./home/HomePage";
import Men from "./home/content/catagory/MenPage";
import Women from "./home/content/catagory/WomenPage";
import Cart from "./home/content/cartpages/CartPage";
import Details from "./home/content/Detailspage/ProductDetailsPage";
import Wishlist from "./registrationpage/wishlisht/WishlistPage";
import Checkout from "./home/content/checkout/CheckoutPage";
import Order from "./home/content/orderpage/OrdersPage";
import AdminHomepage from "./admin/dashboard/AdminDashboardPage";
import Users from "./admin/users/AdminUsersPage";
import ProtectedRoute from "./admin/ProtectedRoute";
import Orderpage from "./admin/orderpages/AdminOrdersPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Context } from "./registrationpage/loginpages/LogincontextV2";
import Userdetails from "./home/content/Userdetails/UserdetailsPage";
import PrivateRoute from "./privateroute";
import AdminProducts from "./admin/products/AdminProductsPage";
import ProductEditorPage from "./admin/products/ProductEditorPage";

function App() {
  const { user, loadingUser } = useContext(Context);

  if (loadingUser) {
    return <div style={{ padding: "4rem", textAlign: "center" }}>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />}>
          <Route index element={<Home />} />
          <Route path="men" element={<Men />} />
          <Route path="women" element={<Women />} />
          <Route
            path="cart"
            element={
              <PrivateRoute user={user}>
                <Cart />
              </PrivateRoute>
            }
          />
          <Route path="product/:id" element={<Details />} />
          <Route
            path="checkout"
            element={
              <PrivateRoute user={user}>
                <Checkout />
              </PrivateRoute>
            }
          />
          <Route
            path="order"
            element={
              <PrivateRoute user={user}>
                <Order />
              </PrivateRoute>
            }
          />
          <Route
            path="wishlist"
            element={
              <PrivateRoute user={user}>
                <Wishlist />
              </PrivateRoute>
            }
          />
          <Route
            path="userdetails"
            element={
              <PrivateRoute user={user}>
                <Userdetails />
              </PrivateRoute>
            }
          />

          <Route
            path="admin"
            element={
              <ProtectedRoute user={user}>
                <AdminHomepage />
              </ProtectedRoute>
            }
          />

          <Route
            path="admin/products"
            element={
              <ProtectedRoute user={user}>
                <AdminProducts />
              </ProtectedRoute>
            }
          />

          <Route
            path="admin/products/new"
            element={
              <ProtectedRoute user={user}>
                <ProductEditorPage mode="create" />
              </ProtectedRoute>
            }
          />

          <Route
            path="admin/products/:id/edit"
            element={
              <ProtectedRoute user={user}>
                <ProductEditorPage mode="edit" />
              </ProtectedRoute>
            }
          />

          <Route
            path="admin/update/:id"
            element={
              <ProtectedRoute user={user}>
                <ProductEditorPage mode="edit" />
              </ProtectedRoute>
            }
          />

          <Route
            path="admin/orders"
            element={
              <ProtectedRoute user={user}>
                <Orderpage />
              </ProtectedRoute>
            }
          />

          <Route
            path="admin/users"
            element={
              <ProtectedRoute user={user}>
                <Users />
              </ProtectedRoute>
            }
          />

          <Route
            path="addproduct"
            element={
              <ProtectedRoute user={user}>
                <Navigate to="/admin/products/new" replace />
              </ProtectedRoute>
            }
          />

          <Route
            path="removeproduct"
            element={
              <ProtectedRoute user={user}>
                <Navigate to="/admin/products" replace />
              </ProtectedRoute>
            }
          />

          <Route
            path="users"
            element={
              <ProtectedRoute user={user}>
                <Navigate to="/admin/users" replace />
              </ProtectedRoute>
            }
          />

          <Route
            path="orderpage"
            element={
              <ProtectedRoute user={user}>
                <Navigate to="/admin/orders" replace />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <ToastContainer position="top-right" autoClose={3000} />
    </BrowserRouter>
  );
}

export default App;
