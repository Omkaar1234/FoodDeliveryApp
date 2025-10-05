import express from "express";
import Restaurant from "../models/Restaurant.js";
import { authMiddleware, requireRole } from "../middleware/auth.js";
import upload from '../middleware/cloudinaryUpload.js'; // ✅ Cloudinary Multer Configuration

const router = express.Router();

// ✅ Get list of all restaurants (public, for users)
router.get("/", async (req, res) => {
  try {
    const restaurants = await Restaurant.find().select("-password");
    res.json(restaurants);
  } catch (err) {
    console.error("GET /restaurants error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Get restaurant profile + menu (restaurant only)
router.get("/me", authMiddleware, requireRole("restaurant"), async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.user.id).select("-password");
    if (!restaurant) return res.status(404).json({ error: "Restaurant not found" });
    res.json(restaurant);
  } catch (err) {
    console.error("GET /me error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Update restaurant profile
router.put("/me", authMiddleware, requireRole("restaurant"), async (req, res) => {
  try {
    const updated = await Restaurant.findByIdAndUpdate(
      req.user.id,
      {
        name: req.body.name,
        address: req.body.address,
        contact: req.body.contact, // explicitly include contact
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!updated) return res.status(404).json({ error: "Restaurant not found" });
    res.json(updated);
  } catch (err) {
    console.error("PUT /me error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ------------------- Upload Restaurant Image (Experiment 9) -------------------
router.put("/me/image", authMiddleware, requireRole("restaurant"), 
  upload.single('restaurantImage'), // Multer middleware captures the file
  async (req, res) => {
    try {
      // Multer/Cloudinary saves the file and adds its details to req.file
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided." });
      }

      // req.file.path contains the permanent Cloudinary URL
      const imageUrl = req.file.path; 

      const updated = await Restaurant.findByIdAndUpdate(
        req.user.id,
        { image: imageUrl }, // Save the permanent Cloudinary URL
        { new: true, runValidators: true }
      ).select("-password");

      if (!updated) {
        return res.status(404).json({ error: "Restaurant not found" });
      }
      
      res.json({ 
        message: "Image uploaded successfully", 
        image: updated.image // Return the new URL to the frontend
      });

    } catch (err) {
      console.error("PUT /me/image error:", err);
      // Check if the error is due to Multer limits (like file size)
      res.status(500).json({ error: err.message || "Server error during file upload" });
    }
});


// ✅ Add menu item
router.post("/me/menu", authMiddleware, requireRole("restaurant"), async (req, res) => {
  try {
    const { name, price } = req.body;
    if (!name || price === undefined) return res.status(400).json({ error: "Name & price required" });

    const restaurant = await Restaurant.findById(req.user.id);
    if (!restaurant) return res.status(404).json({ error: "Restaurant not found" });

    const newItem = { name, price };
    restaurant.menu.push(newItem);
    await restaurant.save();

    res.status(201).json(restaurant.menu[restaurant.menu.length - 1]);
  } catch (err) {
    console.error("POST /me/menu error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Update menu item
router.put("/me/menu/:itemId", authMiddleware, requireRole("restaurant"), async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.user.id);
    if (!restaurant) return res.status(404).json({ error: "Restaurant not found" });

    const item = restaurant.menu.id(req.params.itemId);
    if (!item) return res.status(404).json({ error: "Menu item not found" });

    item.name = req.body.name || item.name;
    item.price = req.body.price !== undefined ? req.body.price : item.price;
    await restaurant.save();

    res.json(item);
  } catch (err) {
    console.error("PUT /me/menu/:itemId error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Delete menu item
router.delete("/me/menu/:itemId", authMiddleware, requireRole("restaurant"), async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.user.id);
    if (!restaurant) return res.status(404).json({ error: "Restaurant not found" });

    const item = restaurant.menu.id(req.params.itemId);
    if (!item) return res.status(404).json({ error: "Menu item not found" });

    item.remove();
    await restaurant.save();

    res.json({ message: "Item deleted", id: req.params.itemId });
  } catch (err) {
    console.error("DELETE /me/menu/:itemId error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get single restaurant by ID (for menu view)
router.get("/:id", async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).select("-password");
    if (!restaurant) return res.status(404).json({ error: "Restaurant not found" });
    res.json(restaurant);  // includes menu
  } catch (err) {
    console.error("GET /restaurants/:id error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;