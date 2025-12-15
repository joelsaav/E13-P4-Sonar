import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
import express, { Request, Response } from "express";
import { createServer } from "http";
import { initSocket } from "./utils/socket.js";
import cors from "cors";
import router from "./routes/routes.js";
import { startCleanupJob } from "./utils/cleanupTasks.js";

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5200;

initSocket(httpServer);

app.use(cors());
app.use(express.json());

app.use("/api", router);
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
  startCleanupJob();
});

export { app, httpServer };
