import { Router } from "express";
import {
  login,
  register,
  googleSignIn,
  changePassword,
} from "../controllers/authController.js";
import { validateBody } from "../middleware/validationMiddleware.js";
import {
  registerSchema,
  loginSchema,
  googleAuthSchema,
  changePasswordSchema,
} from "../schemas/validationSchemas.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/login", validateBody(loginSchema), login);
router.post("/register", validateBody(registerSchema), register);
router.post("/google", validateBody(googleAuthSchema), googleSignIn);
router.put(
  "/password",
  authenticate,
  validateBody(changePasswordSchema),
  changePassword,
);

export default router;
