
import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User";

export interface AuthRequest extends Request {
  userId?: string;
}

export async function protect(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = req.cookies?.foodnest_token;

    if (!token || typeof token !== "string") {
      res.status(401).json({
        success: false,
        message: "Please login first",
      });
      return;
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("JWT_SECRET is not configured");
    }

    const decoded = jwt.verify(token, secret) as JwtPayload;

    if (
      typeof decoded.userId !== "string" ||
      !mongoose.isValidObjectId(decoded.userId)
    ) {
      res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
      return;
    }

    const user = await User.findById(decoded.userId);

    if (!user) {
      res.status(401).json({
        success: false,
        message: "User no longer exists",
      });
      return;
    }

    req.userId = user.id;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: "Invalid or expired session",
      });
      return;
    }

    console.error("Authentication error:", error);

    res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
}


export async function adminOnly(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: "Please login first",
      });
      return;
    }

    const user = await User.findById(req.userId);

    if (!user) {
      res.status(401).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    if (user.role !== "admin") {
      res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
      return;
    }

    next();
  } catch (error) {
    console.error("Admin authorization error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to verify admin access",
    });
  }
}