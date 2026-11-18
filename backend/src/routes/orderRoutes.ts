
import { Router } from "express";

import {
  createOrder,
  getOrders,
} from "../controllers/orderController";

import { protect } from "../middleware/authMiddleware";
import { requireTrustedOrigin } from "../middleware/requireTrustedOrigin";

const router = Router();

// Only authenticated customers can place orders
router.post("/", protect, createOrder);

// Only authenticated customers can view their orders
router.get("/", protect, getOrders);

router.post("/", requireTrustedOrigin, protect, createOrder);
router.get("/", protect, getOrders);

export default router;
