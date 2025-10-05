// src/pages/UserOrders.js

import React, { useEffect, useState } from "react";
import "../styles/UserOrders.css";

function UserOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ FIX 1: Define API URL with a safe fallback.
  // This ensures the link is correct for both Netlify and local development.
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  const statusConfig = {
    Pending: { color: "#6c757d", bg: "#f8f9fa", icon: "⏳" },
    Accepted: { color: "#007bff", bg: "#cce7ff", icon: "✅" },
    Preparing: { color: "#fd7e14", bg: "#fff3cd", icon: "🔥" },
    "Out for Delivery": { color: "#6f42c1", bg: "#e2d9f3", icon: "🚚" },
    Delivered: { color: "#28a745", bg: "#d4edda", icon: "📦" },
    Cancelled: { color: "#dc3545", bg: "#f8d7da", icon: "❌" },
  };

  useEffect(() => {
    // ✅ FIX 2: Define the fetch function inside useEffect for stability.
    const fetchOrders = async () => {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("You are not logged in. Please log in to view your orders.");
        setLoading(false);
        return;
      }

      try {
        // ✅ FIX 3: Use the full API_BASE_URL to hit the correct Render endpoint.
        const res = await fetch(`${API_BASE_URL}/orders/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const text = await res.text();
          try {
            const errData = JSON.parse(text);
            setError(errData.error || "Failed to fetch orders.");
          } catch {
            // This catches the case where the server returns a non-JSON error page
            setError("Failed to fetch orders. Invalid server response.");
          }
          setLoading(false);
          return;
        }

        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error("Error fetching orders:", err);
        // This is the generic error message displayed to the user
        setError("Server error. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

    // Polling for real-time updates - Runs the function defined above
    const interval = setInterval(fetchOrders, 60000);
    
    // Cleanup function stops the interval timer when the component unmounts
    return () => clearInterval(interval);
  }, []); // Empty dependency array means this effect runs only once

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error">{error}</p>
      </div>
    );
  }

  return (
    <div className="user-orders">
      <div className="orders-header">
        <h2>My Orders</h2>
        <p>Track your recent orders and their status</p>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>You have not placed any orders yet.</h3>
          <p>Start exploring restaurants and place your first order!</p>
        </div>
      ) : (
        <div className="order-list">
          {orders.map((order, index) => (
            <div
              key={order._id}
              className="order-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="order-header">
                <div className="order-id">
                  <strong>Order ID:</strong> {order._id.substring(0, 8)}...
                </div>
                <div className="order-restaurant">
                  <strong>Restaurant:</strong> {order.restaurantName}
                </div>
              </div>

              <div className="order-items">
                <strong>Items:</strong>
                <ul>
                  {order.items.map((item, idx) => (
                    <li key={idx} className="item-row">
                      <span className="item-name">{item.name}</span>
                      <span className="item-qty">x {item.quantity}</span>
                      <span className="item-price">₹{item.price * item.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="order-footer">
                <div className="order-total">
                  <strong>Total: ₹{order.total}</strong>
                </div>
                <div className="order-status">
                  <span 
                    className="status-badge" 
                    style={{ 
                      backgroundColor: statusConfig[order.status]?.bg || "#f8f9fa",
                      color: statusConfig[order.status]?.color || "#6c757d"
                    }}
                  >
                    <span className="status-icon">
                      {statusConfig[order.status]?.icon || "📋"}
                    </span>
                    <strong>{order.status}</strong>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserOrders;