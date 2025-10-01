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
      setMenu((data?.menu) || []);
    } catch (err) {
      console.error("Failed to fetch restaurant:", err);
      setError(err.message || "Server error. Could not fetch restaurant details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRestaurantData();
    const interval = setInterval(fetchRestaurantData, 15000); // refresh menu every 15s
    return () => clearInterval(interval);
  }, [fetchRestaurantData]);

  // ---------------- Cart Handlers ----------------
  const handleAddToCart = (item) => {
    addToCart({
      itemId: item._id,
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
      (c) => c.itemId === itemId && c.restaurantId === restaurant._id
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
        removeFromCart(item.itemId, restaurant._id)
      );
    } catch (err) {
      console.error(err);
      alert("Failed to place order.");
    }
  };

  if (loading) return <p>Loading restaurant details...</p>;
  if (error) return <p className="error">{error}</p>;

  const cartFromThisRestaurant = cartItems.filter(
    (c) => c.restaurantId === restaurant._id
  );

  return (
    <div className="restaurant-details">
      <h2>{restaurant.name || "Restaurant"}</h2>
      <p>{restaurant.address || "Address not available"}</p>
      <p>Contact: {restaurant.contact || "N/A"}</p>

      {/* ---------------- Menu ---------------- */}
      <h3>🍴 Menu</h3>
      <div className="menu-list">
        {menu.length > 0 ? (
          menu.map((item) => (
            <div key={item._id} className="menu-card">
              <p>
                <strong>{item.name}</strong> - ₹{item.price}
              </p>
              <button className="btn add-btn" onClick={() => handleAddToCart(item)}>
                Add to Cart
              </button>
            </div>
          ))
        ) : (
          <p>No menu items available.</p>
        )}
      </div>

      {/* ---------------- Cart ---------------- */}
      <h3>🛒 Cart</h3>
      {cartFromThisRestaurant.length > 0 ? (
        <div className="cart-list">
          {cartFromThisRestaurant.map((item) => (
            <div key={item.itemId} className="cart-item">
              <p>
                {item.name} x {item.quantity} - ₹{item.price * item.quantity}
              </p>
              <div className="cart-actions">
                <button onClick={() => handleChangeQuantity(item.itemId, 1)}>+</button>
                <button onClick={() => handleChangeQuantity(item.itemId, -1)}>-</button>
                <button className="btn delete-btn" onClick={() => handleRemoveFromCart(item.itemId)}>Remove</button>
              </div>
            </div>
          ))}
          <p>
            <strong>
              Total: ₹
              {cartFromThisRestaurant.reduce((sum, item) => sum + item.price * item.quantity, 0)}
            </strong>
          </p>
          <button className="btn checkout-btn" onClick={placeOrder}>Place Order</button>
        </div>
      ) : (
        <p>Cart is empty.</p>
      )}

      {/* Popup */}
      {showAddedPopup && <div className="added-popup">Item added to cart!</div>}
    </div>
  );
};

export default UserRestaurantDetails;