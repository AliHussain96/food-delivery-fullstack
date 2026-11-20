
import { Router } from "express";

import { protect } from "../middleware/authMiddleware";
import { requireTrustedOrigin } from "../middleware/requireTrustedOrigin";

import {
  getProfile,
  updateProfile,
} from "../controllers/profileController";

const router = Router();

router.use(protect);

router.get("/", getProfile);

router.patch(
  "/",
  requireTrustedOrigin,
  updateProfile
);

export default router;
