// routes/authRoutes.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Restaurant from "../models/Restaurant.js";
import { authMiddleware, requireRole } from "../middleware/auth.js";

const router = express.Router();

// ------------------- Registration -------------------
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, location, menu } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, error: "All fields are required" });
    }

    let account;

    if (role.toLowerCase() === "user") {
      if (await User.findOne({ email })) {
        return res.status(400).json({ success: false, error: "Email already exists" });
      }
      account = new User({
        name,
        email,
        password: await bcrypt.hash(password, 10),
        role: "user",
      });
    } else if (role.toLowerCase() === "restaurant") {
      if (await Restaurant.findOne({ email })) {
        return res.status(400).json({ success: false, error: "Email already exists" });
      }
      account = new Restaurant({
        name,
        email,
        password: await bcrypt.hash(password, 10),
        role: "restaurant",
        address: location || "",
        menu: Array.isArray(menu) ? menu : [],
      });
    } else {
      return res.status(400).json({ success: false, error: "Invalid role. Allowed: user or restaurant" });
    }

    await account.save();

    res.status(201).json({
      success: true,
      message: `${account.role} registered successfully`,
      id: account._id,
      name: account.name,
      email: account.email,
      role: account.role,
    });
  } catch (err) {
    console.error("POST /register error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// ------------------- Login -------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required" });
    }

    // Try User first, then Restaurant
    let account = await User.findOne({ email });
    let role = "user";

    if (!account) {
      account = await Restaurant.findOne({ email });
      role = "restaurant";
    }

    if (!account) return res.status(400).json({ success: false, error: "Account not found" });

    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) return res.status(400).json({ success: false, error: "Invalid password" });

    role = account.role; // trust DB role

    const token = jwt.sign({ id: account._id, role }, process.env.JWT_SECRET, { expiresIn: "2h" });

    res.json({
      success: true,
      message: "Login successful",
      token,
      role,
      accountId: account._id,
    });
  } catch (err) {
    console.error("POST /login error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// ------------------- Profile -------------------
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const Model = req.user.role === "user" ? User : Restaurant;
    const account = await Model.findById(req.user.id).select("-password");

    if (!account) return res.status(404).json({ success: false, error: "Account not found" });

    // ✅ Flatten response so frontend can directly access name/email/_id
    res.json({
      success: true,
      _id: account._id,
      name: account.name,
      email: account.email,
      role: account.role,
      address: account.address || "",
      menu: account.menu || [],
    });
  } catch (err) {
    console.error("GET /profile error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// ------------------- Update Profile -------------------
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const Model = req.user.role === "user" ? User : Restaurant;
    const updated = await Model.findByIdAndUpdate(req.user.id, req.body, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updated) return res.status(404).json({ success: false, error: "Account not found" });

    res.json({
      success: true,
      message: "Profile updated successfully",
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      address: updated.address || "",
      menu: updated.menu || [],
    });
  } catch (err) {
    console.error("PUT /profile error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// ------------------- Dashboards -------------------
router.get("/dashboard/user", authMiddleware, requireRole("user"), (req, res) => {
  res.json({ success: true, message: "Welcome to the User Dashboard", userId: req.user.id });
});

router.get("/dashboard/restaurant", authMiddleware, requireRole("restaurant"), (req, res) => {
  res.json({ success: true, message: "Welcome to the Restaurant Dashboard", restaurantId: req.user.id });
});

export default router;