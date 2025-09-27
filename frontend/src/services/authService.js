// ---------------- LOGIN ----------------
export async function loginUser(email, password) {
  try {
    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || "Invalid credentials" };
    }

    return { success: true, token: data.token, role: data.role };
  } catch (error) {
    return { success: false, error: "Server error" };
  }
}

// ---------------- REGISTER USER ----------------
export async function registerUser(userData) {
  try {
    const response = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...userData, role: "user" }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || "User registration failed" };
    }

    return { success: true, message: data.message };
  } catch (error) {
    return { success: false, error: "Server error" };
  }
}

// ---------------- REGISTER RESTAURANT ----------------
export async function registerRestaurant(restaurantData) {
  try {
    const response = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...restaurantData, role: "restaurant" }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || "Restaurant registration failed" };
    }

    return { success: true, message: data.message };
  } catch (error) {
    return { success: false, error: "Server error" };
  }
}

// ---------------- GET USER PROFILE ----------------
export async function getUserProfile() {
  const token = localStorage.getItem("token");
  const response = await fetch("http://localhost:5000/api/auth/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return await response.json();
}

// ---------------- UPDATE USER PROFILE ----------------
export async function updateUserProfile(profileData) {
  const token = localStorage.getItem("token");
  const response = await fetch("http://localhost:5000/api/auth/profile", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });
  return await response.json();
}

// ---------------- PLACE ORDER ----------------
export async function placeOrder(restaurantId, cart, total) {
  const token = localStorage.getItem("token");

  const orderData = {
    restaurantId,
    items: cart.map(item => ({
      name: item.name,
      price: item.price,
      quantity: item.quantity
    })),
    total,
    deliveryAddress: "Default Address" // can later fetch from user profile
  };

  try {
    const response = await fetch("http://localhost:5000/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || "Failed to place order" };
    }

    return { success: true, message: "Order placed successfully", order: data };
  } catch (err) {
    console.error("Place order error:", err);
    return { success: false, error: "Server error" };
  }
}