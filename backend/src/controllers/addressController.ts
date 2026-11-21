import type { Response } from "express";
import mongoose from "mongoose";

import Address from "../models/Address";
import type { AuthRequest } from "../middleware/authMiddleware";

const labels = ["Home", "Work", "Other"];

function validateAddress(body: unknown) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return null;
  }

  const data = body as Record<string, unknown>;

  const fields = [
    "fullName",
    "phone",
    "addressLine",
    "area",
    "city",
    "state",
    "pincode",
  ] as const;

  const area = (data.area as string).trim();

  for (const field of fields) {
    if (typeof data[field] !== "string" || !(data[field] as string).trim()) {
      return null;
    }
  }

  const fullName = (data.fullName as string).trim();
  const phone = (data.phone as string).trim();
  const addressLine = (data.addressLine as string).trim();
  const city = (data.city as string).trim();
  const state = (data.state as string).trim();
  const pincode = (data.pincode as string).trim();

  const label = data.label ?? "Home";

  if (
    typeof label !== "string" ||
    !labels.includes(label) ||
    fullName.length > 100 ||
    addressLine.length > 500 ||
    city.length > 100 ||
    state.length > 100 ||
    !/^[0-9]{10}$/.test(phone) ||
    !/^[0-9]{6}$/.test(pincode)
  ) {
    return null;
  }

  return {
    label,
    fullName,
    phone,
    addressLine,
    area,
    city,
    state,
    pincode,
  };
}

// GET /api/addresses
export async function getAddresses(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const addresses = await Address.find({
      userId: req.userId,
    }).sort({
      isDefault: -1,
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      data: addresses,
    });
  } catch (error) {
    console.error("Get addresses error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch addresses",
    });
  }
}

// POST /api/addresses

export async function createAddress(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const userId = req.userId;

    // Validate authentication
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    // Validate address details
    const data = validateAddress(req.body);

    if (!data) {
      res.status(400).json({
        success: false,
        message: "Please provide valid address details",
      });
      return;
    }

    // Check existing saved addresses
    const existingCount = await Address.countDocuments({
      userId,
    });

    // Create a new address
    const address = new Address({
      ...data,
      userId,
      isDefault: existingCount === 0,
    });

    await address.save();

    res.status(201).json({
      success: true,
      message: "Address added successfully",
      data: address,
    });
  } catch (error) {
    console.error("Create address error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to add address",
    });
  }
}

// PATCH /api/addresses/:id
export async function updateAddress(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const id = req.params.id;

    if (typeof id !== "string" || !mongoose.isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid address ID",
      });
      return;
    }

    const data = validateAddress(req.body);

    if (!data) {
      res.status(400).json({
        success: false,
        message: "Please provide valid address details",
      });
      return;
    }

    const address = await Address.findOneAndUpdate(
      {
        _id: id,
        userId: req.userId,
      },
      { $set: data },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!address) {
      res.status(404).json({
        success: false,
        message: "Address not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Address updated successfully",
      data: address,
    });
  } catch (error) {
    console.error("Update address error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update address",
    });
  }
}

// DELETE /api/addresses/:id
export async function deleteAddress(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const id = req.params.id;

    if (typeof id !== "string" || !mongoose.isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid address ID",
      });
      return;
    }

    const address = await Address.findOne({
      _id: id,
      userId: req.userId,
    });

    if (!address) {
      res.status(404).json({
        success: false,
        message: "Address not found",
      });
      return;
    }

    if (address.isDefault) {
      const replacement = await Address.findOne({
        userId: req.userId,
        _id: { $ne: id },
      }).sort({ createdAt: -1 });

      // Remove the current default before assigning another.
      await address.deleteOne();

      if (replacement) {
        await Address.updateOne(
          { _id: replacement._id, userId: req.userId },
          { $set: { isDefault: true } },
        );
      }
    } else {
      await address.deleteOne();
    }

    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.error("Delete address error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete address",
    });
  }
}

// PATCH /api/addresses/:id/default
export async function setDefaultAddress(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const id = req.params.id;

    if (typeof id !== "string" || !mongoose.isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid address ID",
      });
      return;
    }

    const address = await Address.findOne({
      _id: id,
      userId: req.userId,
    });

    if (!address) {
      res.status(404).json({
        success: false,
        message: "Address not found",
      });
      return;
    }

    if (!address.isDefault) {
      await Address.updateMany(
        { userId: req.userId, isDefault: true },
        { $set: { isDefault: false } },
      );

      address.isDefault = true;
      await address.save();
    }

    res.status(200).json({
      success: true,
      message: "Default address updated",
      data: address,
    });
  } catch (error) {
    console.error("Set default address error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to set default address",
    });
  }
}
