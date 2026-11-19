
import {
  Request,
  Response,
  NextFunction,
} from "express";

export function requireTrustedOrigin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const allowedOrigin =
    process.env.FRONTEND_URL || "http://localhost:3000";

  const origin = req.get("origin");

  // Require a trusted browser request origin
  if (!origin || origin !== allowedOrigin) {
    res.status(403).json({
      success: false,
      message: "Request origin is not allowed",
    });
    return;
  }

  next();
}
