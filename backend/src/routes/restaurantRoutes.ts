
import { Router } from "express";

import {
  getRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
} from "../controllers/restaurantController";

const router = Router();

router.get("/", getRestaurants);

router.get("/:id", getRestaurantById);

router.post("/", createRestaurant);

router.patch("/:id", updateRestaurant);

router.delete("/:id", deleteRestaurant);

export default router;
