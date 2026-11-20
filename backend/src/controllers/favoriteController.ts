
import type { Response } from "express";
import mongoose from "mongoose";

import Favorite from "../models/Favorite";
import Restaurant from "../models/Restaurant";
import type { AuthRequest } from "../middleware/authMiddleware";

export async function getFavorites(
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

    const favorites = await Favorite.find({
      userId: req.userId,
    })
      .populate("restaurantId")
      .sort({ createdAt: -1 })
      .lean();

    const restaurants = favorites
      .map((favorite) => favorite.restaurantId)
      .filter(
        (restaurant) =>
          restaurant !== null &&
          typeof restaurant === "object"
      );

    res.status(200).json({
      success: true,
      data: restaurants,
    });
  } catch (error) {
    console.error("Get favorites error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load favorites",
    });
  }
}

export async function addFavorite(
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

    const restaurant = await Restaurant.exists({
      _id: restaurantId,
    });

    if (!restaurant) {
      res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
      return;
    }

    await Favorite.updateOne(
      {
        userId: req.userId,
        restaurantId,
      },
      {
        $setOnInsert: {
          userId: req.userId,
          restaurantId,
        },
      },
      { upsert: true }
    );

    res.status(200).json({
      success: true,
      message: "Restaurant added to favorites",
    });
  } catch (error) {
    if (
      error instanceof mongoose.mongo.MongoServerError &&
      error.code === 11000
    ) {
      res.status(200).json({
        success: true,
        message: "Restaurant already in favorites",
      });
      return;
    }

    console.error("Add favorite error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to add favorite",
    });
  }
}

export async function removeFavorite(
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

    await Favorite.deleteOne({
      userId: req.userId,
      restaurantId,
    });

    res.status(200).json({
      success: true,
      message: "Restaurant removed from favorites",
    });
  } catch (error) {
    console.error("Remove favorite error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to remove favorite",
    });
  }
}

export async function checkFavorite(
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

    const favorite = await Favorite.exists({
      userId: req.userId,
      restaurantId,
    });

    res.status(200).json({
      success: true,
      data: {
        isFavorite: Boolean(favorite),
      },
    });
  } catch (error) {
    console.error("Check favorite error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to check favorite",
    });
  }
}
