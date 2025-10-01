import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CartContext } from "./context/CartContext";
import { authFetch } from "../services/authService";
import "../styles/RestaurantPage.css";

const RestaurantPage = () => {
  const { id } = useParams(); // restaurant id
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const data = await authFetch(`/restaurants/${id}`);
        setRestaurant(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurant();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!restaurant) return <p>Restaurant not found</p>;

  return (
    <div className="restaurant-page">
      <h2>{restaurant.name}</h2>
      <p>{restaurant.address}</p>

      <div className="menu-list">
        {restaurant.menu && restaurant.menu.length > 0 ? (
          restaurant.menu.map((item) => (
            <div key={item._id} className="menu-item">
              <h4>{item.name}</h4>
              <p>₹{item.price}</p>
              <button onClick={() => addToCart({ ...item, restaurantId: id })}>
                Add to Cart
              </button>
            </div>
          ))
        ) : (
          <p>No items available</p>
        )}
      </div>

      <button onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
    </div>
  );
};

export default RestaurantPage;