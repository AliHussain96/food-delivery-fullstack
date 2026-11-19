
import { Router } from "express";

import {
  getRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
} from "../controllers/restaurantController";

import { protect } from "../middleware/authMiddleware";
import { requireAdmin } from "../middleware/adminMiddleware";
import { requireTrustedOrigin } from "../middleware/requireTrustedOrigin";

const router = Router();

// PUBLIC ROUTES
router.get("/", getRestaurants);
router.get("/:id", getRestaurantById);

// ADMIN-ONLY ROUTES
router.post(
  "/",
  protect,
  requireAdmin,
  requireTrustedOrigin,
  createRestaurant
);

router.patch(
  "/:id",
  protect,
  requireAdmin,
  requireTrustedOrigin,
  updateRestaurant
);

router.delete(
  "/:id",
  protect,
  requireAdmin,
  requireTrustedOrigin,
  deleteRestaurant
);

export default router;
