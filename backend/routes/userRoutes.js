import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import User from "../models/User.js";
import Restaurant from "../models/Restaurant.js";

const router = express.Router();

/**
 * @route   GET /users/profile
 * @desc    Get logged-in account profile (User OR Restaurant)
 * @access  Private
 */
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    let account;

    if (req.user.role === "user") {
      account = await User.findById(req.user.id).select("-password");
    } else if (req.user.role === "restaurant") {
      account = await Restaurant.findById(req.user.id).select("-password");
    }

    if (!account) {
      return res.status(404).json({ success: false, error: "Profile not found" });
    }

    res.json({
      success: true,
      _id: account._id,
      name: account.name,
      email: account.email,
      role: req.user.role,
    });
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

/**
 * @route   PUT /users/profile
 * @desc    Update profile (User OR Restaurant)
 * @access  Private
 */
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { name, email } = req.body;

    let account;
    if (req.user.role === "user") {
      account = await User.findByIdAndUpdate(
        req.user.id,
        { name, email },
        { new: true }
      ).select("-password");
    } else if (req.user.role === "restaurant") {
      account = await Restaurant.findByIdAndUpdate(
        req.user.id,
        { name, email },
        { new: true }
      ).select("-password");
    }

    if (!account) {
      return res.status(404).json({ success: false, error: "Profile not found" });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      account,
    });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

export default router;