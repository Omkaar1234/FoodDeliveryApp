import mongoose from "mongoose";

const foodItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true }, // e.g., Pizza, Burger
  description: { type: String },
  image: { type: String }, // store image URL
});

const FoodItem = mongoose.model("FoodItem", foodItemSchema);
export default FoodItem;
