import React, { useState, useEffect } from "react";
import "../styles/RestaurantDashboard.css";
import { useParams } from "react-router-dom";

const RestaurantDashboard = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [menu, setMenu] = useState([]);
  const [profile, setProfile] = useState({});
  const [newMenuItem, setNewMenuItem] = useState({ name: "", price: "" });
  const [editMenuItemId, setEditMenuItemId] = useState(null);
  const [editMenuItemData, setEditMenuItemData] = useState({ name: "", price: "" });

  // ---------------- FETCH RESTAURANT DATA ----------------
  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/restaurants/${id}`);
        const data = await res.json();
        setProfile(data);
        setMenu(data.menu || []);
      } catch (err) {
        console.error("Error fetching restaurant:", err);
      }
    };

    const fetchOrders = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/restaurants/${id}/orders`);
        const data = await res.json();
        setOrders(data || []);
      } catch (err) {
        console.error("Error fetching orders:", err);
      }
    };

    fetchRestaurantData();
    fetchOrders();
  }, [id]);

  // ---------------- ADD MENU ITEM ----------------
  const addMenuItem = async () => {
    if (!newMenuItem.name || newMenuItem.price === "") {
      return alert("Please enter both name and price!");
    }

    try {
      const res = await fetch(`http://localhost:5000/api/restaurants/${id}/menu`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newMenuItem.name,
          price: parseFloat(newMenuItem.price),
        }),
      });
      const item = await res.json();
      if (item.error) return alert(item.error);
      setMenu(prevMenu => [...prevMenu, item]);
      setNewMenuItem({ name: "", price: "" });
    } catch (err) {
      console.error("Error adding menu item:", err);
      alert("Server error. Could not add item.");
    }
  };

  // ---------------- DELETE MENU ITEM ----------------
  const deleteMenuItem = async (itemId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/restaurants/${id}/menu/${itemId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.error) return alert(data.error);
      setMenu(prevMenu => prevMenu.filter(item => item._id !== itemId));
    } catch (err) {
      console.error("Error deleting menu item:", err);
      alert("Server error. Could not delete item.");
    }
  };

  // ---------------- START EDIT MENU ITEM ----------------
  const startEditMenuItem = (item) => {
    setEditMenuItemId(item._id);
    setEditMenuItemData({ name: item.name, price: item.price });
  };

  // ---------------- SAVE EDITED MENU ITEM ----------------
  const saveEditMenuItem = async () => {
    if (!editMenuItemData.name || editMenuItemData.price === "") {
      return alert("Please enter both name and price!");
    }

    try {
      const res = await fetch(`http://localhost:5000/api/restaurants/${id}/menu/${editMenuItemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editMenuItemData.name,
          price: parseFloat(editMenuItemData.price),
        }),
      });
      const updatedItem = await res.json();
      if (updatedItem.error) return alert(updatedItem.error);
      setMenu(prevMenu => prevMenu.map(item => item._id === editMenuItemId ? updatedItem : item));
      setEditMenuItemId(null);
      setEditMenuItemData({ name: "", price: "" });
    } catch (err) {
      console.error("Error updating menu item:", err);
      alert("Server error. Could not update item.");
    }
  };

  // ---------------- UPDATE RESTAURANT PROFILE ----------------
  const updateProfile = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/restaurants/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (data.error) return alert(data.error);
      if (data.restaurant) setProfile(data.restaurant);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Server error. Could not update profile.");
    }
  };

  // ---------------- UPDATE ORDER STATUS ----------------
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/restaurants/${id}/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const updatedOrder = await res.json();
      setOrders(prevOrders => prevOrders.map(o => o._id === orderId ? updatedOrder : o));
    } catch (err) {
      console.error("Error updating order:", err);
      alert("Server error. Could not update order.");
    }
  };

  const orderCompletion =
    orders.length > 0
      ? ((orders.filter(o => o.status === "Delivered").length / orders.length) * 100).toFixed(2)
      : 0;

  return (
    <div className="restaurant-dashboard">
      <aside className="sidebar">
        <h2 className="dashboard-title">🍽 Restaurant Panel</h2>
        <ul>
          <li onClick={() => setActiveTab("orders")} className={activeTab === "orders" ? "active" : ""}>Orders</li>
          <li onClick={() => setActiveTab("menu")} className={activeTab === "menu" ? "active" : ""}>Menu</li>
          <li onClick={() => setActiveTab("profile")} className={activeTab === "profile" ? "active" : ""}>Profile</li>
          <li onClick={() => setActiveTab("analytics")} className={activeTab === "analytics" ? "active" : ""}>Analytics</li>
        </ul>
      </aside>

      <main className="main-content">
        {/* ORDERS */}
        {activeTab === "orders" && (
          <div className="orders-section">
            <h2>📦 Received Orders</h2>
            {orders.length > 0 ? (
              orders.map(order => (
                <div key={order._id} className="order-card">
                  <p>
                    <strong>Order #{order._id}</strong> - {order.items.map(i => `${i.name} x${i.quantity}`).join(", ")}
                  </p>
                  <p>Status: <span className={`status ${order.status.toLowerCase()}`}>{order.status}</span></p>
                  <button className="btn update-btn" onClick={() => updateOrderStatus(order._id, "Preparing")}>Mark Preparing</button>
                  <button className="btn update-btn" onClick={() => updateOrderStatus(order._id, "Delivered")}>Mark Delivered</button>
                </div>
              ))
            ) : <p>No orders yet.</p>}
          </div>
        )}

        {/* MENU */}
        {activeTab === "menu" && (
          <div className="menu-section">
            <h2>🍴 Manage Menu</h2>
            <div className="add-menu-item">
              <input type="text" placeholder="Item Name" value={newMenuItem.name} onChange={e => setNewMenuItem({ ...newMenuItem, name: e.target.value })} />
              <input type="number" placeholder="Price" value={newMenuItem.price} onChange={e => setNewMenuItem({ ...newMenuItem, price: e.target.value })} />
              <button className="btn add-btn" onClick={addMenuItem}>Add Item</button>
            </div>
            {menu.length > 0 ? menu.map(item => (
              <div key={item._id} className="menu-item">
                {editMenuItemId === item._id ? (
                  <>
                    <input type="text" value={editMenuItemData.name} onChange={e => setEditMenuItemData({ ...editMenuItemData, name: e.target.value })} />
                    <input type="number" value={editMenuItemData.price} onChange={e => setEditMenuItemData({ ...editMenuItemData, price: e.target.value })} />
                    <button className="btn save-btn" onClick={saveEditMenuItem}>Save</button>
                    <button className="btn cancel-btn" onClick={() => setEditMenuItemId(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <p><strong>{item.name}</strong> - ₹{item.price}</p>
                    <button className="btn edit-btn" onClick={() => startEditMenuItem(item)}>Edit</button>
                    <button className="btn delete-btn" onClick={() => deleteMenuItem(item._id)}>Delete</button>
                  </>
                )}
              </div>
            )) : <p>No menu items yet.</p>}
          </div>
        )}

        {/* PROFILE */}
        {activeTab === "profile" && (
          <div className="profile-section">
            <h2>🏪 Restaurant Profile</h2>
            <div className="profile-card">
              <img src={profile.photo || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5"} alt="Restaurant" className="restaurant-photo" />
            </div>
            <form className="profile-form">
              <input type="text" placeholder="Restaurant Name" value={profile.name || ""} onChange={e => setProfile({ ...profile, name: e.target.value })} />
              <input type="text" placeholder="Address" value={profile.address || ""} onChange={e => setProfile({ ...profile, address: e.target.value })} />
              <input type="text" placeholder="Contact" value={profile.contact || ""} onChange={e => setProfile({ ...profile, contact: e.target.value })} />
              <button type="button" className="btn save-btn" onClick={updateProfile}>Save Changes</button>
            </form>
          </div>
        )}

        {/* ANALYTICS */}
        {activeTab === "analytics" && (
          <div className="analytics-section">
            <h2>📊 Analytics</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>{orders.length}</h3>
                <p>Total Orders</p>
              </div>
              <div className="stat-card">
                <h3>₹{menu.reduce((sum, item) => sum + Number(item.price), 0)}</h3>
                <p>Total Revenue (Mock)</p>
              </div>
              <div className="stat-card">
                <h3>{orderCompletion}%</h3>
                <p>Order Completion</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default RestaurantDashboard;