import React, { useContext } from "react";
import { CartContext } from "../context/CartContext"; // ✅ Ensure correct casing
import { useNavigate } from "react-router-dom";
import "../styles/CartPage.css";

function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, totalPrice, clearCart } =
    useContext(CartContext);
  const navigate = useNavigate();

  // Helper to update quantity from input
  const handleQuantityChange = (itemId, restaurantId, value) => {
    const quantity = Math.max(Number(value), 1); // Ensure minimum 1
    updateQuantity(itemId, restaurantId, quantity);
  };

  return (
    <div className="cart-page">
      <h2>Your Cart</h2>

      {cartItems.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <div className="cart-list">
          {cartItems.map((item) => (
            <div key={item.itemId + item.restaurantId} className="cart-item">
              <div className="item-info">
                <p><strong>{item.name}</strong></p>
                <p>{item.restaurantName}</p>
              </div>
              <div className="item-actions">
                <button onClick={() => updateQuantity(item.itemId, item.restaurantId, item.quantity - 1)}>-</button>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) =>
                    handleQuantityChange(item.itemId, item.restaurantId, e.target.value)
                  }
                />
                <button onClick={() => updateQuantity(item.itemId, item.restaurantId, item.quantity + 1)}>+</button>
                <p>₹{item.price * item.quantity}</p>
                <button
                  className="remove-btn"
                  onClick={() => removeFromCart(item.itemId, item.restaurantId)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <div className="cart-total">
            <h3>Total: ₹{totalPrice}</h3>
            <button onClick={clearCart} className="clear-btn">Clear Cart</button>
            <button 
              onClick={() => navigate("/user/dashboard")} 
              className="continue-btn"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;