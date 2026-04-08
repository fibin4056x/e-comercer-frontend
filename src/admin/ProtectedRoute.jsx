import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ user, loadingUser, children }) {
  if (loadingUser) {
    return <div style={{ padding: "3rem", textAlign: "center" }}>Checking admin access...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}
