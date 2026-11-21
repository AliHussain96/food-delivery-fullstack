
import { Router } from "express";

import { protect } from "../middleware/authMiddleware";
import { requireTrustedOrigin } from "../middleware/requireTrustedOrigin";
import { checkDeliveryAvailability } from "../controllers/deliveryController";

const router = Router();

router.post(
  "/check",
  protect,
  requireTrustedOrigin,
  checkDeliveryAvailability
);

export default router;
