
import { Router } from "express";

import {
  getRestaurantReviews,
  createReview,
  updateReview,
  deleteReview,
} from "../controllers/reviewController";

import { protect } from "../middleware/authMiddleware";

// Use the same trusted-origin middleware already
// used for order cancellation and other mutations.
import { requireTrustedOrigin } from "../middleware/requireTrustedOrigin";

const router = Router();

// Public route
router.get(
  "/restaurant/:restaurantId",
  getRestaurantReviews
);

// Protected routes
router.post(
  "/",
  protect,
  requireTrustedOrigin,
  createReview
);

router.patch(
  "/:reviewId",
  protect,
  requireTrustedOrigin,
  updateReview
);

router.delete(
  "/:reviewId",
  protect,
  requireTrustedOrigin,
  deleteReview
);

export default router;
