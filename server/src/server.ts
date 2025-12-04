import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import router from "./routes/routes";

const app = express();
const PORT = process.env.PORT || 5200;

app.use(cors());
app.use(express.json());

app.use("/api", router);
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
