import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../../.env") });
process.env.GOOGLE_CLIENT_ID = "mock-google-client-id";
