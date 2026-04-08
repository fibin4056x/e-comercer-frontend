import { Navigate } from "react-router-dom";

function PrivateRoute({ user, loadingUser, children }) {
  if (loadingUser) {
    return <div style={{ padding: "3rem", textAlign: "center" }}>Checking session...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default PrivateRoute;
