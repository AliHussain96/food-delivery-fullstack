
import { Router } from "express";
import MenuItem from "../models/MenuItem";

import {
  getRestaurantMenu,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "../controllers/menuController";

const router = Router();

// GET /api/menu
// Fetch all menu items
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

// GET /api/menu/restaurants/:restaurantId/menu
router.get(
  "/restaurants/:restaurantId/menu",
  getRestaurantMenu
);

// POST /api/menu/restaurants/:restaurantId/menu
router.post(
  "/restaurants/:restaurantId/menu",
  createMenuItem
);

// PATCH /api/menu/menu/:id
router.patch("/menu/:id", updateMenuItem);

// DELETE /api/menu/menu/:id
router.delete("/menu/:id", deleteMenuItem);

export default router;
