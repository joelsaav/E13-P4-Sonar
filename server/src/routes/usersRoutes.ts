import { Router } from "express";
import {
  getProfile,
  deleteAccount,
  updateProfile,
} from "../controllers/usersController";
import { authenticate } from "../middleware/authMiddleware";
import { validateBody } from "../middleware/validationMiddleware";
import { updateProfileSchema } from "../schemas/validationSchemas";

const router = Router();

router.get("/me", authenticate, getProfile);
router.delete("/me", authenticate, deleteAccount);
router.patch(
  "/me",
  authenticate,
  validateBody(updateProfileSchema),
  updateProfile,
);

export default router;
