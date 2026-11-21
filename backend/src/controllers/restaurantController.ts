import { Request, Response } from "express";
import mongoose from "mongoose";
import Restaurant from "../models/Restaurant";

// GET: Retrieve all restaurants
export async function getRestaurants(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const city =
      typeof req.query.city === "string" ? req.query.city.trim() : "";

    const area =
      typeof req.query.area === "string" ? req.query.area.trim() : "";

    if (area && !city) {
      res.status(400).json({
        success: false,
        message: "City is required when filtering by area",
      });
      return;
    }

    const filter: Record<string, unknown> = {};

    if (city) {
      filter.city = new RegExp(
        `^${city.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
        "i",
      );
    }

    if (area) {
      filter.deliveryAreas = new RegExp(
        `^${area.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
        "i",
      );
    }

    const restaurants = await Restaurant.find(filter);

    res.status(200).json({
      success: true,
      count: restaurants.length,
      data: restaurants,
    });
  } catch (error) {
    console.error("Get restaurants error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch restaurants",
    });
  }
}

// GET: Retrieve restaurant by ID
export async function getRestaurantById(
  req: Request<{ id: string }>,
  res: Response,
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

    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: restaurant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch restaurant",
    });
  }
}

// POST: Create a new restaurant
export async function createRestaurant(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const restaurant = await Restaurant.create(req.body);

    res.status(201).json({
      success: true,
      message: "Restaurant created successfully",
      data: restaurant,
    });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Failed to create restaurant",
    });
  }
}

// PATCH: Update restaurant details
export async function updateRestaurant(
  req: Request<{ id: string }>,
  res: Response,
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

    const allowedFields = [
      "name",
      "cuisine",
      "deliveryTime",
      "image",
      "description",
      "city",
      "area",
      "deliveryAreas",
    ];

    const updates: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    }

    const restaurant = await Restaurant.findByIdAndUpdate(
      id,
      { $set: updates },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!restaurant) {
      res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Restaurant updated successfully",
      data: restaurant,
    });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Failed to update restaurant",
    });
  }
}

// DELETE: Remove a restaurant
export async function deleteRestaurant(
  req: Request<{ id: string }>,
  res: Response,
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

    const restaurant = await Restaurant.findByIdAndDelete(id);

    if (!restaurant) {
      res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Restaurant deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete restaurant",
    });
  }
}
