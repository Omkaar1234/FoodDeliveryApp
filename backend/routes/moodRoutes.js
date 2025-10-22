// ./routes/moodRoutes.js
import express from "express";
import mongoose from "mongoose";
import FoodItem from "../models/FoodItem.js"; // Must map to 'fooditems' collection
import { predictMood } from "../utils/classifyMood.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// ---------------- AI-Based Food Filter ----------------
// POST /api/ai/filter
router.post("/filter", async (req, res) => {
  try {
    const { text } = req.body;

    console.log(`✅ /api/ai/filter request received with text: "${text}"`);

    if (!text || typeof text !== "string") {
      return res.status(400).json({
        success: false,
        error: "Valid text is required for AI mood analysis.",
      });
    }

    // 1️⃣ Get mood prediction from Hugging Face
    const prediction = await predictMood(text);
    console.log("🎯 Raw prediction from AI:", prediction);

    const topMood = prediction?.emotion || "NEUTRAL";
    let tagsToSearch = prediction?.tags || [];

    // Safety check — if nothing found, fallback
    if (!Array.isArray(tagsToSearch) || tagsToSearch.length === 0) {
      console.log("⚠️ No tags returned by AI — using fallback tag: 'regular'");
      tagsToSearch = ["regular"];
    }

    // 2️⃣ Prepare case-insensitive regex tags for MongoDB
    const regexTags = tagsToSearch.map(
      (tag) => new RegExp(`^${tag}$`, "i") // case-insensitive
    );

    console.log(`🔍 Searching MongoDB for items with tags: ${tagsToSearch.join(", ")}`);

    // 3️⃣ Query MongoDB 'fooditems' collection
    const items = await FoodItem.find({
      tags: { $in: regexTags },
    }).limit(20);

    if (!items || items.length === 0) {
      console.log("⚠️ No matching items found in database for tags:", tagsToSearch);
      return res.status(200).json({
        success: true,
        mood: topMood,
        items: [],
      });
    }

    // 4️⃣ Return response
    res.status(200).json({
      success: true,
      mood: topMood,
      items,
    });
  } catch (err) {
    console.error("❌ AI filter route failed:", err);
    res.status(500).json({
      success: false,
      error: "AI-based food filter failed. Check Hugging Face or MongoDB connection.",
    });
  }
});

export default router;

// ------------------- Auth Middleware -------------------
export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, error: "Authorization token missing" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      role: decoded.role ? decoded.role.toLowerCase() : null,
    };

    next();
  } catch (err) {
    console.error("Invalid or expired token:", err.message);
    res.status(401).json({ success: false, error: "Invalid or expired token" });
  }
};

// ------------------- Role Middleware -------------------
export const requireRole = (requiredRole) => (req, res, next) => {
  if (!req.user?.role) {
    return res.status(401).json({ success: false, error: "User not authenticated" });
  }

  if (req.user.role !== requiredRole.toLowerCase()) {
    return res.status(403).json({ success: false, error: "Access denied: insufficient permissions" });
  }

  next();
};