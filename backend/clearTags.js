// scripts/clearTags.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import FoodItem from "./models/FoodItem.js";

dotenv.config();

const clearAllTags = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const result = await FoodItem.updateMany({}, { $set: { tags: [] } });
    console.log(`🧹 Cleared tags for ${result.modifiedCount} food items.`);

    mongoose.disconnect();
  } catch (err) {
    console.error("❌ Error clearing tags:", err.message);
  }
};

clearAllTags();