import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Restaurant from "../models/Restaurant.js";

const router = express.Router();

// ------------------- JWT Middleware -------------------
export const authMiddleware = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// ------------------- Role Middleware -------------------
export const requireRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) return res.status(403).json({ error: "Access denied" });
    next();
  };
};

// ------------------- Registration -------------------
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, location, menu } = req.body;
    if (!name || !email || !password || !role)
      return res.status(400).json({ error: "All fields are required" });

    const hashedPassword = await bcrypt.hash(password, 10);
    let account;

    if (role === "user") {
      if (await User.findOne({ email })) return res.status(400).json({ error: "Email already exists" });
      account = new User({ name, email, password: hashedPassword });
      await account.save();
    } else if (role === "restaurant") {
      if (await Restaurant.findOne({ email })) return res.status(400).json({ error: "Email already exists" });
      account = new Restaurant({
        name,
        email,
        password: hashedPassword,
        location: location || "",
        menu: Array.isArray(menu) ? menu : [],
      });
      await account.save();
    } else {
      return res.status(400).json({ error: "Invalid role" });
    }

    res.status(201).json({
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} registered successfully`,
      account: { id: account._id, name: account.name, email: account.email, role },
    });
  } catch (err) {
    console.error("POST /register error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ------------------- Login -------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

    let account = await User.findOne({ email });
    let role = "user";

    if (!account) {
      account = await Restaurant.findOne({ email });
      role = "restaurant";
    }

    if (!account) return res.status(400).json({ error: "Account not found" });

    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid password" });

    const token = jwt.sign({ id: account._id, role }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ message: "Login successful", role, token });
  } catch (err) {
    console.error("POST /login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ------------------- Profile -------------------
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const Model = req.user.role === "user" ? User : Restaurant;
    const account = await Model.findById(req.user.id).select("-password");
    if (!account) return res.status(404).json({ error: "Account not found" });

    res.json({ profile: account });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const Model = req.user.role === "user" ? User : Restaurant;
    const { name, phone, address, bio, location, menu } = req.body;

    const updated = await Model.findByIdAndUpdate(
      req.user.id,
      { name, phone, address, bio, location, menu },
      { new: true }
    ).select("-password");

    if (!updated) return res.status(404).json({ error: "Account not found" });

    res.json({ message: "Profile updated successfully", profile: updated });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ------------------- Dashboards -------------------
router.get("/dashboard/user", authMiddleware, requireRole("user"), (req, res) => {
  res.json({ message: "Welcome to the User Dashboard", userId: req.user.id });
});

router.get("/dashboard/restaurant", authMiddleware, requireRole("restaurant"), (req, res) => {
  res.json({ message: "Welcome to the Restaurant Dashboard", restaurantId: req.user.id });
});

export default router;