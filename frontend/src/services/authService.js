// src/services/authService.js
const API_URL = process.env.REACT_APP_API_URL;

// ---------------- Helper ----------------
const parseJSON = async (res) => {
  const text = await res.text();
  if (!text) return {}; // handle empty response
  try {
    return JSON.parse(text);
  } catch {
    console.error("Server returned non-JSON response:", text);
    return { success: false, error: "Invalid server response" };
  }
};

// ---------------- LOGIN ----------------
export async function loginUser(email, password) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await parseJSON(response);

    if (!response.ok) {
      return { success: false, error: data.error || "Invalid credentials" };
    }

    // Save token, role & accountId
    if (data.token) localStorage.setItem("token", data.token);
    if (data.role) localStorage.setItem("role", data.role);
    if (data.accountId) localStorage.setItem("accountId", data.accountId);

    return { success: true, ...data };
  } catch (err) {
    console.error("Login service error:", err);
    return { success: false, error: "Server error" };
  }
}

// ---------------- REGISTER USER ----------------
export async function registerUser(userData) {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...userData, role: "user" }),
    });

    const data = await parseJSON(response);

    if (!response.ok) {
      return { success: false, error: data.error || "User registration failed" };
    }

    return { success: true, ...data };
  } catch (err) {
    console.error("Register user error:", err);
    return { success: false, error: "Server error" };
  }
}

// ---------------- REGISTER RESTAURANT ----------------
export async function registerRestaurant(restaurantData) {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...restaurantData, role: "restaurant" }),
    });

    const data = await parseJSON(response);

    if (!response.ok) {
      return { success: false, error: data.error || "Restaurant registration failed" };
    }

    return { success: true, ...data };
  } catch (err) {
    console.error("Register restaurant error:", err);
    return { success: false, error: "Server error" };
  }
}

// ---------------- AUTH FETCH ----------------
export const authFetch = async (endpoint, options = {}, requiredRole = null) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) throw new Error("No token found; please login again.");
  if (requiredRole && role?.toLowerCase() !== requiredRole.toLowerCase()) {
    throw new Error("Forbidden: Insufficient role");
  }

  const { body, ...rest } = options;

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...rest,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
    ...(body ? { body: typeof body === "string" ? body : JSON.stringify(body) } : {}),
  });

  const data = await parseJSON(response);

  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
};

// ---------------- GET PROFILE ----------------
export const getProfile = async () => {
  try {
    // ✅ Backend provides one endpoint: /api/profile
    const data = await authFetch("/profile");

    if (!data.success) {
      return { success: false, error: data.error || "Failed to fetch profile" };
    }

    return data; // returns { success: true, _id, name, email, role }
  } catch (err) {
    console.error("Get profile error:", err);
    return { success: false, error: err.message || "Server error" };
  }
};

// ---------------- UPDATE PROFILE ----------------
export const updateProfile = async (profileData) => {
  try {
    // ✅ Same endpoint for both roles
    return await authFetch("/profile", { method: "PUT", body: profileData });
  } catch (err) {
    console.error("Update profile error:", err);
    return { success: false, error: err.message || "Server error" };
  }
};



// ---------------- FETCH ALL RESTAURANTS (PUBLIC) ----------------
export const fetchAllRestaurants = async () => {
  try {
    const res = await fetch(`${API_URL}/restaurants`);
    const data = await parseJSON(res);
    if (!res.ok) throw new Error(data.error || "Failed to fetch restaurants");
    return data;
  } catch (err) {
    console.error("fetchAllRestaurants error:", err);
    return [];
  }
};