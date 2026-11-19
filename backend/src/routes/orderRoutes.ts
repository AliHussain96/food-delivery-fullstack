
import { Router } from "express";

import {
  createOrder,
  getOrders,
  getOrderById,
} from "../controllers/orderController";

import { protect } from "../middleware/authMiddleware";
import { requireTrustedOrigin } from "../middleware/requireTrustedOrigin";

const router = Router();

// Place an order
router.post(
  "/",
  protect,
  requireTrustedOrigin,
  createOrder
);

// Get authenticated user's orders
router.get("/", protect, getOrders);

// Get a specific order owned by the authenticated user
router.get("/:id", protect, getOrderById);

export default router;
