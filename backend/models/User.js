import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "user" }, // 'user' or 'restaurant'
    phone: { type: String },
    address: { type: String },
    bio: { type: String }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;