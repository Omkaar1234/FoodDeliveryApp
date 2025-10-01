// UserProfile.js
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
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Server error. Could not update profile.");
    }
  };

  if (loading) return <p>Loading profile...</p>;

  return (
    <div className="profile-container">
      <h2>User Profile</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          value={profile.name}
          onChange={handleChange}
          placeholder="Name"
          required
        />
        <input
          name="phone"
          value={profile.phone}
          onChange={handleChange}
          placeholder="Phone"
        />
        <input
          name="address"
          value={profile.address}
          onChange={handleChange}
          placeholder="Address"
        />
        <textarea
          name="bio"
          value={profile.bio}
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