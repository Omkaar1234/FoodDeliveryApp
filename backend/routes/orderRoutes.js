import express from "express";
import Order from "../models/Order.js";
import { authMiddleware, requireRole } from "../middleware/auth.js";

const router = express.Router();

// ✅ Place a new order (User only)
router.post("/", authMiddleware, requireRole("user"), async (req, res) => {
  try {
    const { restaurantId, items, total, deliveryAddress } = req.body;
    if (!restaurantId || !items || !items.length || !total || !deliveryAddress)
      return res.status(400).json({ error: "All fields are required" });

    const order = new Order({
      userId: req.user.id,
      restaurantId,
      items,
      total,
      deliveryAddress,
      status: "Pending",
    });

    await order.save();
    res.status(201).json({ message: "Order placed successfully", order });
  } catch (err) {
    console.error("POST /orders error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Get all orders for logged-in restaurant
router.get("/restaurant", authMiddleware, requireRole("restaurant"), async (req, res) => {
  try {
    const orders = await Order.find({ restaurantId: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("GET /orders/restaurant error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Get all orders for logged-in user
router.get("/user", authMiddleware, requireRole("user"), async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("GET /orders/user error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Update order status (Restaurant only)
router.put("/:id/status", authMiddleware, requireRole("restaurant"), async (req, res) => {
  try {
    const { status } = req.body;
    const validStatus = ["Pending", "Preparing", "Delivered", "Cancelled"];
    if (!validStatus.includes(status)) return res.status(400).json({ error: "Invalid status" });

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    if (order.restaurantId.toString() !== req.user.id)
      return res.status(403).json({ error: "Access denied" });

    order.status = status;
    await order.save();

    res.json({ message: "Order status updated", order });
  } catch (err) {
    console.error("PUT /orders/:id/status error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;