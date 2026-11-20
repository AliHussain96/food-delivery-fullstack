
import type { Response } from "express";

import User from "../models/User";
import type { AuthRequest } from "../middleware/authMiddleware";

// GET /api/profile
export async function getProfile(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const user = await User.findById(req.userId).select(
      "_id name email role createdAt updatedAt"
    );

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get profile error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    });
  }
}

// PATCH /api/profile
export async function updateProfile(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const { name } = req.body ?? {};

    if (
      typeof name !== "string" ||
      name.trim().length < 2 ||
      name.trim().length > 100
    ) {
      res.status(400).json({
        success: false,
        message: "Name must contain 2 to 100 characters",
      });
      return;
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: { name: name.trim() } },
      {
        new: true,
        runValidators: true,
      }
    ).select("_id name email role createdAt updatedAt");

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
}
