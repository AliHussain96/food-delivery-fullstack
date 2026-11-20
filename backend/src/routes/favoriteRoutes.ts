
import { Router } from "express";

import { protect } from "../middleware/authMiddleware";

import {
  getFavorites,
  addFavorite,
  removeFavorite,
  checkFavorite,
} from "../controllers/favoriteController";

const router = Router();

router.use(protect);

router.get("/", getFavorites);

router.get("/check/:restaurantId", checkFavorite);

router.post("/:restaurantId", addFavorite);

router.delete("/:restaurantId", removeFavorite);

export default router;
