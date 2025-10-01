import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: true } // Mongoose generates _id for each menu item
);

const restaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["restaurant"],
      default: "restaurant",
      lowercase: true,
      trim: true,
    },
    address: { type: String, trim: true },
    menu: { type: [menuItemSchema], default: [] },
  },
  { timestamps: true } // automatically add createdAt and updatedAt
);

const Restaurant = mongoose.model("Restaurant", restaurantSchema);
export default Restaurant;