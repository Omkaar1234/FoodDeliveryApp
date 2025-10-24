import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../styles/RestaurantDetails.css";

// 🔑 Simple fetch wrapper (no auth needed for public restaurant menu)
const fetchJSON = async (url) => {
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch");
  return data;
};

// Auth fetch for placing order
const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found. Please login.");
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
};

function RestaurantDetails() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    const fetchRestaurant = async () => {
      setLoading(true);
      try {
        const data = await fetchJSON(`${process.env.REACT_APP_API_URL}/restaurants/${id}`);
        setRestaurant(data);
      } catch (err) {
        console.error(err);
        alert(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurant();
  }, [id]);

    const addToCart = (item) => {
    const exists = cart.find((i) => i._id === item._id);
    if (exists) {
      setCart(cart.map((i) => i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId) => setCart(cart.filter((i) => i._id !== itemId));

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const placeOrder = async () => {
    if (cart.length === 0) return alert("Cart is empty!");
    setPlacingOrder(true);
    try {
      await authFetch(`${process.env.REACT_APP_API_URL}/orders`, {
        method: "POST",
        body: JSON.stringify({
          restaurantId: id,
          items: cart.map(({ name, price, quantity }) => ({ name, price, quantity })),
          total: totalPrice,
        }),
      });
      alert("Order placed successfully!");
      setCart([]);
    } catch (err) {
      console.error(err);
      alert(err.message);
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
        {restaurant.menu?.length > 0 ? (
          restaurant.menu.map((item) => (
            <div key={item._id} className="menu-item">
              <p>{item.name}</p>
              <p>₹{item.price}</p>
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
              <p>₹{item.price * item.quantity}</p>
              <button onClick={() => removeFromCart(item._id)}>Remove</button>
            </div>
          ))}
          <p><strong>Total: ₹{totalPrice}</strong></p>
          <button onClick={placeOrder} disabled={placingOrder}>
            {placingOrder ? "Placing Order..." : "Place Order"}
          </button>
        </div>
      )}
    </div>
  );
}

export default RestaurantDetails;