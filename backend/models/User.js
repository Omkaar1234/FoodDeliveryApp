import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["user"],
      default: "user",
      lowercase: true,
      trim: true,
    },
  },
  { timestamps: true } // automatically add createdAt and updatedAt
);

const User = mongoose.model("User", userSchema);
export default User;