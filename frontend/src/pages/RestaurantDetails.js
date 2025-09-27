// RestaurantDetails.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../styles/RestaurantDetails.css";

function RestaurantDetails() {
  const { id } = useParams(); // restaurant id from URL
  const [restaurant, setRestaurant] = useState(null);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  // Fetch restaurant details
  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/restaurants/${id}`);
        const data = await res.json();
        setRestaurant(data);
      } catch (err) {
        console.error("Failed to fetch restaurant:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurant();
  }, [id]);

  // Add item to cart
  const addToCart = (item) => {
    const exists = cart.find((i) => i._id === item._id);
    if (exists) {
      setCart(cart.map((i) =>
        i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  // Remove item from cart
  const removeFromCart = (itemId) => {
    setCart(cart.filter((i) => i._id !== itemId));
  };

  // Calculate total price
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Place order
  const placeOrder = async () => {
    if (cart.length === 0) return alert("Cart is empty!");

    const token = localStorage.getItem("token");
    setPlacingOrder(true);

    try {
      const res = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          restaurantId: id,
          items: cart.map(({ _id, quantity }) => ({ itemId: _id, quantity })),
          total: totalPrice,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        alert("Order placed successfully!");
        setCart([]);
      } else {
        alert(data.error || "Failed to place order.");
      }
    } catch (err) {
      console.error(err);
      alert("Server error. Please try again later.");
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) return <p>Loading restaurant details...</p>;
  if (!restaurant) return <p>Restaurant not found.</p>;

  return (
    <div className="restaurant-details">
      <h2>{restaurant.name}</h2>
      <p>{restaurant.location}</p>
      {restaurant.image && (
        <img src={restaurant.image} alt={restaurant.name} className="restaurant-photo" />
      )}

      <h3>Menu</h3>
      <div className="menu-list">
        {restaurant.menu && restaurant.menu.length > 0 ? (
          restaurant.menu.map((item) => (
            <div key={item._id} className="menu-item">
              <p>{item.name}</p>
              <p>${item.price}</p>
              <button onClick={() => addToCart(item)}>Add to Cart</button>
            </div>
          ))
        ) : (
          <p>No items available</p>
        )}
      </div>

      {cart.length > 0 && (
        <div className="cart">
          <h3>Your Cart</h3>
          {cart.map((item) => (
            <div key={item._id} className="cart-item">
              <p>{item.name} x {item.quantity}</p>
              <p>${item.price * item.quantity}</p>
              <button onClick={() => removeFromCart(item._id)}>Remove</button>
            </div>
          ))}
          <p><strong>Total: ${totalPrice}</strong></p>
          <button
            onClick={placeOrder}
            className="place-order-btn"
            disabled={placingOrder}
          >
            {placingOrder ? "Placing Order..." : "Place Order"}
          </button>
        </div>
      )}
    </div>
  );
}

export default RestaurantDetails;