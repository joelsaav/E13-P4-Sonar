import { Router } from "express";
import {
  deleteAccount,
  updateProfile,
} from "../controllers/usersController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { validateBody } from "../middleware/validationMiddleware.js";
import { updateProfileSchema } from "../schemas/validationSchemas.js";

const router = Router();

router.delete("/me", authenticate, deleteAccount);
router.patch(
  "/me",
  authenticate,
  validateBody(updateProfileSchema),
  updateProfile,
);

export default router;
