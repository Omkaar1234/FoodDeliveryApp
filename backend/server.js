import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

// Routes
import authRoutes from "./routes/authRoutes.js";
import restaurantRoutes from "./routes/restaurantRoutes.js";
import restaurantOrdersRoutes from "./routes/restaurantOrderRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

dotenv.config();
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);                     // Auth routes (register/login/profile)
app.use("/api/restaurants", restaurantRoutes);       // Restaurant CRUD & menu
app.use("/api/restaurant/orders", restaurantOrdersRoutes); // Restaurant orders
app.use("/api/orders", orderRoutes);                 // User orders

// Test Route
app.get("/", (req, res) => res.send("✅ Backend is running"));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("✅ MongoDB connected");
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
})
.catch(err => {
  console.error("❌ MongoDB connection failed:", err);
  process.exit(1);
});

