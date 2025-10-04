// src/pages/RestaurantOrders.js
import React, { useEffect, useState } from "react";
import "../styles/RestaurantOrders.css";

function RestaurantOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [error, setError] = useState("");

  const statusOptions = [
    "Pending",
    "Accepted",
    "Preparing",
    "Out for Delivery",
    "Delivered",
    "Cancelled",
  ];

  // ✅ Fetch orders
  const fetchOrders = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      setError("You are not logged in.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/orders/restaurant", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const text = await res.text();
        try {
          const errData = JSON.parse(text);
          setError(errData.error || "Failed to fetch orders.");
        } catch {
          setError("Failed to fetch orders. Invalid server response.");
        }
        setLoading(false);
        return;
      }

      const data = await res.json();
      setOrders(data || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000); // auto-refresh every 15s
    return () => clearInterval(interval);
  }, []);

  // ✅ Update order status
  const updateOrderStatus = async (orderId, status) => {
    try {
      setUpdatingOrderId(orderId);
      const token = localStorage.getItem("token");

      const res = await fetch(
        `/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await res.json(); // backend always returns JSON
      if (!res.ok) throw new Error(data.error || "Failed to update status");

      alert(data.message || `Order status updated to ${status}`);
      fetchOrders(); // refresh orders after update
    } catch (err) {
      console.error("Error updating order:", err);
      alert(err.message);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  if (loading) return <p>Loading orders...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="restaurant-orders">
      <h2>Incoming Orders</h2>
      {orders.length === 0 ? (
        <p>No orders yet</p>
      ) : (
        <div className="order-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <p>
                <strong>Order ID:</strong> {order._id}
              </p>
              <p>
                <strong>User:</strong>{" "}
                {order.userId?.name || "Unknown"} ({order.userId?.email || ""})
              </p>
              <p>
                <strong>Items:</strong>
              </p>
              <ul>
                {order.items.map((item, idx) => (
                  <li key={idx}>
                    {item.name} x {item.quantity} (${item.price})
                  </li>
                ))}
              </ul>
              <p>
                <strong>Total:</strong> ${order.total}
              </p>
              <p>
                <strong>Status:</strong> {order.status}
              </p>

              <div className="status-buttons">
                {statusOptions.map((s) => {
                  // ✅ allowed transitions
                  const allowedNext = {
                    Pending: ["Accepted", "Cancelled"],
                    Accepted: ["Preparing", "Cancelled"],
                    Preparing: ["Out for Delivery"],
                    "Out for Delivery": ["Delivered"],
                    Delivered: [],
                    Cancelled: [],
                  };
                  const allowed = allowedNext[order.status]?.includes(s);

                  return (
                    <button
                      key={s}
                      onClick={() => updateOrderStatus(order._id, s)}
                      disabled={!allowed || updatingOrderId === order._id}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RestaurantOrders;