import React, { useState, useEffect, useCallback } from "react";
import "../styles/RestaurantDashboard.css";
import { authFetch, uploadRestaurantImage } from "../services/authService"; // Import uploadRestaurantImage
import { FaUpload, FaTimes, FaCamera } from "react-icons/fa"; // Added FaCamera

const RestaurantDashboard = () => {
  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [menu, setMenu] = useState([]);
  const [profile, setProfile] = useState({});
  const [newMenuItem, setNewMenuItem] = useState({ name: "", price: "" });
  const [editMenuItemId, setEditMenuItemId] = useState(null);
  const [editMenuItemData, setEditMenuItemData] = useState({ name: "", price: "" });
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // ---------------- IMAGE UPLOAD STATES ----------------
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState({ type: '', text: '' });
  
  // New states for custom delete confirmation modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const statusConfig = {
    Pending: { color: "#6c757d", bg: "#f8f9fa", icon: "⏳" },
    Accepted: { color: "#007bff", bg: "#cce7ff", icon: "✅" },
    Preparing: { color: "#fd7e14", bg: "#fff3cd", icon: "🔥" },
    "Out for Delivery": { color: "#6f42c1", bg: "#e2d9f3", icon: "🚚" },
    Delivered: { color: "#28a745", bg: "#d4edda", icon: "📦" },
    Cancelled: { color: "#dc3545", bg: "#f8d7da", icon: "❌" },
  };
  
  const PLACEHOLDER_IMAGE = "https://placehold.co/150x150/505050/ffffff?text=LOGO";


  // ---------------- FETCH PROFILE & ORDERS ----------------
  const fetchRestaurantData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Using /me endpoint to get the restaurant profile including the new image field
      const dataProfile = await authFetch("/restaurants/me"); 
      setProfile(dataProfile); // Directly set the profile object
      setMenu(dataProfile.menu || []);

      const dataOrders = await authFetch("/restaurant/orders");
      setOrders(dataOrders || []);
    } catch (err) {
      console.error("fetchRestaurantData error:", err);
      setError(err.message || "Failed to fetch restaurant data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRestaurantData();
    // Optional polling every 30 seconds for orders
    const interval = setInterval(fetchRestaurantData, 30000);
    return () => clearInterval(interval);
  }, [fetchRestaurantData]);

  // ---------------- IMAGE UPLOAD HANDLER ----------------
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setUploadMessage({ type: '', text: '' });
  };

  const handleImageUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      return setUploadMessage({ type: 'error', text: 'Please select an image file to upload.' });
    }

    setUploading(true);
    setUploadMessage({ type: '', text: '' });

    try {
      const formData = new FormData();
      // 'restaurantImage' MUST match the Multer field name in backend/routes/restaurantRoutes.js
      formData.append('restaurantImage', file); 

      const data = await uploadRestaurantImage(formData);
      
      // Update profile state with the new image URL immediately
      setProfile(prev => ({ ...prev, image: data.image }));
      setFile(null); // Clear file input
      setUploadMessage({ type: 'success', text: 'Image uploaded and updated successfully!' });

    } catch (error) {
      setUploadMessage({ type: 'error', text: error.message || 'An unknown error occurred during upload.' });
    } finally {
      setUploading(false);
    }
  };

  // ---------------- MENU OPERATIONS ----------------
  const addMenuItem = async () => {
    if (!newMenuItem.name || newMenuItem.price === "") return alert("Enter name & price!");
    try {
      // Using authFetch, assume endpoint starts with /api
      const addedItem = await authFetch("/restaurants/me/menu", {
        method: "POST",
        body: {
          name: newMenuItem.name,
          price: parseFloat(newMenuItem.price),
        },
      });
      setMenu(prev => [...prev, addedItem]);
      setNewMenuItem({ name: "", price: "" });
    } catch (err) {
      console.error("addMenuItem error:", err);
      // NOTE: alert() is bad practice, but retained from your original code.
      alert(err.message || "Failed to add menu item"); 
    }
  };

  // Updated: Use custom modal instead of confirm()
  const handleDeleteClick = (itemId) => {
    const item = menu.find(i => i._id === itemId);
    if (item) {
      setItemToDelete(item);
      setShowDeleteConfirm(true);
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete?._id) return;
    try {
      await authFetch(`/restaurants/me/menu/${itemToDelete._id}`, { method: "DELETE" });
      setMenu(prev => prev.filter(i => i._id !== itemToDelete._id));
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    } catch (err) {
      console.error("deleteMenuItem error:", err);
      alert(err.message || "Failed to delete menu item");
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setItemToDelete(null);
  };

  const startEditMenuItem = (item) => {
    setEditMenuItemId(item._id);
    setEditMenuItemData({ name: item.name, price: item.price });
  };

  const saveEditMenuItem = async () => {
    if (!editMenuItemData.name || editMenuItemData.price === "") return alert("Enter name & price!");
    try {
      const updatedItem = await authFetch(`/restaurants/me/menu/${editMenuItemId}`, {
        method: "PUT",
        body: {
          name: editMenuItemData.name,
          price: parseFloat(editMenuItemData.price),
        },
      });
      setMenu(prev => prev.map(i => i._id === editMenuItemId ? updatedItem : i));
      setEditMenuItemId(null);
      setEditMenuItemData({ name: "", price: "" });
    } catch (err) {
      console.error("saveEditMenuItem error:", err);
      alert(err.message || "Failed to update menu item");
    }
  };

  // ---------------- PROFILE UPDATE ----------------
  const updateProfile = async () => {
    try {
      const updatedProfile = await authFetch("/restaurants/me", {
        method: "PUT",
        body: {
          name: profile.name,
          address: profile.address,
          contact: profile.contact,
        },
      });
      setProfile(updatedProfile);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("updateProfile error:", err);
      alert(err.message || "Failed to update profile");
    }
  };

  // ---------------- ORDER STATUS UPDATE ----------------
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingOrderId(orderId);
      await authFetch(`/orders/${orderId}/status`, {
        method: "PUT",
        body: { status: newStatus },
      });
      await fetchRestaurantData(); // refresh orders after status update
    } catch (err) {
      console.error("updateOrderStatus error:", err);
      alert(err.message || "Failed to update order status");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // ---------------- ANALYTICS ----------------
  const orderCompletion =
    orders.length > 0
      ? ((orders.filter(o => o.status === "Delivered").length / orders.length) * 100).toFixed(2)
      : 0;

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error">{error}</p>
        <button onClick={fetchRestaurantData} className="retry-btn">Retry</button>
      </div>
    );
  }

  return (
    <div className="restaurant-dashboard">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>🍽 Restaurant Panel</h2>
          <p>Welcome back, {profile.name || "Owner"}!</p>
        </div>
        <nav className="sidebar-nav">
          {[
            { key: "orders", label: "Orders", icon: "📦" },
            { key: "menu", label: "Menu", icon: "🍴" },
            { key: "profile", label: "Profile", icon: "🏪" },
            { key: "analytics", label: "Analytics", icon: "📊" },
          ].map(tab => (
            <button
              key={tab.key}
              className={`nav-item ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <span className="nav-icon">{tab.icon}</span>
              <span className="nav-label">{tab.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="main-content">
        {/* ORDERS TAB */}
        {activeTab === "orders" && (
          <section className="tab-section">
            <h2 className="section-title">📦 Manage Orders</h2>
            {orders.length > 0 ? (
              <div className="order-list">
                {orders.map(o => (
                  <div key={o._id} className="order-card">
                    <div className="order-header">
                      <div className="order-id">Order #{o._id.substring(0, 8)}...</div>
                      <div className="order-status-badge">
                        <span 
                          className="status-badge" 
                          style={{ 
                            backgroundColor: statusConfig[o.status]?.bg || "#f8f9fa",
                            color: statusConfig[o.status]?.color || "#6c757d"
                          }}
                        >
                          <span className="status-icon">{statusConfig[o.status]?.icon || "📋"}</span>
                          {o.status}
                        </span>
                      </div>
                    </div>
                    <div className="order-details">
                      <div className="user-info">
                        <strong>User:</strong> {o.userId?.name || "Unknown"}
                        <br />
                        <small>{o.userId?.email || ""} | {o.userId?.contact || ""}</small>
                      </div>
                      <div className="order-address">
                        <strong>Address:</strong> {o.userId?.address || "N/A"}
                      </div>
                      <div className="order-items">
                        <strong>Items:</strong>
                        <ul>
                          {o.items?.map((i, idx) => (
                            <li key={idx}>
                              {i.name} x{i.quantity} - ₹{i.price * i.quantity}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="order-total">
                        <strong>Total: ₹{o.total || 0}</strong>
                      </div>
                    </div>
                    {o.status !== "Delivered" && o.status !== "Cancelled" && (
                      <div className="order-actions">
                        {o.status === "Pending" && (
                          <>
                            <button
                              className="action-btn accept-btn"
                              onClick={() => updateOrderStatus(o._id, "Accepted")}
                              disabled={updatingOrderId === o._id}
                            >
                              {updatingOrderId === o._id ? "Updating..." : "Accept"}
                            </button>
                            <button
                              className="action-btn reject-btn"
                              onClick={() => updateOrderStatus(o._id, "Cancelled")}
                              disabled={updatingOrderId === o._id}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {o.status === "Accepted" && (
                          <button
                            className="action-btn prepare-btn"
                            onClick={() => updateOrderStatus(o._id, "Preparing")}
                            disabled={updatingOrderId === o._id}
                          >
                            {updatingOrderId === o._id ? "Updating..." : "Mark Preparing"}
                          </button>
                        )}
                        {o.status === "Preparing" && (
                          <button
                            className="action-btn delivery-btn"
                            onClick={() => updateOrderStatus(o._id, "Out for Delivery")}
                            disabled={updatingOrderId === o._id}
                          >
                            {updatingOrderId === o._id ? "Updating..." : "Out for Delivery"}
                          </button>
                        )}
                        {o.status === "Out for Delivery" && (
                          <button
                            className="action-btn delivered-btn"
                            onClick={() => updateOrderStatus(o._id, "Delivered")}
                            disabled={updatingOrderId === o._id}
                          >
                            {updatingOrderId === o._id ? "Updating..." : "Mark Delivered"}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📦</div>
                <h3>No orders yet.</h3>
                <p>Your first order will appear here.</p>
              </div>
            )}
          </section>
        )}

        {/* MENU TAB */}
        {activeTab === "menu" && (
          <section className="tab-section">
            <h2 className="section-title">🍴 Manage Menu</h2>
            <div className="menu-form">
              <div className="form-group">
                <input
                  placeholder="Item Name"
                  value={newMenuItem.name}
                  onChange={e => setNewMenuItem({ ...newMenuItem, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <input
                  type="number"
                  placeholder="Price (₹)"
                  value={newMenuItem.price}
                  onChange={e => setNewMenuItem({ ...newMenuItem, price: e.target.value })}
                />
              </div>
              <button className="add-btn" onClick={addMenuItem}>Add Item</button>
            </div>

            {menu.length > 0 ? (
              <div className="menu-list">
                {menu.map(item => (
                  <div key={item._id} className="menu-item-card">
                    {editMenuItemId === item._id ? (
                      <div className="edit-mode">
                        <input
                          value={editMenuItemData.name}
                          onChange={e => setEditMenuItemData({ ...editMenuItemData, name: e.target.value })}
                          placeholder="Item Name"
                        />
                        <input
                          type="number"
                          value={editMenuItemData.price}
                          onChange={e => setEditMenuItemData({ ...editMenuItemData, price: e.target.value })}
                          placeholder="Price (₹)"
                        />
                        <div className="edit-actions">
                          <button className="save-btn" onClick={saveEditMenuItem}>Save</button>
                          <button className="cancel-btn" onClick={() => setEditMenuItemId(null)}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="view-mode">
                        <div className="item-details">
                          <h4>{item.name}</h4>
                          <span className="item-price">₹{item.price}</span>
                        </div>
                        <div className="item-actions">
                          <button className="edit-item-btn" onClick={() => startEditMenuItem(item)}>Edit</button>
                          <button className="delete-item-btn" onClick={() => handleDeleteClick(item._id)}>Delete</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">🍴</div>
                <h3>No menu items yet.</h3>
                <p>Add your first item to get started.</p>
              </div>
            )}
          </section>
        )}

        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <section className="tab-section">
            <h2 className="section-title">🏪 Restaurant Profile</h2>
            <form className="profile-form" onSubmit={(e) => { e.preventDefault(); updateProfile(); }}>
              <div className="form-group">
                <label>Restaurant Name</label>
                <input
                  value={profile.name || ""}
                  onChange={e => setProfile({ ...profile, name: e.target.value })}
                  placeholder="Enter restaurant name"
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input
                  value={profile.address || ""}
                  onChange={e => setProfile({ ...profile, address: e.target.value })}
                  placeholder="Enter address"
                />
              </div>
              <div className="form-group">
                <label>Contact Number</label>
                <input
                  value={profile.contact || ""}
                  onChange={e => setProfile({ ...profile, contact: e.target.value })}
                  placeholder="Enter contact number"
                />
              </div>
              <button type="submit" className="save-profile-btn">Save Profile</button>
            </form>
          </section>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === "analytics" && (
          <section className="tab-section">
            <h2 className="section-title">📊 Analytics Dashboard</h2>
            <div className="analytics-grid">
              <div className="stat-card">
                <div className="stat-icon">📦</div>
                <h3>Total Orders</h3>
                <p className="stat-value">{orders.length}</p>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <h3>Total Revenue</h3>
                <p className="stat-value">₹{totalRevenue.toLocaleString()}</p>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <h3>Completion Rate</h3>
                <p className="stat-value">{orderCompletion}%</p>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${orderCompletion}%` }}></div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default RestaurantDashboard;