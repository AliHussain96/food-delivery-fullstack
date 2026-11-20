
import { Router } from "express";

import { protect } from "../middleware/authMiddleware";
import { requireTrustedOrigin } from "../middleware/requireTrustedOrigin";

import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../controllers/addressController";

const router = Router();

router.use(protect);

router.get("/", getAddresses);

router.post(
  "/",
  requireTrustedOrigin,
  createAddress
);

router.patch(
  "/:id",
  requireTrustedOrigin,
  updateAddress
);

router.patch(
  "/:id/default",
  requireTrustedOrigin,
  setDefaultAddress
);

router.delete(
  "/:id",
  requireTrustedOrigin,
  deleteAddress
);

export default router;
