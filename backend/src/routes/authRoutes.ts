
import { Router, Response } from "express";
import {
  register,
  login,
  logout,
} from "../controllers/authController";
import {
  protect,
  AuthRequest,
} from "../middleware/authMiddleware";
import User from "../models/User";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

// GET /api/auth/me
router.get("/me", protect, async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const user = await User.findById(req.userId)
    .select("name email role");

  if (!user) {
    res.status(404).json({
      success: false,
      message: "User not found",
    });
    return;
  }

  res.json({
    success: true,
    data: user,
  });
});

export default router;
