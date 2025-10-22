import mongoose from "mongoose";

const foodItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true }, // e.g., Pizza, Burger
  description: { type: String },
  image: { type: String }, // store image URL
  mood: { type: String, default: "" }, // new field
  tags: { type: [String], default: [] },
}, { collection: "fooditems" }); // ✅ ensures it uses the correct MongoDB collection
// otherwise Mongoose might pluralize the name to "fooditemses"

const FoodItem = mongoose.model("FoodItem", foodItemSchema);
export default FoodItem;