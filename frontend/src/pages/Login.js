import React, { useState } from "react";
import "../styles/Login.css";
import { loginUser } from "../services/authService";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await loginUser(email, password);

      // ✅ normalize response
      const token = response.token || response?.data?.token;
      const role = response.role || response?.user?.role;
      const accountId = response.accountId || response?.user?._id;

      if (token && role) {
        // Save in localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        localStorage.setItem("accountId", accountId);

        // Navigate based on role
        if (role === "restaurant") {
          navigate("/restaurant/dashboard");
        } else if (role === "user") {
          navigate("/user/dashboard");
        } else {
          setMessage("Invalid role. Please contact support.");
        }
      } else {
        setMessage(response.error || "Login failed. Check your credentials.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Server error. Please try again later.");
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2 className="login-title">Login</h2>

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

        <p id="para">
          Don’t have an account? <a href="/register">Register here</a>
        </p>

        <button type="submit" className="btn-login">
          Login
        </button>

        {message && <p className="message">{message}</p>}
      </form>
    </div>
  );
}

export default Login;