// ./utils/updateTags.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import FoodItem from "./models/FoodItem.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/yumexpress";

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
};

// 1️⃣ Map each food item to a unique mood and tag(s)
// ./utils/updateTags.js (foodMoodMapping portion)
const foodMoodMapping = [
  { name: "Vanilla Latte", mood: "sadness", tags: ["warm","coffee"] },
  { name: "Old Fashioned", mood: "neutral", tags: ["alcohol","classic"] },
  { name: "Jeera Rice", mood: "neutral", tags: ["rice","spicy"] },
  { name: "Aloo Gobi", mood: "neutral", tags: ["veg","spicy"] },
  { name: "Paneer Lababdar", mood: "joy", tags: ["veg","rich"] },
  { name: "Irish Coffee", mood: "sadness", tags: ["warm","coffee"] },
  { name: "Americano", mood: "sadness", tags: ["warm","coffee"] },
  { name: "Bhaji", mood: "neutral", tags: ["veg","spicy"] },
  { name: "Macchiato", mood: "sadness", tags: ["warm","coffee"] },
  { name: "Sev Puri", mood: "joy", tags: ["snack","chaat"] },
  { name: "Chocolate Brownie", mood: "joy", tags: ["sweet","dessert"] },
  { name: "Mix Veg Curry", mood: "neutral", tags: ["veg","curry"] },
  { name: "Misal Pav", mood: "surprise", tags: ["spicy","snack"] },
  { name: "Aloo Mutter", mood: "neutral", tags: ["veg","curry"] },
  { name: "Espresso", mood: "sadness", tags: ["warm","coffee"] },
  { name: "Mocha", mood: "sadness", tags: ["sweet","coffee"] },
  { name: "Whiskey Sour", mood: "neutral", tags: ["alcohol","classic"] },
  { name: "Veg Lasagna", mood: "joy", tags: ["veg","cheesy"] },
  { name: "Veg Pulao", mood: "neutral", tags: ["rice","spicy"] },
  { name: "Veg Spring Rolls", mood: "joy", tags: ["veg","snack"] },
  { name: "Samosa", mood: "joy", tags: ["snack","spicy"] },
  { name: "Cold Coffee", mood: "sadness", tags: ["cold","coffee"] },
  { name: "Margarita", mood: "neutral", tags: ["alcohol","cocktail"] },
  { name: "Momos (Veg)", mood: "joy", tags: ["veg","snack"] },
  { name: "Chicken Nuggets", mood: "joy", tags: ["snack","fried"] },
  { name: "Tomato Soup", mood: "fear", tags: ["soup","light"] },
  { name: "Paneer Tikka Roll", mood: "joy", tags: ["veg","grilled"] },
  { name: "Sweet Lassi", mood: "joy", tags: ["sweet","drink"] },
  { name: "Dahi Puri", mood: "joy", tags: ["snack","chaat"] },
  { name: "Vada Pav", mood: "joy", tags: ["snack","spicy"] },
  { name: "Corn Chaat", mood: "joy", tags: ["snack","fresh"] },
  { name: "Paneer Burger", mood: "joy", tags: ["veg","fast food"] },
  { name: "Pizza Garlic Knots", mood: "joy", tags: ["fast food","bread"] },
  { name: "Rum Punch", mood: "neutral", tags: ["alcohol","cocktail"] },
  { name: "Vegetable Soup", mood: "fear", tags: ["soup","light"] },
  { name: "Margherita Pizza", mood: "joy", tags: ["fast food","cheese"] },
  { name: "Butter Naan", mood: "joy", tags: ["bread","rich"] },
  { name: "Pani Puri", mood: "joy", tags: ["snack","chaat"] },
  { name: "Mojito", mood: "neutral", tags: ["alcohol","cocktail"] },
  { name: "Pav", mood: "neutral", tags: ["bread","snack"] },
  { name: "Chocolate Shake", mood: "joy", tags: ["sweet","dessert"] },
  { name: "Cold Drink", mood: "joy", tags: ["cold","refresh"] },
  { name: "Cappuccino", mood: "sadness", tags: ["warm","coffee"] },
  { name: "Pina Colada", mood: "neutral", tags: ["alcohol","cocktail"] },
  { name: "French Fries", mood: "joy", tags: ["snack","fried"] },
  { name: "Veg Nuggets", mood: "joy", tags: ["snack","fried"] },
  { name: "Veg Biryani", mood: "neutral", tags: ["rice","spicy"] },
  { name: "Paneer Chaat", mood: "joy", tags: ["veg","chaat"] },
  { name: "Veg Wrap", mood: "joy", tags: ["veg","snack"] },
  { name: "Fries", mood: "joy", tags: ["snack","fried"] },
  { name: "Roti/Naan", mood: "neutral", tags: ["bread","basic"] },
  { name: "Farmhouse Pizza", mood: "joy", tags: ["fast food","cheese"] },
  { name: "Aloo Tikki", mood: "joy", tags: ["snack","spicy"] },
  { name: "Soft Drink", mood: "joy", tags: ["cold","refresh"] },
  { name: "Veg Manchurian", mood: "joy", tags: ["veg","fried"] },
  { name: "Veggie Burger", mood: "joy", tags: ["veg","fast food"] },
  { name: "Bhel Puri", mood: "joy", tags: ["snack","chaat"] },
  { name: "Paneer Wrap", mood: "joy", tags: ["veg","snack"] },
  { name: "Veg Fried Rice", mood: "neutral", tags: ["rice","fried"] },
  { name: "Veggie Delight Pizza", mood: "joy", tags: ["fast food","cheese"] },
  { name: "Dal Tadka", mood: "neutral", tags: ["veg","curry"] },
  { name: "Veg Burger", mood: "joy", tags: ["veg","fast food"] },
  { name: "Dal Fry", mood: "neutral", tags: ["veg","curry"] },
  { name: "Garlic Bread", mood: "joy", tags: ["bread","snack"] },
  { name: "Paneer Chilli", mood: "joy", tags: ["veg","spicy"] },
  { name: "Mixed Veg Salad", mood: "anger", tags: ["fresh","salad"] },
  { name: "Beer Bucket", mood: "neutral", tags: ["alcohol","beer"] },
  { name: "Veg Pizza Slice", mood: "joy", tags: ["fast food","cheese"] },
  { name: "Cheese Burger", mood: "joy", tags: ["fast food","cheese"] },
  { name: "Paneer Tikka", mood: "joy", tags: ["veg","grilled"] },
  { name: "Onion Rings", mood: "joy", tags: ["snack","fried"] },
  { name: "Dal Makhani", mood: "neutral", tags: ["veg","curry"] },
  { name: "Chana Jor Garam", mood: "joy", tags: ["snack","spicy"] },
  { name: "Spring Rolls", mood: "joy", tags: ["snack","fried"] },
  { name: "Latte", mood: "sadness", tags: ["warm","coffee"] },
  { name: "Paneer Butter Masala", mood: "joy", tags: ["veg","rich"] },
  { name: "Flat White", mood: "sadness", tags: ["warm","coffee"] },
  { name: "Masala Corn", mood: "joy", tags: ["snack","spicy"] },
  { name: "Cheese Pizza Slice", mood: "joy", tags: ["fast food","cheese"] },
  { name: "Bikini Pav", mood: "joy", tags: ["snack","bread"] },
  { name: "Cheese Sandwich", mood: "joy", tags: ["snack","cheese"] },
  { name: "Veg Soup", mood: "fear", tags: ["soup","light"] },
  { name: "Bloody Mary", mood: "neutral", tags: ["alcohol","cocktail"] },
  { name: "Veg Hakka Noodles", mood: "joy", tags: ["veg","fried"] },
  { name: "Pasta Arrabiata", mood: "joy", tags: ["veg","spicy"] },
  { name: "Cold Brew", mood: "sadness", tags: ["cold","coffee"] },
  { name: "Masala Pav", mood: "joy", tags: ["snack","spicy"] },
  { name: "Tequila Sunrise", mood: "neutral", tags: ["alcohol","cocktail"] },
  { name: "Dahi Vada", mood: "joy", tags: ["snack","chaat"] },
  { name: "Pav Bhaji", mood: "joy", tags: ["snack","spicy"] },
  { name: "Ragda Pattice", mood: "joy", tags: ["snack","spicy"] },
  { name: "Gin & Tonic", mood: "neutral", tags: ["alcohol","cocktail"] },
  { name: "Samosa Chaat", mood: "joy", tags: ["snack","chaat"] },
  { name: "Cheese Burst Pizza", mood: "joy", tags: ["fast food","cheese"] },
  { name: "Chole Masala", mood: "neutral", tags: ["veg","curry"] },
  { name: "Pasta Alfredo", mood: "joy", tags: ["veg","creamy"] },
  { name: "Dal Takda", mood: "neutral", tags: ["veg","curry"] },
  { name: "Bloody Marry", mood: "neutral", tags: ["alcohol","cocktail"] },
];

// 3️⃣ Update all food items using bulkWrite
const updateTags = async () => {
  try {
    const operations = foodMoodMapping.map((item) => ({
      updateOne: {
        filter: { name: item.name },
        update: { $set: { mood: item.mood, tags: item.tags } },
        upsert: false, // don't create if not exists
      },
    }));

    const result = await FoodItem.bulkWrite(operations);
    console.log("✅ All items updated successfully:", result.modifiedCount, "items modified");
  } catch (err) {
    console.error("❌ Failed to update items:", err);
  }
};

// 4️⃣ Run script
const run = async () => {
  await connectDB();
  await updateTags();
  await mongoose.disconnect();
  console.log("✅ Done");
};

run();