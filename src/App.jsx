import React, { Suspense, lazy, useContext } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Index from "./home";
import Home from "./home/HomePage";
import ProtectedRoute from "./admin/ProtectedRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Context } from "./registrationpage/loginpages/LogincontextV2";
import PrivateRoute from "./privateroute";

const Login = lazy(() => import("./registrationpage/loginpages/LoginPage"));
const Registration = lazy(() => import("./registrationpage/RegistrationPage"));
const Men = lazy(() => import("./home/content/catagory/MenPage"));
const Women = lazy(() => import("./home/content/catagory/WomenPage"));
const Cart = lazy(() => import("./home/content/cartpages/CartPage"));
const Details = lazy(() => import("./home/content/Detailspage/ProductDetailsPage"));
const Wishlist = lazy(() => import("./registrationpage/wishlisht/WishlistPage"));
const Checkout = lazy(() => import("./home/content/checkout/CheckoutPage"));
const Order = lazy(() => import("./home/content/orderpage/OrdersPage"));
const AdminHomepage = lazy(() => import("./admin/dashboard/AdminDashboardPage"));
const Users = lazy(() => import("./admin/users/AdminUsersPage"));
const Orderpage = lazy(() => import("./admin/orderpages/AdminOrdersPage"));
const Userdetails = lazy(() => import("./home/content/Userdetails/UserdetailsPage"));
const AdminProducts = lazy(() => import("./admin/products/AdminProductsPage"));
const ProductEditorPage = lazy(() => import("./admin/products/ProductEditorPage"));

function RouteFallback() {
  return <div style={{ padding: "3rem", textAlign: "center" }}>Loading page...</div>;
}

function App() {
  const { user, loadingUser } = useContext(Context);

  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Index />}>
            <Route index element={<Home />} />
            <Route path="men" element={<Men />} />
            <Route path="women" element={<Women />} />
            <Route
              path="cart"
              element={
                <PrivateRoute user={user} loadingUser={loadingUser}>
                  <Cart />
                </PrivateRoute>
              }
            />
            <Route path="product/:id" element={<Details />} />
            <Route
              path="checkout"
              element={
                <PrivateRoute user={user} loadingUser={loadingUser}>
                  <Checkout />
                </PrivateRoute>
              }
            />
            <Route
              path="order"
              element={
                <PrivateRoute user={user} loadingUser={loadingUser}>
                  <Order />
                </PrivateRoute>
              }
            />
            <Route
              path="wishlist"
              element={
                <PrivateRoute user={user} loadingUser={loadingUser}>
                  <Wishlist />
                </PrivateRoute>
              }
            />
            <Route
              path="userdetails"
              element={
                <PrivateRoute user={user} loadingUser={loadingUser}>
                  <Userdetails />
                </PrivateRoute>
              }
            />

            <Route
              path="admin"
              element={
                <ProtectedRoute user={user} loadingUser={loadingUser}>
                  <AdminHomepage />
                </ProtectedRoute>
              }
            />

            <Route
              path="admin/products"
              element={
                <ProtectedRoute user={user} loadingUser={loadingUser}>
                  <AdminProducts />
                </ProtectedRoute>
              }
            />

            <Route
              path="admin/products/new"
              element={
                <ProtectedRoute user={user} loadingUser={loadingUser}>
                  <ProductEditorPage mode="create" />
                </ProtectedRoute>
              }
            />

            <Route
              path="admin/products/:id/edit"
              element={
                <ProtectedRoute user={user} loadingUser={loadingUser}>
                  <ProductEditorPage mode="edit" />
                </ProtectedRoute>
              }
            />

            <Route
              path="admin/update/:id"
              element={
                <ProtectedRoute user={user} loadingUser={loadingUser}>
                  <ProductEditorPage mode="edit" />
                </ProtectedRoute>
              }
            />

            <Route
              path="admin/orders"
              element={
                <ProtectedRoute user={user} loadingUser={loadingUser}>
                  <Orderpage />
                </ProtectedRoute>
              }
            />

            <Route
              path="admin/users"
              element={
                <ProtectedRoute user={user} loadingUser={loadingUser}>
                  <Users />
                </ProtectedRoute>
              }
            />

            <Route
              path="addproduct"
              element={
                <ProtectedRoute user={user} loadingUser={loadingUser}>
                  <Navigate to="/admin/products/new" replace />
                </ProtectedRoute>
              }
            />

            <Route
              path="removeproduct"
              element={
                <ProtectedRoute user={user} loadingUser={loadingUser}>
                  <Navigate to="/admin/products" replace />
                </ProtectedRoute>
              }
            />

            <Route
              path="users"
              element={
                <ProtectedRoute user={user} loadingUser={loadingUser}>
                  <Navigate to="/admin/users" replace />
                </ProtectedRoute>
              }
            />

            <Route
              path="orderpage"
              element={
                <ProtectedRoute user={user} loadingUser={loadingUser}>
                  <Navigate to="/admin/orders" replace />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="/login" element={<Login />} />
          <Route path="/registration" element={<Registration />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>

      <ToastContainer position="top-right" autoClose={3000} />
    </BrowserRouter>
  );
}

export default App;
