import React, { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { authFetch } from "../services/authService";
import "../styles/CartPage.css";

function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, totalPrice, clearCart } =
    useContext(CartContext);
  const navigate = useNavigate();

  const handleQuantityChange = (itemId, restaurantId, value) => {
    const quantity = Math.max(Number(value) || 1, 1);
    updateQuantity(itemId, restaurantId, quantity);
  };

  // ✅ Place order
  const placeOrder = async () => {
    if (cartItems.length === 0) return alert("Cart is empty!");

    const restaurantIds = [...new Set(cartItems.map((i) => i.restaurantId))];
    if (restaurantIds.length > 1) {
      return alert(
        "You have items from multiple restaurants. Place separate orders for each."
      );
    }

    try {
      const orderData = {
        restaurantId: restaurantIds[0],
        items: cartItems.map(({ name, price, quantity }) => ({
          name,
          price,
          quantity,
        })),
        total: totalPrice,
      };

      await authFetch("/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      alert("✅ Order placed successfully!");
      clearCart();
      navigate("/user/orders");
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