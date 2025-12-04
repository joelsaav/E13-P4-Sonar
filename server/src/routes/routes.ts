import { Router } from "express";
import authRouter from "./authRoutes";
import notificationsRouter from "./notificationsRoutes";
import usersRouter from "./usersRoutes";
import tasksRouter from "./tasksRoutes";
import listsRouter from "./listsRoutes";

const router = Router();

router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/tasks", tasksRouter);
router.use("/notifications", notificationsRouter);
router.use("/lists", listsRouter);

export default router;
