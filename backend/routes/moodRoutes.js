import express from "express";
import FoodItem from "../models/FoodItem.js";
import { predictMood } from "../utils/classifyMood.js"; // your AI code

const router = express.Router();

// ---------------- AI-Based Food Filter ----------------
// POST /api/ai/filter
router.post("/filter", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Valid text is required for AI search" });
    }

    // Predict mood for the input text
    const prediction = await predictMood(text);
    if (!prediction || prediction.length === 0) {
      return res.status(200).json({ items: [] });
    }

    // Take the top predicted mood label
    const topMood = prediction[0].label.toUpperCase();

    // Fetch food items with that mood
    const items = await FoodItem.find({ mood: topMood });

    res.json({ mood: topMood, items });
  } catch (err) {
    console.error("AI search error:", err);
    res.status(500).json({ error: "AI-based search failed" });
  }
});

export default router;