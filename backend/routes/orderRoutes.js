// routes/orderRoutes.js
import express from "express";
import Order from "../models/Order.js";
import { authMiddleware, requireRole } from "../middleware/auth.js";

const router = express.Router();

// Allowed status transitions
const validStatusTransitions = {
  Pending: ["Accepted", "Cancelled"],
  Accepted: ["Preparing", "Cancelled"],
  Preparing: ["Out for Delivery"],
  "Out for Delivery": ["Delivered"],
  Delivered: [],
  Cancelled: [],
};

// -------------------- Place a new order (User only) --------------------
router.post("/", authMiddleware, requireRole("user"), async (req, res) => {
  try {
    const { restaurantId, items, total, deliveryAddress } = req.body;
    if (!restaurantId || !items?.length || !total || !deliveryAddress) {
      return res.status(400).json({ error: "All fields are required" });
    }

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

// -------------------- Get all orders for logged-in restaurant --------------------
router.get(
  "/restaurant",
  authMiddleware,
  requireRole("restaurant"),
  async (req, res) => {
    try {
      const orders = await Order.find({ restaurantId: req.user.id })
        .populate("userId", "name email contact address") // full user info
        .sort({ createdAt: -1 });

      res.json(orders);
    } catch (err) {
      console.error("GET /orders/restaurant error:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// -------------------- Get all orders for logged-in user --------------------

router.get("/user", authMiddleware, requireRole("user"), async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .populate("restaurantId", "name")
      .sort({ createdAt: -1 });

    const ordersWithName = orders.map((o) => ({
      ...o._doc,
      // ✅ FIX: Safely access the restaurant name using optional chaining or a ternary operator
      restaurantName: o.restaurantId ? o.restaurantId.name : "Deleted Restaurant",
    }));

    res.json(ordersWithName);
  } catch (err) {
    console.error("GET /orders/user error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// -------------------- Update order status (Restaurant only) --------------------
router.put(
  "/:orderId/status",
  authMiddleware,
  requireRole("restaurant"),
  async (req, res) => {
    try {
      const { status } = req.body;
      const order = await Order.findById(req.params.orderId);

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      // Validate allowed status transition
      if (!validStatusTransitions[order.status].includes(status)) {
        return res.status(400).json({ error: "Invalid status transition" });
      }

      order.status = status;
      await order.save();

      // Populate user info before returning
      await order.populate("userId", "name email contact address");

      res.json({ message: "Order status updated", order });
    } catch (err) {
      console.error("PUT /orders/:orderId/status error:", err);
      res
        .status(500)
        .json({ error: "Server error while updating order status" });
    }
  }
);

export default router;