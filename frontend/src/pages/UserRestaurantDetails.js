// UserRestaurantDetails.js
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../styles/UserRestaurantDetails.css";

const UserRestaurantDetails = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState({});
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch restaurant & menu
  const fetchRestaurantData = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/restaurants/${id}`);
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setRestaurant(data);
        setMenu(data.menu || []);
      }
    } catch (err) {
      console.error("Failed to fetch restaurant:", err);
      setError("Server error. Could not fetch restaurant details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurantData();
    const interval = setInterval(fetchRestaurantData, 5000); // Poll menu updates
    return () => clearInterval(interval);
  }, [id]);

  // Cart functions
  const addToCart = (item) => {
    const existing = cart.find((c) => c._id === item._id);
    if (existing) {
      setCart(cart.map((c) => c._id === item._id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter((c) => c._id !== itemId));
  };

  const changeQuantity = (itemId, delta) => {
    setCart(cart.map((c) => c._id === itemId ? { ...c, quantity: Math.max(c.quantity + delta, 1) } : c));
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const placeOrder = async () => {
    if (cart.length === 0) return alert("Cart is empty!");
    const token = localStorage.getItem("token");

    const orderData = {
      restaurantId: id,
      items: cart.map(i => ({ name: i.name, price: i.price, quantity: i.quantity })),
      total: totalPrice,
      deliveryAddress: "Default Address" // Can integrate user profile later
    };

    try {
      const res = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      const data = await res.json();
      if (data.error) return alert(data.error);

      alert("Order placed successfully!");
      setCart([]);
    } catch (err) {
      console.error("Order placement failed:", err);
      alert("Failed to place order. Try again.");
    }
  };

  if (loading) return <p>Loading restaurant details...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="restaurant-details">
      <h2>{restaurant.name}</h2>
      <p>{restaurant.address}</p>
      <p>Contact: {restaurant.contact || "N/A"}</p>

      <h3>🍴 Menu</h3>
      <div className="menu-list">
        {menu.length > 0 ? menu.map((item) => (
          <div key={item._id} className="menu-card">
            <p><strong>{item.name}</strong> - ₹{item.price}</p>
            <div className="menu-actions">
              <button className="btn add-btn" onClick={() => addToCart(item)}>Add to Cart</button>
            </div>
          </div>
        )) : <p>No menu items available.</p>}
      </div>

      <h3>🛒 Cart</h3>
      {cart.length > 0 ? (
        <div className="cart-list">
          {cart.map((item) => (
            <div key={item._id} className="cart-item">
              <p>{item.name} x{item.quantity} - ₹{item.price * item.quantity}</p>
              <div className="cart-actions">
                <button onClick={() => changeQuantity(item._id, 1)}>+</button>
                <button onClick={() => changeQuantity(item._id, -1)}>-</button>
                <button className="btn delete-btn" onClick={() => removeFromCart(item._id)}>Remove</button>
              </div>
            </div>
          ))}
          <p><strong>Total: ₹{totalPrice}</strong></p>
          <button className="btn checkout-btn" onClick={placeOrder}>Place Order</button>
        </div>
      ) : <p>Cart is empty.</p>}
    </div>
  );
};

export default UserRestaurantDetails;