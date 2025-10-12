const API_URL = process.env.REACT_APP_API_URL;

// ---------------- Helper ----------------
const parseJSON = async (res) => {
  const text = await res.text();
  if (!text) return {};
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

    if (!response.ok) return { success: false, error: data.error || "Invalid credentials" };

    // Normalize user object
    const user = data.user || { _id: data.accountId, name: data.name, email, role: data.role };

    // Save to localStorage
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);
    localStorage.setItem("accountId", data.accountId);

    return { success: true, token: data.token, role: data.role, accountId: data.accountId, user };
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
    if (!response.ok) return { success: false, error: data.error || "User registration failed" };

    return { success: true, user: data };
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
    if (!response.ok) return { success: false, error: data.error || "Restaurant registration failed" };

    return { success: true, user: data };
  } catch (err) {
    console.error("Register restaurant error:", err);
    return { success: false, error: "Server error" };
  }
}

// ---------------- AUTH FETCH ----------------
export const authFetch = async (endpoint, options = {}, requiredRole = null) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) return { success: false, error: "No token found; please login again." };
  if (requiredRole && role?.toLowerCase() !== requiredRole.toLowerCase()) {
    return { success: false, error: "Forbidden: Insufficient role" };
  }

  try {
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

    if (response.status === 401) {
      localStorage.clear();
      return { success: false, error: "Unauthorized. Please login again." };
    }

    if (!response.ok) return { success: false, error: data.error || "Request failed" };

    return { success: true, data };
  } catch (err) {
    console.error("authFetch error:", err);
    return { success: false, error: "Server error" };
  }
};

// ---------------- GET PROFILE ----------------
export const getProfile = async () => {
  const res = await authFetch("/profile");
  if (!res.success) return { success: false, error: res.error || "Failed to fetch profile" };
  // Normalize to return { success, profile }
  return { success: true, profile: res.data };
};

// ---------------- UPDATE PROFILE ----------------
export const updateProfile = async (profileData) => {
  const res = await authFetch("/profile", { method: "PUT", body: profileData });
  if (!res.success) return { success: false, error: res.error || "Failed to update profile" };
  return { success: true, profile: res.data };
};

// ---------------- FETCH ALL RESTAURANTS ----------------
export const fetchAllRestaurants = async () => {
  try {
    const res = await fetch(`${API_URL}/restaurants`);
    const data = await parseJSON(res);
    if (!res.ok) return { success: false, data: [], error: data.error || "Failed to fetch restaurants" };
    return { success: true, data };
  } catch (err) {
    console.error("fetchAllRestaurants error:", err);
    return { success: false, data: [], error: "Server error" };
  }
};