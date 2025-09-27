import React, { useState } from "react";
import "../styles/Register.css";
import { registerUser, registerRestaurant } from "../services/authService";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    let response;
    try {
      if (role === "user") {
        response = await registerUser({ name, email, password });
      } else {
        response = await registerRestaurant({ name, email, password });
      }

      if (response.success) {
        setMessage("Registration successful! Redirecting to login...");
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else {
        setMessage(response.error);
      }
    } catch (err) {
      setMessage("Server error. Please try again.");
      console.error("Registration error:", err);
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit} className="register-form">
        <h1 className="register-title">Register</h1>

        <div className="input-group">
          <label>Name</label>
          <input
            type="text"
            placeholder="Enter Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label>Password</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>

        <div className="input-group">
          <label>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="user">User</option>
            <option value="restaurant">Restaurant</option>
          </select>
        </div>

        <button type="submit" className="btn-register">
          Register
        </button>
        <br />
        <p>
          Already have an account? <a href="/login">Login here</a>
        </p>
        {message && <p className="message">{message}</p>}
      </form>
    </div>
  );
}

export default Register;