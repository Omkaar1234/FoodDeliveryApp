// src/components/ProtectedRoute.js
import React from "react";
import { Navigate } from "react-router-dom";

/**
 * ProtectedRoute ensures:
 * 1. User has a valid JWT token in localStorage
 * 2. Optionally matches a required role ("user" or "restaurant")
 */
function ProtectedRoute({ children, requiredRole }) {
  const token = localStorage.getItem("token");
  const storedRole = localStorage.getItem("role"); // fallback role

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  let payload = null;

  try {
    const base64Payload = token.split(".")[1];
    if (!base64Payload) throw new Error("Invalid token format");
    payload = JSON.parse(atob(base64Payload));
  } catch (err) {
    console.error("Invalid token:", err);
    localStorage.clear();
    return <Navigate to="/login" replace />;
  }

  const now = Date.now() / 1000;
  if (payload.exp && payload.exp < now) {
    localStorage.clear();
    return <Navigate to="/login" replace />;
  }

  const userRole = payload.role || storedRole || "";

  if (requiredRole && userRole.toLowerCase() !== requiredRole.toLowerCase()) {
    // Redirect to correct dashboard
    if (userRole.toLowerCase() === "restaurant") return <Navigate to="/restaurant/dashboard" replace />;
    if (userRole.toLowerCase() === "user") return <Navigate to="/user/dashboard" replace />;

    return <Navigate to="/login" replace />; // Unknown role
  }

  return children;
}

export default ProtectedRoute;