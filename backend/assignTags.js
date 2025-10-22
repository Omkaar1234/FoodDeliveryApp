// scripts/assignTags.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import FoodItem from "./models/FoodItem.js";

dotenv.config();

// Map of keywords to tag groups
const keywordTags = [
  { keywords: ["thali", "rice", "meal"], tags: ["REGULAR", "RICE", "THALI"] },
  { keywords: ["ice", "dessert", "sweet"], tags: ["SWEET", "DESSERT"] },
  { keywords: ["burger", "pizza", "fries", "sandwich"], tags: ["FAST FOOD", "COMFORT"] },
  { keywords: ["salad", "juice", "smoothie"], tags: ["FRESH", "COOL", "HEALTHY"] },
  { keywords: ["soup"], tags: ["LIGHT", "SOFT", "SOUP"] },
  { keywords: ["mint", "fruit"], tags: ["REFRESH", "FRUIT"] },
  { keywords: ["special", "fusion", "chef"], tags: ["FUSION", "CHEF SPECIAL", "EXPERIMENTAL"] }
];

const assignTags = (itemName = "", category = "") => {
  const text = `${itemName} ${category}`.toLowerCase();
  for (const map of keywordTags) {
    if (map.keywords.some((kw) => text.includes(kw))) {
      return map.tags;
    }
  }
  return ["REGULAR"];
};

const updateFoodTags = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const items = await FoodItem.find();
    console.log(`📦 Found ${items.length} food items.`);

    for (const item of items) {
      const newTags = assignTags(item.name, item.category);
      await FoodItem.updateOne({ _id: item._id }, { $set: { tags: newTags } });
      console.log(`🍽️ Updated "${item.name}" → ${newTags.join(", ")}`);
    }

    console.log("🎯 All food items updated with tags!");
    mongoose.disconnect();
  } catch (err) {
    console.error("❌ Error assigning tags:", err.message);
  }
};

updateFoodTags();
