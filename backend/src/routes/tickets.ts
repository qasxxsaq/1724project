import "dotenv/config";
import express from "express";
import type { Request, Response } from "express";
import { prisma } from "../prisma";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();

router.get("/my", authMiddleware, async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) return res.status(401).send("Invalid token");
  if (user.role !== "customer") return res.status(403).send("Forbidden");

  try {
    const tickets = await prisma.ticket.findMany({
      where: { userId: user.id },
      include: { event: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(tickets);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

router.get("/:id", authMiddleware, async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) return res.status(401).send("Invalid token");
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: req.params.id },
      include: { event: true },
    });
    if (!ticket) return res.status(404).send("Ticket not found");
    if (ticket.userId !== user.id) return res.status(403).send("Forbidden");
    res.json(ticket);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

export default router;
