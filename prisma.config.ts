import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Load .env first (defaults), then .env.local (overrides)
config({ path: ".env" });
config({ path: ".env.local", override: true });

export default defineConfig({
  schema: "prisma/",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
