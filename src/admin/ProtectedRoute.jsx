import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ user, children }) {
  if (user === undefined) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}
