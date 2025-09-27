// UserDashboard.js
import React, { useState, useEffect } from "react";
import "../styles/UserDashboard.css";
import { FaShoppingCart, FaUserCircle, FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import logo from "../styles/assets/icon.png";

function UserDashboard() {
  const [user, setUser] = useState({ name: "", email: "" });
  const [showProfile, setShowProfile] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load user info from localStorage
  useEffect(() => {
    const storedName = localStorage.getItem("userName") || "John Doe";
    const storedEmail = localStorage.getItem("userEmail") || "john@example.com";
    setUser({ name: storedName, email: storedEmail });
  }, []);

  // Fetch restaurants from backend
  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:5000/api/restaurants");
        const data = await res.json();
        setRestaurants(data);
        setFilteredRestaurants(data);
      } catch (err) {
        console.error("Error fetching restaurants:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, []);

  // Filter restaurants whenever search term changes
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = restaurants.filter(
      (r) =>
        r.name?.toLowerCase().includes(term) ||
        r.type?.toLowerCase().includes(term) ||
        r.location?.toLowerCase().includes(term)
    );
    setFilteredRestaurants(filtered);
  }, [searchTerm, restaurants]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const renderStars = (count = 0) => "★".repeat(count) + "☆".repeat(5 - count);

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
          <div className="cart-icon">
            <FaShoppingCart size={24} />
          </div>

          <div
            className="user-icon"
            onMouseEnter={() => setShowProfile(true)}
            onMouseLeave={() => setShowProfile(false)}
          >
            <FaUserCircle size={28} />
            {showProfile && (
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

      <div className="dashboard-content">
        <h2>Welcome, {user.name}!</h2>
        <p>Browse restaurants and explore delicious food.</p>

        <div className="restaurant-list">
          {loading ? (
            <p>Loading restaurants...</p>
          ) : filteredRestaurants.length > 0 ? (
            filteredRestaurants.map((r) => (
              <div key={r._id} className="restaurant-card">
                <img
                  src={r.image || "https://via.placeholder.com/400x250?text=Restaurant"}
                  alt={r.name}
                  className="restaurant-image"
                />
                <div className="restaurant-info">
                  <h3>{r.name}</h3>
                  <p className="small-text">{r.type || "Restaurant"} | {r.location || "N/A"}</p>
                  <p className="rating">{renderStars(r.rating)}</p>
                  <button
                    className="view-menu-btn"
                    onClick={() => navigate(`/restaurant/${r._id}`)}
                  >
                    View Menu
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>No restaurants found for "{searchTerm}"</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;