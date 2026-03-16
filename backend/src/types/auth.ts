import type { Request } from "express";

export type UserRole = "organizer" | "customer";

export type JwtUserPayload = {
  id: string;
  role: UserRole;
};

export type AuthenticatedRequest = Request & {
  user: JwtUserPayload;
};

declare global {
  namespace Express {
    interface Request {
      user?: JwtUserPayload;
    }
  }
}
