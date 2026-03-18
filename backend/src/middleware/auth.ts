import "dotenv/config";
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { AuthenticatedRequest, JwtUserPayload, UserRole } from "../types/auth";

const SECRET = process.env.JWT_SECRET;

if (!SECRET) {
  console.error("WARNING: JWT_SECRET is not set. Auth will not work.");
}

const isUserRole = (role: unknown): role is UserRole => {
  return role === "organizer" || role === "customer";
};

const isJwtUserPayload = (value: string | jwt.JwtPayload): value is JwtUserPayload => {
  return (
    typeof value !== "string" &&
    typeof value.id === "string" &&
    isUserRole(value.role)
  );
};

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!SECRET) return res.status(500).send("Server misconfigured");

  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).send("No token");

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).send("Invalid token");

  try {
    const decoded = jwt.verify(token, SECRET);
    if (!isJwtUserPayload(decoded)) {
      return res.status(401).send("Invalid token");
    }

    (req as AuthenticatedRequest).user = decoded;
    next();
  } catch {
    res.status(401).send("Invalid token");
  }
};
