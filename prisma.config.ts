import { defineConfig } from "@prisma/config";
import * as dotenv from "dotenv";

// Muat variabel lingkungan dari file .env secara manual
dotenv.config();

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
