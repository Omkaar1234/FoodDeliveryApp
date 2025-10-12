import mongoose from "mongoose";

// Subdocument schema for menu items
const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    mood: { type: String, default: "" }, // <-- added field for mood classification
  },
  { _id: true } // Mongoose generates _id for each menu item
);

// Main restaurant schema
const restaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    contact: { type: String },
    role: {
      type: String,
      enum: ["restaurant"],
      default: "restaurant",
      lowercase: true,
      trim: true,
    },
    address: { type: String, trim: true },
    image: { type: String, default: "" }, // restaurant image URL
    menu: { type: [menuItemSchema], default: [] }, // array of menu items
  },
  { timestamps: true }
);

const Restaurant = mongoose.model("Restaurant", restaurantSchema);
export default Restaurant;