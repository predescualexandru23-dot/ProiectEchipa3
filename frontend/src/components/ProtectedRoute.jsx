import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    // utilizatorul nu e logat
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && role !== allowedRole) {
    // rolul nu corespunde
    return <Navigate to="/login" replace />;
  }

  // utilizatorul are voie să vadă componenta
  return children;
}
