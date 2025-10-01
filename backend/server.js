// server.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Routes
import authRoutes from "./routes/authRoutes.js";
import restaurantRoutes from "./routes/restaurantRoutes.js";
import restaurantOrdersRoutes from "./routes/restaurantOrderRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import userRoutes from "./routes/userRoutes.js"; // ✅ new import

dotenv.config();
const app = express();

// ------------------- MIDDLEWARES -------------------
// CORS setup for frontend (React dev server)
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
}));

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handle invalid JSON errors
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ success: false, error: "Invalid JSON" });
  }
  next();
});

// ------------------- API ROUTES -------------------
app.use("/api/auth", authRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/restaurant/orders", restaurantOrdersRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api", userRoutes); // ✅ this adds /api/profile

// ------------------- TEST ROUTE -------------------
app.get("/api/test", (req, res) => res.json({ success: true, message: "Backend is running" }));

// ------------------- SERVE REACT FRONTEND (PRODUCTION) -------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client/build", "index.html"));
  });
}

// ------------------- MONGODB CONNECTION -------------------
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/yumexpress";
const PORT = process.env.PORT || 5000;

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  });