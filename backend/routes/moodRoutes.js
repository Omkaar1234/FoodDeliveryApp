// ./routes/moodRoutes.js
import express from "express";
import FoodItem from "../models/FoodItem.js";
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

    // 1️⃣ Get mood prediction from AI
    const prediction = await predictMood(text);
    console.log("🎯 Raw prediction from AI:", prediction);

    let topMood = prediction?.emotion?.toUpperCase() || "NEUTRAL";
    let tagsToSearch = prediction?.tags || [];

    // 2️⃣ Fallback — detect mood by keywords if AI gives neutral
    if (topMood === "NEUTRAL" || !topMood) {
      const lowerText = text.toLowerCase();

      if (lowerText.includes("sad") || lowerText.includes("upset") || lowerText.includes("tired"))
        topMood = "SADNESS";
      else if (lowerText.includes("happy") || lowerText.includes("excited") || lowerText.includes("joy"))
        topMood = "JOY";
      else if (lowerText.includes("angry") || lowerText.includes("frustrated") || lowerText.includes("irritated"))
        topMood = "ANGER";
      else if (lowerText.includes("scared") || lowerText.includes("nervous") || lowerText.includes("worried"))
        topMood = "FEAR";
      else if (lowerText.includes("surprised") || lowerText.includes("amazed"))
        topMood = "SURPRISE";
      else
        topMood = "NEUTRAL";

      console.log(`🧠 Fallback mood detected as: ${topMood}`);
    }

    // 3️⃣ Define mood → food tag mapping (manual, reliable)
    const moodTagMap = {
      JOY: ["sweet", "ice-cream", "cold", "fruit", "dessert"],
      SADNESS: ["comfort", "fried", "cheesy", "heavy", "spicy"],
      ANGER: ["spicy", "strong-flavor", "crispy"],
      FEAR: ["light", "healthy", "soupy"],
      SURPRISE: ["unique", "fusion", "new"],
      NEUTRAL: ["regular", "simple", "veg", "balanced"],
    };

    // 4️⃣ If no AI tags, use fallback from map
    if (!Array.isArray(tagsToSearch) || tagsToSearch.length === 0) {
      tagsToSearch = moodTagMap[topMood] || ["regular"];
      console.log(`⚙️ Using fallback tags for ${topMood}: ${tagsToSearch.join(", ")}`);
    }

    // 5️⃣ Search in MongoDB for matching food items
    const regexTags = tagsToSearch.map((tag) => new RegExp(`^${tag}$`, "i"));

    const items = await FoodItem.find({
      tags: { $in: regexTags },
    }).limit(20);

    console.log(`🍽 Found ${items.length} items for mood "${topMood}"`);

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