import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ user, children }) {
  if (user === undefined) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === "admin") {
    return children;
  }

  if (user.role === "user") {
    return <Navigate to="/" replace />;
  }

  return <Navigate to="/" replace />;
}
