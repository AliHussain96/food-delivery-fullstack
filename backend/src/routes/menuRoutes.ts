
import { Router } from "express";
import MenuItem from "../models/MenuItem";

import {
  getRestaurantMenu,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "../controllers/menuController";

import { protect } from "../middleware/authMiddleware";
import { requireAdmin } from "../middleware/adminMiddleware";
import { requireTrustedOrigin } from "../middleware/requireTrustedOrigin";

const router = Router();

// PUBLIC ROUTES
router.get("/", async (_req, res) => {
  try {
    const items = await MenuItem.find();

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    console.error("Fetch menu error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch menu items",
    });
  }
});

router.get(
  "/restaurants/:restaurantId/menu",
  getRestaurantMenu
);

// ADMIN-ONLY ROUTES
router.post(
  "/restaurants/:restaurantId/menu",
  protect,
  requireAdmin,
  requireTrustedOrigin,
  createMenuItem
);

router.patch(
  "/menu/:id",
  protect,
  requireAdmin,
  requireTrustedOrigin,
  updateMenuItem
);

router.delete(
  "/menu/:id",
  protect,
  requireAdmin,
  requireTrustedOrigin,
  deleteMenuItem
);

export default router;
