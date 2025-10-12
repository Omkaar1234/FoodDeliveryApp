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
import userRoutes from "./routes/userRoutes.js";
import moodRoutes from "./routes/moodRoutes.js"; // AI mood filter route

dotenv.config();
const app = express();

// ------------------- MIDDLEWARES -------------------
app.use(
  cors({
    origin: [
      "http://localhost:3000", // local frontend
      "https://yumexpress.vercel.app", // deployed frontend
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handle invalid JSON
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
app.use("/api/users", userRoutes); // ✅ changed from "/api" to "/api/users"
app.use("/api/ai", moodRoutes);    // ✅ AI route stays here

// ------------------- SERVE FRONTEND (PRODUCTION) -------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// if (process.env.NODE_ENV === "production") {
//   const buildPath = path.join(__dirname, "client", "build");
//   app.use(express.static(buildPath));
//   app.get("*", (req, res) => {
//     res.sendFile(path.join(buildPath, "index.html"));
//   });
// }

// ------------------- DATABASE CONNECTION -------------------
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/yumexpress";
const PORT = process.env.PORT || 5000;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, "0.0.0.0", () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });
