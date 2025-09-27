// App.js
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import UserProfile from "./pages/UserProfile";
import RestaurantDashboard from "./pages/RestaurantDashboard"; // For restaurant owner
import UserRestaurantDetails from "./pages/UserRestaurantDetails"; // For user view of a restaurant
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const getRole = () => localStorage.getItem("role"); // 'user' or 'restaurant'

  return (
    <Router>
      <Routes>
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* User routes */}
        <Route
          path="/user/dashboard"
          element={
            <ProtectedRoute>
              {getRole() === "user" ? <UserDashboard /> : <Navigate to="/restaurant/dashboard" />}
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/profile"
          element={
            <ProtectedRoute>
              {getRole() === "user" ? <UserProfile /> : <Navigate to="/restaurant/dashboard" />}
            </ProtectedRoute>
          }
        />

        {/* User view of restaurant details */}
        <Route
          path="/restaurant/:id"
          element={
            <ProtectedRoute>
              {getRole() === "user" ? <UserRestaurantDetails /> : <Navigate to="/restaurant/dashboard" />}
            </ProtectedRoute>
          }
        />

        {/* Restaurant owner routes */}
        <Route
          path="/restaurant/dashboard"
          element={
            <ProtectedRoute>
              {getRole() === "restaurant" ? <RestaurantDashboard /> : <Navigate to="/user/dashboard" />}
            </ProtectedRoute>
          }
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
