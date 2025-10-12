import React, { useState, useEffect, useCallback, useContext } from "react";
import "../styles/UserDashboard.css";
import { FaShoppingCart, FaUserCircle, FaSearch } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import logo from "../styles/assets/icon.png";
import { getProfile, fetchAllRestaurants } from "../services/authService";
import { CartContext } from "../context/CartContext";

function UserDashboard() {
  const [user, setUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAIModal, setShowAIModal] = useState(false);
  const [moodInput, setMoodInput] = useState("");
  const [aiResults, setAIResults] = useState([]);
  const [aiLoading, setAILoading] = useState(false);

  const navigate = useNavigate();
  const { cartItems } = useContext(CartContext);

  // ---------------- Load User Profile ----------------
  const fetchUserProfile = useCallback(async () => {
    try {
      const profile = await getProfile();
      if (!profile || profile.success === false) {
        throw new Error(profile.error || "Failed to fetch profile");
      }

      setUser({
        name: profile.name || "Guest",
        email: profile.email || "guest@example.com",
        role: profile.role,
        id: profile._id,
      });

      if (profile.role) localStorage.setItem("role", profile.role);
      if (profile._id) localStorage.setItem("accountId", profile._id);
    } catch (err) {
      console.error("fetchUserProfile error:", err);
      localStorage.clear();
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  // ---------------- Fetch Restaurants ----------------
  const fetchRestaurantsData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchAllRestaurants();
      // Ensure restaurants is an array
      const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      setRestaurants(list);
      setFilteredRestaurants(list);
    } catch (err) {
      console.error("fetchRestaurantsData error:", err);
      setError(err.message || "Failed to fetch restaurants");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRestaurantsData();
  }, [fetchRestaurantsData]);

  // ---------------- Filter Restaurants ----------------
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    if (!Array.isArray(restaurants)) return;
    setFilteredRestaurants(
      restaurants.filter(
        (r) =>
          (r.name || "").toLowerCase().includes(term) ||
          (r.type || "").toLowerCase().includes(term) ||
          (r.location || "").toLowerCase().includes(term) ||
          (r.address || "").toLowerCase().includes(term)
      )
    );
  }, [searchTerm, restaurants]);

  // ---------------- Logout ----------------
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // ---------------- Render Stars ----------------
  const renderStars = (count = 0) => {
    const validCount = Math.min(Math.max(Number(count) || 0, 0), 5);
    return "★".repeat(validCount) + "☆".repeat(5 - validCount);
  };

  // ---------------- AI Mood Search ----------------
  const handleAISearch = async () => {
    if (!moodInput) return;
    setAILoading(true);
    try {
      const res = await fetch("/api/ai/filter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: moodInput }),
      });
      const data = await res.json();
      setAIResults(data.items || []);
      setShowAIModal(false);
    } catch (err) {
      console.error("AI search error:", err);
      setAIResults([]);
    } finally {
      setAILoading(false);
    }
  };

  return (
    <div className="dashboard-wrapper">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-left">
          <img src={logo} alt="YumExpress" className="logo" />
        </div>
        <div className="navbar-center">
          <input
            type="text"
            placeholder="Search restaurants, cafes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button className="search-btn"><FaSearch /></button>
        </div>
        <div className="navbar-right">
          <div className="cart-icon" onClick={() => navigate("/cart")}>
            <FaShoppingCart size={24} />
            {cartItems.length > 0 && <span className="cart-count">{cartItems.length}</span>}
          </div>
          {user && user.role === "user" && (
            <Link to="/user/orders">
              <button className="btn orders-btn">My Orders</button>
            </Link>
          )}
          <div
            className="user-icon"
            onMouseEnter={() => setShowProfile(true)}
            onMouseLeave={() => setShowProfile(false)}
          >
            <FaUserCircle size={28} />
            {showProfile && user && (
              <div className="profile-dropdown">
                <p><strong>{user.name}</strong></p>
                <p>{user.email}</p>
                <button onClick={() => navigate("/user/profile")}>Edit Profile</button>
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* AI Modal */}
      {showAIModal && (
        <div className="ai-modal">
          <div className="ai-modal-content">
            <h3>Find food by your mood</h3>
            <input
              type="text"
              placeholder="How are you feeling?"
              value={moodInput}
              onChange={(e) => setMoodInput(e.target.value)}
            />
            <div className="ai-modal-buttons">
              <button onClick={handleAISearch}>Search</button>
              <button onClick={() => setShowAIModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Content */}
      <div className="dashboard-content">
        <h2>Welcome, {user ? user.name : "Guest"}!</h2>
        <button className="ai-search-btn" onClick={() => setShowAIModal(true)}>
          🍔 AI Mood Search
        </button>
        <p>Browse restaurants and explore delicious food.</p>

        {aiLoading ? (
          <p>Loading AI results...</p>
        ) : aiResults.length > 0 ? (
          <div>
            <h3>Recommended for your mood:</h3>
            <div className="restaurant-list">
              {aiResults.map((item) => (
                <div key={item._id} className="restaurant-card">
                  <img
                    src={item.image || "https://via.placeholder.com/400x250?text=Food"}
                    alt={item.name}
                    className="restaurant-image"
                  />
                  <div className="restaurant-info">
                    <h3>{item.name}</h3>
                    <p className="small-text">{item.category || "Food"}</p>
                    <p className="rating">{renderStars(item.rating)}</p>
                    <p>₹{item.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : loading ? (
          <p>Loading restaurants...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : filteredRestaurants.length > 0 ? (
          <div className="restaurant-list">
            {filteredRestaurants.map((r) => (
              <div key={r._id} className="restaurant-card">
                <img
                  src={r.image || "https://via.placeholder.com/400x250?text=Restaurant"}
                  alt={r.name}
                  className="restaurant-image"
                />
                <div className="restaurant-info">
                  <h3>{r.name}</h3>
                  <p className="small-text">{r.type || "Restaurant"} | {r.address || "N/A"}</p>
                  <p className="rating">{renderStars(r.rating)}</p>
                  <button
                    className="view-menu-btn"
                    onClick={() => navigate(`/restaurant/${r._id}`)}
                  >
                    View Menu
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No restaurants found for "{searchTerm}"</p>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;