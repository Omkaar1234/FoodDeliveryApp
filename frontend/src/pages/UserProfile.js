// UserProfile.js
import React, { useEffect, useState } from "react";
import { getUserProfile, updateUserProfile } from "../services/authService";
import "../styles/UserProfile.css";

function UserProfile() {
  const [profile, setProfile] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch profile on component mount
  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await getUserProfile();
        if (data.error) {
          setError(data.error);
        } else {
          setProfile(data);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Server error. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await updateUserProfile(profile);
      if (response.error) {
        setError(response.error);
      } else {
        setMessage(response.message || "Profile updated successfully!");
        setProfile(response.user || profile);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Server error. Could not update profile.");
    }
  };

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="profile-container">
      <h2>User Profile</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          value={profile.name || ""}
          onChange={handleChange}
          placeholder="Name"
          required
        />
        <input
          name="phone"
          value={profile.phone || ""}
          onChange={handleChange}
          placeholder="Phone"
        />
        <input
          name="address"
          value={profile.address || ""}
          onChange={handleChange}
          placeholder="Address"
        />
        <textarea
          name="bio"
          value={profile.bio || ""}
          onChange={handleChange}
          placeholder="Bio"
        />

        <button type="submit">Update Profile</button>
      </form>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default UserProfile;