// src/components/ProtectedRoute.js
import React from "react";
import { Navigate } from "react-router-dom";

/**
 * ProtectedRoute ensures:
 * 1. User has a valid JWT token in localStorage
 * 2. Optionally matches a required role ("user" or "restaurant")
 * 
 * Usage:
 * <ProtectedRoute requiredRole="user">
 *    <UserDashboard />
 * </ProtectedRoute>
 */
function ProtectedRoute({ children, requiredRole }) {
  const token = localStorage.getItem("token");

  if (!token) {
    // No token → redirect to login
    return <Navigate to="/login" replace />;
  }

  try {
    // Decode JWT payload (header.payload.signature)
    const payload = JSON.parse(atob(token.split(".")[1]));
    const now = Date.now() / 1000; // Current time in seconds

    // Check token expiration
    if (payload.exp && payload.exp < now) {
      localStorage.clear(); // Token expired
      return <Navigate to="/login" replace />;
    }

    // Check required role if provided
    if (requiredRole && payload.role?.toLowerCase() !== requiredRole.toLowerCase()) {
      // Role mismatch → redirect to correct dashboard
      if (payload.role?.toLowerCase() === "restaurant") {
        return <Navigate to="/restaurant/dashboard" replace />;
      }
      if (payload.role?.toLowerCase() === "user") {
        return <Navigate to="/user/dashboard" replace />;
      }
      // Unknown role → redirect to login
      return <Navigate to="/login" replace />;
    }
  } catch (err) {
    console.error("Invalid token:", err);
    localStorage.clear(); // Invalid token
    return <Navigate to="/login" replace />;
  }

  // Token is valid and role matches → render children
  return children;
}

export default ProtectedRoute;