import jwt from "jsonwebtoken";

// ------------------- Auth Middleware -------------------
// Verifies JWT and attaches user info to req.user
export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, error: "Authorization token missing" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      role: decoded.role ? decoded.role.toLowerCase() : null, // normalize role
    };

    next();
  } catch (err) {
    console.error("Invalid or expired token:", err);
    return res.status(401).json({ success: false, error: "Invalid or expired token" });
  }
};

// ------------------- Role Middleware -------------------
// Ensures the user has the required role
export const requireRole = (requiredRole) => (req, res, next) => {
  if (!req.user || !req.user.role) {
    return res.status(401).json({ success: false, error: "User not authenticated" });
  }

  if (req.user.role.toLowerCase() !== requiredRole.toLowerCase()) {
    return res.status(403).json({ success: false, error: "Access denied: insufficient permissions" });
  }

  next();
};