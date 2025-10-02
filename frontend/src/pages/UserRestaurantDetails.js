// src/pages/UserRestaurantDetails.js
import React, { useState, useEffect, useCallback, useContext } from "react";
import { useParams } from "react-router-dom";
import "../styles/UserRestaurantDetails.css";
import { authFetch } from "../services/authService";
import { CartContext } from "../context/CartContext";

const UserRestaurantDetails = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState({});
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddedPopup, setShowAddedPopup] = useState(false);

  const { cartItems, addToCart, removeFromCart, updateQuantity } =
    useContext(CartContext);

  // ---------------- Fetch Restaurant ----------------
  const fetchRestaurantData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await authFetch(`/restaurants/${id}`);
      setRestaurant(data || {});
      setMenu(data?.menu || []);
    } catch (err) {
      console.error("Failed to fetch restaurant:", err);
      setError(err.message || "Server error. Could not fetch restaurant details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRestaurantData();
    const interval = setInterval(fetchRestaurantData, 60000); // refresh menu every 15s
    return () => clearInterval(interval);
  }, [fetchRestaurantData]);

  // ---------------- Cart Handlers ----------------
  const handleAddToCart = (item) => {
    addToCart({
      _id: item._id, // ✅ keep consistent with CartContext
      name: item.name,
      price: item.price,
      quantity: 1,
      restaurantId: restaurant._id,
      restaurantName: restaurant.name,
    });
    setShowAddedPopup(true);
    setTimeout(() => setShowAddedPopup(false), 1500);
  };

  const handleChangeQuantity = (itemId, delta) => {
    const cartItem = cartItems.find(
      (c) => c._id === itemId && c.restaurantId === restaurant._id
    );
    if (!cartItem) return;
    const newQuantity = Math.max(cartItem.quantity + delta, 1);
    updateQuantity(itemId, restaurant._id, newQuantity);
  };

  const handleRemoveFromCart = (itemId) => {
    removeFromCart(itemId, restaurant._id);
  };

  const placeOrder = async () => {
    const itemsFromThisRestaurant = cartItems.filter(
      (c) => c.restaurantId === restaurant._id
    );
    if (itemsFromThisRestaurant.length === 0) return alert("Cart is empty!");

    try {
      const orderData = {
        restaurantId: restaurant._id,
        items: itemsFromThisRestaurant.map(({ name, price, quantity }) => ({
          name,
          price,
          quantity,
        })),
        total: itemsFromThisRestaurant.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        ),
        deliveryAddress: "Default Address",
      };

      await authFetch("/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      alert("Order placed successfully!");
      // remove ordered items from cart
      itemsFromThisRestaurant.forEach((item) =>
        removeFromCart(item._id, restaurant._id)
      );
    } catch (err) {
      console.error(err);
      alert("Failed to place order.");
    }
  };

  if (loading) return <p className="loading">Loading restaurant details...</p>;
  if (error) return <p className="error">{error}</p>;

  const cartFromThisRestaurant = cartItems.filter(
    (c) => c.restaurantId === restaurant._id
  );

  return (
    <div className="restaurant-details">
      {/* Restaurant Header - Horizontal Layout */}
      <div className="restaurant-header">
        <div className="restaurant-name">
          <h2>{restaurant.name || "Restaurant"}</h2>
        </div>
        <div className="restaurant-info-row">
          <div className="info-item">
            <span className="info-label">Address:</span>
            <span>{restaurant.address || "Address not available"}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Contact:</span>
            <span>{restaurant.contact || "N/A"}</span>
          </div>
        </div>
      </div>

      {/* ---------------- Menu ---------------- */}
      <section className="menu-section">
        <h3 className="section-title">🍴 Menu</h3>
        <div className="menu-list">
          {menu.length > 0 ? (
            menu.map((item, index) => (
              <div key={item._id} className="menu-item" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="item-details">
                  <strong className="item-name">{item.name}</strong>
                  <span className="item-price">₹{item.price}</span>
                </div>
                <button
                  className="btn add-btn"
                  onClick={() => handleAddToCart(item)}
                >
                  Add +
                </button>
              </div>
            ))
          ) : (
            <p className="no-items">No menu items available.</p>
          )}
        </div>
      </section>

      {/* ---------------- Cart ---------------- */}
      <section className="cart-section">
        <h3 className="section-title">🛒 Cart</h3>
        {cartFromThisRestaurant.length > 0 ? (
          <div className="cart-list">
            {cartFromThisRestaurant.map((item, index) => (
              <div key={item._id} className="cart-item" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="item-details">
                  <span className="item-name">{item.name}</span>
                  <span className="quantity">x {item.quantity}</span>
                  <span className="item-price">₹{item.price * item.quantity}</span>
                </div>
                <div className="cart-actions">
                  <button 
                    className="qty-btn" 
                    onClick={() => handleChangeQuantity(item._id, 1)}
                  >
                    +
                  </button>
                  <button 
                    className="qty-btn" 
                    onClick={() => handleChangeQuantity(item._id, -1)}
                  >
                    -
                  </button>
                  <button
                    className="btn delete-btn"
                    onClick={() => handleRemoveFromCart(item._id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <div className="cart-total">
              <strong>
                Total: ₹
                {cartFromThisRestaurant.reduce(
                  (sum, item) => sum + item.price * item.quantity,
                  0
                )}
              </strong>
            </div>
            <button className="btn checkout-btn" onClick={placeOrder}>
              Place Order
            </button>
          </div>
        ) : (
          <p className="no-items">Cart is empty.</p>
        )}
      </section>

      {/* Popup */}
      {showAddedPopup && <div className="added-popup">Item added to cart! 🎉</div>}
    </div>
  );
};

export default UserRestaurantDetails;
