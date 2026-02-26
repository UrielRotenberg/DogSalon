import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isHydrated } = useAuth();
  const location = useLocation();
  
  if (!isHydrated) {
    return null;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}