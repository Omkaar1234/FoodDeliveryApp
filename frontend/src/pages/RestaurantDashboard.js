// src/pages/RestaurantDashboard.js
import React, { useState, useEffect, useCallback } from "react";
import "../styles/RestaurantDashboard.css";
import { authFetch } from "../services/authService"; // use centralized service

const RestaurantDashboard = () => {
  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [menu, setMenu] = useState([]);
  const [profile, setProfile] = useState({});
  const [newMenuItem, setNewMenuItem] = useState({ name: "", price: "" });
  const [editMenuItemId, setEditMenuItemId] = useState(null);
  const [editMenuItemData, setEditMenuItemData] = useState({ name: "", price: "" });

  // ---------------- FETCH PROFILE & ORDERS ----------------
  const fetchRestaurantData = useCallback(async () => {
    try {
      const dataProfile = await authFetch("/restaurants/me");
      setProfile(dataProfile.profile || dataProfile);
      setMenu(dataProfile.profile?.menu || dataProfile.menu || []);

      const dataOrders = await authFetch("/restaurant/orders");
      setOrders(dataOrders || []);
    } catch (err) {
      console.error("fetchRestaurantData error:", err);
      alert(err.message);
    }
  }, []);

  useEffect(() => {
    fetchRestaurantData();
  }, [fetchRestaurantData]);

  // ---------------- MENU OPERATIONS ----------------
  const addMenuItem = async () => {
    if (!newMenuItem.name || newMenuItem.price === "") return alert("Enter name & price!");
    try {
      const addedItem = await authFetch("/restaurants/me/menu", {
        method: "POST",
        body: JSON.stringify({
          name: newMenuItem.name,
          price: parseFloat(newMenuItem.price),
        }),
      });
      setMenu((prev) => [...prev, addedItem]);
      setNewMenuItem({ name: "", price: "" });
    } catch (err) {
      console.error("addMenuItem error:", err);
      alert(err.message);
    }
  };

  const deleteMenuItem = async (itemId) => {
    try {
      await authFetch(`/restaurants/me/menu/${itemId}`, { method: "DELETE" });
      setMenu((prev) => prev.filter((i) => i._id !== itemId));
    } catch (err) {
      console.error("deleteMenuItem error:", err);
      alert(err.message);
    }
  };

  const startEditMenuItem = (item) => {
    setEditMenuItemId(item._id);
    setEditMenuItemData({ name: item.name, price: item.price });
  };

  const saveEditMenuItem = async () => {
    if (!editMenuItemData.name || editMenuItemData.price === "")
      return alert("Enter name & price!");
    try {
      const updatedItem = await authFetch(`/restaurants/me/menu/${editMenuItemId}`, {
        method: "PUT",
        body: JSON.stringify({
          name: editMenuItemData.name,
          price: parseFloat(editMenuItemData.price),
        }),
      });
      setMenu((prev) =>
        prev.map((i) => (i._id === editMenuItemId ? updatedItem : i))
      );
      setEditMenuItemId(null);
      setEditMenuItemData({ name: "", price: "" });
    } catch (err) {
      console.error("saveEditMenuItem error:", err);
      alert(err.message);
    }
  };

  // ---------------- PROFILE UPDATE ----------------
  const updateProfile = async () => {
    try {
      const updatedProfile = await authFetch("/restaurants/me", {
        method: "PUT",
        body: JSON.stringify(profile),
      });
      setProfile(updatedProfile);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("updateProfile error:", err);
      alert(err.message);
    }
  };

  // ---------------- ORDER STATUS UPDATE ----------------
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const updatedOrder = await authFetch(`/orders/${orderId}`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? updatedOrder : o))
      );
    } catch (err) {
      console.error("updateOrderStatus error:", err);
      alert(err.message);
    }
  };

  // ---------------- ANALYTICS ----------------
  const orderCompletion =
    orders.length > 0
      ? ((orders.filter((o) => o.status === "Delivered").length / orders.length) * 100).toFixed(2)
      : 0;

  const totalRevenue = orders.reduce(
    (sum, o) => sum + o.items.reduce((s, i) => s + i.price * i.quantity, 0),
    0
  );

  // ---------------- RENDER ----------------
  return (
    <div className="restaurant-dashboard">
      <aside className="sidebar">
        <h2>🍽 Restaurant Panel</h2>
        <ul>
          {["orders", "menu", "profile", "analytics"].map((tab) => (
            <li
              key={tab}
              className={activeTab === tab ? "active" : ""}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </li>
          ))}
        </ul>
      </aside>

      <main className="main-content">
        {/* ORDERS */}
        {activeTab === "orders" && (
          <div>
            <h2>📦 Orders</h2>
            {orders.length > 0 ? (
              orders.map((o) => (
                <div key={o._id} className="order-card">
                  <p>
                    <strong>Order #{o._id}</strong> -{" "}
                    {o.items.map((i) => `${i.name} x${i.quantity}`).join(", ")}
                  </p>
                  <p>Status: {o.status}</p>
                  {o.status !== "Delivered" && (
                    <>
                      <button onClick={() => updateOrderStatus(o._id, "Preparing")}>
                        Mark Preparing
                      </button>
                      <button onClick={() => updateOrderStatus(o._id, "Delivered")}>
                        Mark Delivered
                      </button>
                    </>
                  )}
                </div>
              ))
            ) : (
              <p>No orders yet.</p>
            )}
          </div>
        )}

        {/* MENU */}
        {activeTab === "menu" && (
          <div>
            <h2>🍴 Menu</h2>
            <div className="menu-form">
              <input
                placeholder="Name"
                value={newMenuItem.name}
                onChange={(e) =>
                  setNewMenuItem({ ...newMenuItem, name: e.target.value })
                }
              />
              <input
                placeholder="Price"
                type="number"
                value={newMenuItem.price}
                onChange={(e) =>
                  setNewMenuItem({ ...newMenuItem, price: e.target.value })
                }
              />
              <button onClick={addMenuItem}>Add Item</button>
            </div>

            {menu.length > 0 ? (
              menu.map((item) => (
                <div key={item._id} className="menu-item-card">
                  {editMenuItemId === item._id ? (
                    <>
                      <input
                        value={editMenuItemData.name}
                        onChange={(e) =>
                          setEditMenuItemData({ ...editMenuItemData, name: e.target.value })
                        }
                      />
                      <input
                        type="number"
                        value={editMenuItemData.price}
                        onChange={(e) =>
                          setEditMenuItemData({ ...editMenuItemData, price: e.target.value })
                        }
                      />
                      <button onClick={saveEditMenuItem}>Save</button>
                      <button onClick={() => setEditMenuItemId(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <p>{item.name} - ₹{item.price}</p>
                      <button onClick={() => startEditMenuItem(item)}>Edit</button>
                      <button onClick={() => deleteMenuItem(item._id)}>Delete</button>
                    </>
                  )}
                </div>
              ))
            ) : (
              <p>No menu items yet.</p>
            )}
          </div>
        )}

        {/* PROFILE */}
        {activeTab === "profile" && (
          <div>
            <h2>🏪 Profile</h2>
            <input
              placeholder="Name"
              value={profile.name || ""}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            />
            <input
              placeholder="Address"
              value={profile.address || ""}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
            />
            <input
              placeholder="Contact"
              value={profile.contact || ""}
              onChange={(e) => setProfile({ ...profile, contact: e.target.value })}
            />
            <button onClick={updateProfile}>Save</button>
          </div>
        )}

        {/* ANALYTICS */}
        {activeTab === "analytics" && (
          <div>
            <h2>📊 Analytics</h2>
            <p>Total Orders: {orders.length}</p>
            <p>Total Revenue: ₹{totalRevenue}</p>
            <p>Order Completion: {orderCompletion}%</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default RestaurantDashboard;