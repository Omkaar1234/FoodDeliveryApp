import React, { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { authFetch } from "../services/authService"; // Ensure this exists
import "../styles/CartPage.css";

function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, totalPrice, clearCart } =
    useContext(CartContext);
  const navigate = useNavigate();

  // ---------------- Handle Quantity Change ----------------
  const handleQuantityChange = (itemId, restaurantId, value) => {
    const quantity = Math.max(Number(value) || 1, 1); // Minimum 1
    updateQuantity(itemId, restaurantId, quantity);
  };

  // ---------------- Place Order ----------------
  const placeOrder = async () => {
    if (cartItems.length === 0) return alert("Cart is empty!");

    // Ensure single restaurant order
    const restaurantIds = [...new Set(cartItems.map((i) => i.restaurantId))];
    if (restaurantIds.length > 1) {
      return alert(
        "You have items from multiple restaurants. Place separate orders for each."
      );
    }

    try {
      const orderData = {
        restaurantId: cartItems[0].restaurantId,
        items: cartItems.map(({ name, price, quantity }) => ({
          name,
          price,
          quantity,
        })),
        total: totalPrice,
        deliveryAddress: "Default Address", // Replace with actual user address if available
      };

      const res = await authFetch("/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to place order");
      }

      alert("Order placed successfully!");
      clearCart();
      navigate("/user/orders"); // Navigate to user orders to track
    } catch (err) {
      console.error("Order placement failed:", err);
      alert(err.message || "Failed to place order. Try again.");
    }
  };

  return (
    <div className="cart-page">
      <h2>Your Cart</h2>

      {cartItems.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <div className="cart-list">
          {cartItems.map((item) => (
            <div key={item._id + item.restaurantId} className="cart-item">
              <div className="item-info">
                <p><strong>{item.name}</strong></p>
                <p>{item.restaurantName}</p>
              </div>
              <div className="item-actions">
                <button
                  onClick={() =>
                    updateQuantity(item._id, item.restaurantId, item.quantity - 1)
                  }
                  disabled={item.quantity <= 1}
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) =>
                    handleQuantityChange(item._id, item.restaurantId, e.target.value)
                  }
                />
                <button
                  onClick={() =>
                    updateQuantity(item._id, item.restaurantId, item.quantity + 1)
                  }
                >
                  +
                </button>
                <p>₹{item.price * item.quantity}</p>
                <button
                  className="remove-btn"
                  onClick={() => removeFromCart(item._id, item.restaurantId)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <div className="cart-total">
            <h3>Total: ₹{totalPrice}</h3>
            <button className="btn checkout-btn" onClick={placeOrder}>
              Place Order
            </button>
            <button onClick={clearCart} className="clear-btn">
              Clear Cart
            </button>
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