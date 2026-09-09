import { defineConfig } from "drizzle-kit";
import path from "path";
import fs from "fs";

// Automatically load root .env file if process.env.DATABASE_URL is not present
if (!process.env.DATABASE_URL) {
  const rootEnvPath = path.resolve(__dirname, "../../.env");
  const localEnvPath = path.resolve(__dirname, "./.env");
  
  const targetEnv = fs.existsSync(rootEnvPath) ? rootEnvPath : (fs.existsSync(localEnvPath) ? localEnvPath : null);
  
  if (targetEnv) {
    const envContent = fs.readFileSync(targetEnv, "utf-8");
    for (const line of envContent.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
        const [key, ...valueParts] = trimmed.split("=");
        if (key.trim() === "DATABASE_URL") {
          process.env.DATABASE_URL = valueParts.join("=").trim().replace(/^["']|["']$/g, "");
        }
      }
    }
  }
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set in .env or environment variables.");
}

export default defineConfig({
  schema: "./src/schema/*.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
