import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("WARNING: DATABASE_URL is not set. Database queries will fail.");
}

const adapter = connectionString
  ? new PrismaPg({ connectionString })
  : new PrismaPg({ connectionString: "" });

const prisma = new PrismaClient({ adapter });

export { prisma };