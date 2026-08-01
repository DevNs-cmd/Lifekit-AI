import { registerAs } from "@nestjs/config";

export default registerAs("app", () => ({
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "4000", 10),
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
  aiServiceUrl: process.env.AI_SERVICE_URL,
}));
