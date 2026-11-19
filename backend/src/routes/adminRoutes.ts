
import { Router } from "express";

import { protect } from "../middleware/authMiddleware";
import { requireAdmin } from "../middleware/adminMiddleware";
import { requireTrustedOrigin } from "../middleware/requireTrustedOrigin";

import {
  getAdminOrders,
  updateOrderStatus,
} from "../controllers/adminOrderController";

const router = Router();

// All routes below require an authenticated admin
router.use(protect, requireAdmin);

router.get("/orders", getAdminOrders);

router.patch(
  "/orders/:id/status",
  requireTrustedOrigin,
  updateOrderStatus
);
export default router;
