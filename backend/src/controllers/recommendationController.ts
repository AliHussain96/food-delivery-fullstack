
import type { Request, Response } from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

import Restaurant from "../models/Restaurant";
import Favorite from "../models/Favorite";

interface RecommendationParams {
  id: string;
}

function normalizeCuisine(value: string): string {
  return value.trim().toLowerCase();
}

function getDeliveryMinutes(value: string): number {
  const match = value.match(/\d+/);
  return match ? Number(match[0]) : 999;
}

export async function getRestaurantRecommendations(
  req: Request<RecommendationParams>,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid restaurant ID",
      });
      return;
    }

    const currentRestaurant = await Restaurant.findById(id).lean();

    if (!currentRestaurant) {
      res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
      return;
    }

    // Determine the customer's preferred cuisines
    // from their saved favorite restaurants.
    const cuisinePreferences = new Map<string, number>();

    const token = req.cookies?.foodnest_token;
    const jwtSecret = process.env.JWT_SECRET;

    if (typeof token === "string" && jwtSecret) {
      try {
        const decoded = jwt.verify(token, jwtSecret);

        if (
          typeof decoded !== "string" &&
          typeof decoded.userId === "string" &&
          mongoose.isValidObjectId(decoded.userId)
        ) {
          const favorites = await Favorite.find({
            userId: decoded.userId,
          }).lean();

          const favoriteRestaurantIds = favorites.map(
            (favorite) => favorite.restaurantId
          );

          const favoriteRestaurants = await Restaurant.find({
            _id: { $in: favoriteRestaurantIds },
          })
            .select("cuisine")
            .lean();

          for (const restaurant of favoriteRestaurants) {
            const cuisine = normalizeCuisine(
              restaurant.cuisine
            );

            cuisinePreferences.set(
              cuisine,
              (cuisinePreferences.get(cuisine) ?? 0) + 1
            );
          }
        }
      } catch {
        // Expired or invalid session:
        // show general recommendations instead.
      }
    }

    // Never recommend the restaurant being viewed.
    const candidates = await Restaurant.find({
      _id: { $ne: currentRestaurant._id },
    }).lean();

    const currentCuisine = normalizeCuisine(
      currentRestaurant.cuisine
    );

    const ranked = candidates
      .map((restaurant) => {
        const cuisine = normalizeCuisine(
          restaurant.cuisine
        );

        const rating = restaurant.rating ?? 0;
        const totalReviews = restaurant.totalReviews ?? 0;

        let score = 0;

        // Similar cuisine is highly relevant.
        if (cuisine === currentCuisine) {
          score += 30;
        }

        // Favor cuisines the customer has saved.
        score +=
          (cuisinePreferences.get(cuisine) ?? 0) * 20;

        // Reward higher ratings.
        score += rating * 8;

        // Reward restaurants with more review evidence,
        // without letting very large counts dominate.
        score += Math.min(totalReviews, 100) * 0.1;

        // Small preference for faster delivery.
        const deliveryMinutes = getDeliveryMinutes(
          restaurant.deliveryTime
        );

        if (deliveryMinutes <= 30) {
          score += 5;
        } else if (deliveryMinutes <= 45) {
          score += 2;
        }

        return {
          restaurant,
          score,
        };
      })
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }

        return a.restaurant.name.localeCompare(
          b.restaurant.name
        );
      })
      .slice(0, 6)
      .map(({ restaurant }) => restaurant);

    res.status(200).json({
      success: true,
      count: ranked.length,
      data: ranked,
    });
  } catch (error) {
    console.error("Recommendation error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load restaurant recommendations",
    });
  }
}
