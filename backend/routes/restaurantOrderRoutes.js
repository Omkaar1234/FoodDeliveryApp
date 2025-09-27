// routes/restaurantOrderRoutes.js
import express from "express";
import Order from "../models/Order.js";
import { authMiddleware, requireRole } from "../middleware/auth.js";

const router = express.Router();

// ---------------- GET all orders for this restaurant ----------------
router.get("/", authMiddleware, requireRole("restaurant"), async (req, res) => {
  try {
    const orders = await Order.find({ restaurantId: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ---------------- UPDATE order status ----------------
router.put("/:orderId", authMiddleware, requireRole("restaurant"), async (req, res) => {
  try {
    const { status } = req.body;
    const validStatus = ["Pending", "Preparing", "Delivered", "Cancelled"];
    if (!validStatus.includes(status)) return res.status(400).json({ error: "Invalid status" });

    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });

    // Only the restaurant that owns the order can update
    if (order.restaurantId.toString() !== req.user.id)
      return res.status(403).json({ error: "Access denied" });

    order.status = status;
    await order.save();

    res.json({ message: "Order status updated", order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
