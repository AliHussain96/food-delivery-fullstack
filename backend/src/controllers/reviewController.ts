
import type { Response } from "express";
import mongoose from "mongoose";

import Review from "../models/Review";
import Restaurant from "../models/Restaurant";

import type { AuthRequest } from "../middleware/authMiddleware";

import { updateRestaurantRating } from "../utils/updateRestaurantRating";

// Validate review input
function getReviewInput(body: unknown) {
  if (!body || typeof body !== "object") {
    return null;
  }

  const data = body as Record<string, unknown>;

  if (
    typeof data.rating !== "number" ||
    !Number.isInteger(data.rating) ||
    data.rating < 1 ||
    data.rating > 5 ||
    typeof data.comment !== "string"
  ) {
    return null;
  }

  const comment = data.comment.trim();

  if (comment.length < 5 || comment.length > 1000) {
    return null;
  }

  return {
    rating: data.rating,
    comment,
  };
}

// ======================================
// GET ALL REVIEWS FOR A RESTAURANT
// GET /api/reviews/restaurant/:restaurantId
// ======================================

export async function getRestaurantReviews(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const { restaurantId } = req.params;

    if (
      typeof restaurantId !== "string" ||
      !mongoose.isValidObjectId(restaurantId)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid restaurant ID",
      });
      return;
    }

    const reviews = await Review.find({
      restaurantId,
    })
      .populate("userId", "name")
      .sort({ createdAt: -1 })
      .lean();

    const totalReviews = reviews.length;

    const averageRating =
      totalReviews > 0
        ? Number(
            (
              reviews.reduce(
                (sum, review) => sum + review.rating,
                0
              ) / totalReviews
            ).toFixed(1)
          )
        : 0;

    res.status(200).json({
      success: true,
      data: {
        reviews,
        totalReviews,
        averageRating,
      },
    });
  } catch (error) {
    console.error("Get reviews error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load reviews",
    });
  }
}

// ======================================
// CREATE REVIEW
// POST /api/reviews
// ======================================

export async function createReview(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: "Please login first",
      });
      return;
    }

    const { restaurantId } = req.body ?? {};
    const input = getReviewInput(req.body);

    if (
      typeof restaurantId !== "string" ||
      !mongoose.isValidObjectId(restaurantId) ||
      !input
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid review details",
      });
      return;
    }

    const restaurantExists =
      await Restaurant.exists({
        _id: restaurantId,
      });

    if (!restaurantExists) {
      res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
      return;
    }

    // Save customer review
    const review = await Review.create({
      userId: req.userId,
      restaurantId,
      ...input,
    });

    // Recalculate restaurant rating
    await updateRestaurantRating(restaurantId);

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      data: review,
    });
  } catch (error) {
    if (
      error instanceof mongoose.mongo.MongoServerError &&
      error.code === 11000
    ) {
      res.status(409).json({
        success: false,
        message:
          "You have already reviewed this restaurant",
      });
      return;
    }

    console.error("Create review error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to submit review",
    });
  }
}

// ======================================
// UPDATE REVIEW
// PATCH /api/reviews/:reviewId
// ======================================

export async function updateReview(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const { reviewId } = req.params;
    const input = getReviewInput(req.body);

    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: "Please login first",
      });
      return;
    }

    if (
      typeof reviewId !== "string" ||
      !mongoose.isValidObjectId(reviewId) ||
      !input
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid review details",
      });
      return;
    }

    // Update only the logged-in user's review
    const review = await Review.findOneAndUpdate(
      {
        _id: reviewId,
        userId: req.userId,
      },
      {
        $set: input,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!review) {
      res.status(404).json({
        success: false,
        message:
          "Review not found or access denied",
      });
      return;
    }

    // Recalculate restaurant rating
    await updateRestaurantRating(
      review.restaurantId.toString()
    );

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: review,
    });
  } catch (error) {
    console.error("Update review error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update review",
    });
  }
}

// ======================================
// DELETE REVIEW
// DELETE /api/reviews/:reviewId
// ======================================

export async function deleteReview(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const { reviewId } = req.params;

    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: "Please login first",
      });
      return;
    }

    if (
      typeof reviewId !== "string" ||
      !mongoose.isValidObjectId(reviewId)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
      return;
    }

    // Delete only the logged-in user's review
    const review = await Review.findOneAndDelete({
      _id: reviewId,
      userId: req.userId,
    });

    if (!review) {
      res.status(404).json({
        success: false,
        message:
          "Review not found or access denied",
      });
      return;
    }

    // Recalculate restaurant rating
    await updateRestaurantRating(
      review.restaurantId.toString()
    );

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete review error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to delete review",
    });
  }
}
