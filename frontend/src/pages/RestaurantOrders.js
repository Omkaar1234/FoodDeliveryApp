// RestaurantOrders.js
import React, { useEffect, useState } from "react";
import "../styles/RestaurantOrders.css";

function RestaurantOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // Fetch restaurant orders
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      try {
        const res = await fetch("http://localhost:5000/api/orders/restaurant", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setOrders(data || []);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Update order status
  const updateStatus = async (orderId, status) => {
    setUpdatingOrderId(orderId);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (res.ok) {
        setOrders((prev) =>
          prev.map((order) => (order._id === orderId ? { ...order, status } : order))
        );
      } else {
        alert(data.error || "Failed to update status");
      }
    } catch (err) {
      console.error("Error updating order:", err);
      alert("Server error. Could not update status.");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  if (loading) return <p>Loading orders...</p>;

  return (
    <div className="restaurant-orders">
      <h2>Incoming Orders</h2>
      {orders.length === 0 ? (
        <p>No orders yet</p>
      ) : (
        <div className="order-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <p><strong>Order ID:</strong> {order._id}</p>
              <p><strong>User ID:</strong> {order.userId}</p>
              <p><strong>Items:</strong></p>
              <ul>
                {order.items.map((item, idx) => (
                  <li key={idx}>
                    {item.name} x {item.quantity} (${item.price})
                  </li>
                ))}
              </ul>
              <p><strong>Total:</strong> ${order.total}</p>
              <p><strong>Status:</strong> {order.status}</p>
              <div className="status-buttons">
                {["Pending", "Preparing", "Delivered", "Cancelled"].map((s) => (
                  <button
                    key={s}
                    onClick={() => updateStatus(order._id, s)}
                    disabled={order.status === s || updatingOrderId === order._id}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RestaurantOrders;