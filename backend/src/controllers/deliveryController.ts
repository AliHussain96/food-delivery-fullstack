
import { Request, Response } from "express";
import mongoose from "mongoose";

import Restaurant from "../models/Restaurant";
import Address from "../models/Address";
import { isDeliveryAvailable } from "../utils/deliveryAvailability";
import { AuthRequest } from "../middleware/authMiddleware";

export async function checkDeliveryAvailability(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const { restaurantId, addressId, city, area } = req.body;

    if (
      !restaurantId ||
      !mongoose.Types.ObjectId.isValid(restaurantId)
    ) {
      res.status(400).json({
        success: false,
        message: "A valid restaurant ID is required.",
      });
      return;
    }

    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      res.status(404).json({
        success: false,
        message: "Restaurant not found.",
      });
      return;
    }

    let deliveryCity = city;
    let deliveryArea = area;

    if (addressId) {
      if (!mongoose.Types.ObjectId.isValid(addressId)) {
        res.status(400).json({
          success: false,
          message: "Invalid saved address ID.",
        });
        return;
      }

      const address = await Address.findOne({
        _id: addressId,
        userId: req.userId,
      });

      if (!address) {
        res.status(404).json({
          success: false,
          message: "Saved address not found.",
        });
        return;
      }

      deliveryCity = address.city;
      deliveryArea = address.area;
    }

    if (
      typeof deliveryCity !== "string" ||
      !deliveryCity.trim() ||
      typeof deliveryArea !== "string" ||
      !deliveryArea.trim()
    ) {
      res.status(400).json({
        success: false,
        message: "Delivery city and area are required.",
      });
      return;
    }

    const available = isDeliveryAvailable(restaurant, {
      city: deliveryCity,
      area: deliveryArea,
    });

    res.status(200).json({
      success: true,
      data: {
        available,
        message: available
          ? "Delivery is available in your area."
          : "This restaurant does not deliver to your selected area.",
      },
    });
  } catch (error) {
    console.error("Delivery availability error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to check delivery availability.",
    });
  }
}
