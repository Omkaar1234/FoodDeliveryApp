// src/pages/UserProfile.js (Updated with Beautiful Design)
import React, { useEffect, useState } from "react";
import { getProfile, updateProfile } from "../services/authService";
import "../styles/UserProfile.css";

function UserProfile() {
  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    address: "",
    bio: "",
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false); // For toggle edit mode

  // ---------------- FETCH PROFILE ----------------
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        if (data.error) {
          setError(data.error);
        } else {
          // Ensure default values for undefined fields
          setProfile({
            name: data.name || "",
            phone: data.phone || "",
            address: data.address || "",
            bio: data.bio || "",
          });
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Server error. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // ---------------- HANDLE INPUT CHANGE ----------------
  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  // ---------------- HANDLE FORM SUBMIT ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await updateProfile(profile);
      if (response.error) {
        setError(response.error);
      } else {
        // Some APIs return updated user in 'user', else just return profile
        setProfile(response.user || profile);
        setMessage(response.message || "Profile updated successfully!");
        setIsEditing(false); // Exit edit mode on success
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Server error. Could not update profile.");
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-avatar">
          <div className="avatar-placeholder">
            {profile.name ? profile.name.charAt(0).toUpperCase() : "U"}
          </div>
        </div>
        <div className="profile-info">
          <h1 className="profile-name">{profile.name || "User "}</h1>
          <p className="profile-tagline">
            {profile.bio || "Update your profile to get started!"}
          </p>
        </div>
        {!isEditing && (
          <button className="edit-btn" onClick={() => setIsEditing(true)}>
            Edit Profile
          </button>
        )}
      </div>

      {/* Profile Display (Read-Only Mode) */}
      {!isEditing && (
        <div className="profile-display">
          <div className="info-card">
            <div className="info-item">
              <span className="info-icon">📱</span>
              <div>
                <label>Phone</label>
                <p>{profile.phone || "Not set"}</p>
              </div>
            </div>
            <div className="info-item">
              <span className="info-icon">📍</span>
              <div>
                <label>Address</label>
                <p>{profile.address || "Not set"}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Form */}
      {isEditing && (
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <div className="input-wrapper">
              <span className="input-icon">👤</span>
              <input
                id="name"
                name="name"
                type="text"
                value={profile.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                autoFocus
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <div className="input-wrapper">
              <span className="input-icon">📱</span>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={profile.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="address">Address</label>
            <div className="input-wrapper">
              <span className="input-icon">📍</span>
              <input
                id="address"
                name="address"
                type="text"
                value={profile.address}
                onChange={handleChange}
                placeholder="Enter your address"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="bio">Address</label>
            <div className="input-wrapper">
              <span className="input-icon">✏️</span>
              <textarea
                id="bio"
                name="bio"
                value={profile.bio}
                onChange={handleChange}
                placeholder="Tell us your address..."
                rows="4"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              Update Profile
            </button>
          </div>
        </form>
      )}

      {/* Messages */}
      {message && <div className="success-message">{message} 🎉</div>}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}

export default UserProfile;
