import React, { useState, useEffect, useCallback } from "react";
import "../styles/UserDashboard.css";
import { FaShoppingCart, FaUserCircle, FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import logo from "../styles/assets/icon.png";
import { getProfile, fetchAllRestaurants } from "../services/authService";
import { useContext } from "react";
import { CartContext } from "../context/CartContext";

function UserDashboard() {
  const [user, setUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { cartItems } = useContext(CartContext);

  // ---------------- Load User Profile ----------------
  const fetchUserProfile = useCallback(async () => {
    try {
      const profile = await getProfile();
      if (!profile || profile.error) throw new Error(profile.error || "Failed to fetch profile");

      setUser({
        name: profile.name || "Guest",
        email: profile.email || "guest@example.com",
        role: profile.role,
        id: profile._id,
      });

      // Save to localStorage
      if (profile.role) localStorage.setItem("role", profile.role);
      if (profile._id) localStorage.setItem("accountId", profile._id);
    } catch (err) {
      console.error("fetchUserProfile error:", err);
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
      setRestaurants(data || []);
      setFilteredRestaurants(data || []);
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
    const filtered = restaurants.filter(
      (r) =>
        (r.name || "").toLowerCase().includes(term) ||
        (r.type || "").toLowerCase().includes(term) ||
        (r.location || "").toLowerCase().includes(term) ||
        (r.address || "").toLowerCase().includes(term)
    );
    setFilteredRestaurants(filtered);
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

  return (
    <div>
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
          <button className="search-btn">
            <FaSearch />
          </button>
        </div>

        <div className="navbar-right">
          <div className="cart-icon" onClick={() => navigate("/cart")}>
            <FaShoppingCart size={24} />
            {cartItems.length > 0 && (
            <span className="cart-count">{cartItems.length}</span>
            )}
          </div>

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

      {/* Dashboard Content */}
      <div className="dashboard-content">
        <h2>Welcome, {user ? user.name : "Guest"}!</h2>
        <p>Browse restaurants and explore delicious food.</p>

        {loading ? (
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
                  <p className="small-text">
                    {r.type || "Restaurant"} | {r.address || "N/A"}
                  </p>
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