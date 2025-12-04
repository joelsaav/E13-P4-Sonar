import { Router } from "express";
import {
  createTask,
  getUserTasks,
  getSharedTasks,
  deleteTask,
  updateTask,
  shareTask,
  unshareTask,
  updateSharePermission,
} from "../controllers/tasksController";
import { authenticate } from "../middleware/authMiddleware";
import {
  createTaskSchema,
  updateTaskSchema,
  shareTaskSchema,
  updateShareSchema,
} from "../schemas/validationSchemas";
import { validateBody } from "../middleware/validationMiddleware";

const router = Router();

router.post("/", authenticate, validateBody(createTaskSchema), createTask);
router.get("/", authenticate, getUserTasks);
router.get("/shared", authenticate, getSharedTasks);
router.delete("/:id", authenticate, deleteTask);
router.patch("/:id", authenticate, validateBody(updateTaskSchema), updateTask);
router.post(
  "/:id/share",
  authenticate,
  validateBody(shareTaskSchema),
  shareTask,
);
router.patch(
  "/:id/share/:userId",
  authenticate,
  validateBody(updateShareSchema),
  updateSharePermission,
);
router.delete("/:id/share/:userId", authenticate, unshareTask);

export default router;
