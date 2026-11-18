
import { Request, Response } from "express";
import mongoose from "mongoose";
import MenuItem from "../models/MenuItem";
import Restaurant from "../models/Restaurant";

// GET all menu items for a restaurant
export async function getRestaurantMenu(
  req: Request<{ restaurantId: string }>,
  res: Response
): Promise<void> {
  try {
    const { restaurantId } = req.params;

    if (!mongoose.isValidObjectId(restaurantId)) {
      res.status(400).json({
        success: false,
        message: "Invalid restaurant ID",
      });
      return;
    }

    const restaurantExists = await Restaurant.exists({
      _id: restaurantId,
    });

    if (!restaurantExists) {
      res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
      return;
    }

    const menuItems = await MenuItem.find({
      restaurantId,
    }).sort({ category: 1, name: 1 });

    res.status(200).json({
      success: true,
      count: menuItems.length,
      data: menuItems,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch menu items",
    });
  }
}

// POST: Create a new menu item
export async function createMenuItem(
  req: Request<{ restaurantId: string }>,
  res: Response
): Promise<void> {
  try {
    const { restaurantId } = req.params;

    if (!mongoose.isValidObjectId(restaurantId)) {
      res.status(400).json({
        success: false,
        message: "Invalid restaurant ID",
      });
      return;
    }

    const restaurantExists = await Restaurant.exists({
      _id: restaurantId,
    });

    if (!restaurantExists) {
      res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
      return;
    }

    const {
      name,
      description,
      price,
      image,
      category,
      isAvailable,
    } = req.body;

    const menuItem = await MenuItem.create({
      restaurantId,
      name,
      description,
      price,
      image,
      category,
      isAvailable,
    });

    res.status(201).json({
      success: true,
      message: "Menu item created successfully",
      data: menuItem,
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
      message: "Failed to create menu item",
    });
  }
}

// PATCH: Update a menu item
export async function updateMenuItem(
  req: Request<{ id: string }>,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid menu item ID",
      });
      return;
    }

    const allowedFields = [
      "name",
      "description",
      "price",
      "image",
      "category",
      "isAvailable",
    ];

    const updates: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    }

    const menuItem = await MenuItem.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!menuItem) {
      res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Menu item updated successfully",
      data: menuItem,
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
      message: "Failed to update menu item",
    });
  }
}

// DELETE: Remove a menu item
export async function deleteMenuItem(
  req: Request<{ id: string }>,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid menu item ID",
      });
      return;
    }

    const menuItem = await MenuItem.findByIdAndDelete(id);

    if (!menuItem) {
      res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Menu item deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete menu item",
    });
  }
}
