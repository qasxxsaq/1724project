import "dotenv/config";
import express from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma";

const router = express.Router();
const SECRET = process.env.JWT_SECRET;

if (!SECRET) {
  throw new Error("JWT_SECRET is not set");
}

const authMiddleware = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).send("No token");
  const token = authHeader.split(" ")[1];
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).send("Invalid token");
  }
};

router.get("/my", authMiddleware, async (req: any, res) => {
  if (req.user.role !== "customer") return res.status(403).send("Forbidden");

  try {
    const tickets = await prisma.ticket.findMany({
      where: { userId: req.user.id },
      include: { event: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(tickets);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

router.get("/:id", authMiddleware, async (req: any, res) => {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: req.params.id },
      include: { event: true },
    });
    if (!ticket) return res.status(404).send("Ticket not found");
    if (ticket.userId !== req.user.id) return res.status(403).send("Forbidden");
    res.json(ticket);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

export default router;
