import mongoose from "mongoose";

// ---------------- Menu Item Subdocument Schema ----------------
const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: true }
);

// ---------------- Main Restaurant Schema ----------------
const restaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    type: { type: String, default: "Restaurant", trim: true },
    address: { type: String, trim: true },
    contact: { type: String, trim: true },
    photo: { type: String, default: "/default-restaurant.jpg" },
    description: { type: String, trim: true },
    menu: {
      type: [menuItemSchema],
      default: [], // ✅ Ensure menu always exists as an array
    },
  },
  { timestamps: true }
);

// ---------------- Middleware to ensure price is Number ----------------
restaurantSchema.pre("save", function (next) {
  if (this.menu && this.menu.length) {
    this.menu.forEach(item => {
      item.price = Number(item.price);
    });
  }
  next();
});

export default mongoose.model("Restaurant", restaurantSchema);