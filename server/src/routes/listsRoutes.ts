import { Router } from "express";
import {
  createList,
  deleteList,
  getUserLists,
  getSharedLists,
  updateList,
  shareList,
  unshareList,
  updateSharePermission,
} from "../controllers/listsController";
import { authenticate } from "../middleware/authMiddleware";
import {
  createListSchema,
  updateListSchema,
  shareListSchema,
  updateShareSchema,
} from "../schemas/validationSchemas";
import { validateBody } from "../middleware/validationMiddleware";

const router = Router();

router.post("/", authenticate, validateBody(createListSchema), createList);
router.get("/", authenticate, getUserLists);
router.get("/shared", authenticate, getSharedLists);
router.patch("/:id", authenticate, validateBody(updateListSchema), updateList);
router.delete("/:id", authenticate, deleteList);
router.post(
  "/:id/share",
  authenticate,
  validateBody(shareListSchema),
  shareList,
);
router.patch(
  "/:id/share/:userId",
  authenticate,
  validateBody(updateShareSchema),
  updateSharePermission,
);
router.delete("/:id/share/:userId", authenticate, unshareList);

export default router;
