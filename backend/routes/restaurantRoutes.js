import express from "express";
import Restaurant from "../models/Restaurant.js";
import { authMiddleware, requireRole } from "../middleware/auth.js";

const router = express.Router();

// GET all restaurants (public)
router.get("/", async (req, res) => {
  try {
    const restaurants = await Restaurant.find().select("-password -__v");
    res.json(restaurants);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET single restaurant (public)
router.get("/:id", async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).select("-password -__v");
    if (!restaurant) return res.status(404).json({ error: "Restaurant not found" });
    res.json(restaurant);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// UPDATE restaurant profile
router.put("/:id", authMiddleware, requireRole("restaurant"), async (req, res) => {
  try {
    if (req.user.id !== req.params.id)
      return res.status(403).json({ error: "Unauthorized" });

    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select("-password -__v");

    if (!updatedRestaurant) return res.status(404).json({ error: "Restaurant not found" });

    res.json({ message: "Restaurant updated successfully", restaurant: updatedRestaurant });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ADD menu item
router.post("/:id/menu", authMiddleware, requireRole("restaurant"), async (req, res) => {
  try {
    if (req.user.id !== req.params.id)
      return res.status(403).json({ error: "Unauthorized" });

    const { name, price } = req.body;
    if (!name || price === undefined || isNaN(price)) {
      return res.status(400).json({ error: "Valid name and price are required" });
    }

    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ error: "Restaurant not found" });

    const newItem = { name, price };
    restaurant.menu.push(newItem);
    await restaurant.save();

    res.status(201).json(restaurant.menu[restaurant.menu.length - 1]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// UPDATE menu item
router.put("/:id/menu/:itemId", authMiddleware, requireRole("restaurant"), async (req, res) => {
  try {
    if (req.user.id !== req.params.id)
      return res.status(403).json({ error: "Unauthorized" });

    const { name, price } = req.body;
    if (!name || price === undefined || isNaN(price)) {
      return res.status(400).json({ error: "Valid name and price are required" });
    }

    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ error: "Restaurant not found" });

    const menuItem = restaurant.menu.id(req.params.itemId);
    if (!menuItem) return res.status(404).json({ error: "Menu item not found" });

    menuItem.name = name;
    menuItem.price = price;

    await restaurant.save();
    res.json(menuItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE menu item
router.delete("/:id/menu/:itemId", authMiddleware, requireRole("restaurant"), async (req, res) => {
  try {
    if (req.user.id !== req.params.id)
      return res.status(403).json({ error: "Unauthorized" });

    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ error: "Restaurant not found" });

    const menuItem = restaurant.menu.id(req.params.itemId);
    if (!menuItem) return res.status(404).json({ error: "Menu item not found" });

    menuItem.remove();
    await restaurant.save();

    res.json({ message: "Menu item deleted successfully", menu: restaurant.menu });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;