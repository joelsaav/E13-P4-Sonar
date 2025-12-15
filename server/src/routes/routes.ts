import { Router } from "express";
import authRouter from "./authRoutes.js";
import notificationsRouter from "./notificationsRoutes.js";
import usersRouter from "./usersRoutes.js";
import tasksRouter from "./tasksRoutes.js";
import listsRouter from "./listsRoutes.js";
import chatRouter from "./chatRoutes.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/tasks", tasksRouter);
router.use("/notifications", notificationsRouter);
router.use("/lists", listsRouter);
router.use("/chat", chatRouter);

export default router;
