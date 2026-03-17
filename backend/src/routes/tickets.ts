import "dotenv/config";
import express from "express";
import type { Request, Response } from "express";
import { Prisma } from "../generated/prisma/client";
import { prisma } from "../prisma";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();

type TicketRow = {
  id: string;
  code: string;
  eventId: string;
  userId: string;
  purchasePrice: number;
  discountApplied: boolean;
  createdAt: Date;
  eventTitle: string;
  eventLocation: string;
  eventDate: string;
  eventTime: string;
  eventPrice: number;
  eventTicketsLeft: number;
  eventInfo: string;
  eventOrganizerId: string;
  eventStudentDiscount: boolean;
};

const mapTicketRow = (row: TicketRow) => ({
  id: row.id,
  code: row.code,
  eventId: row.eventId,
  userId: row.userId,
  purchasePrice: row.purchasePrice,
  discountApplied: row.discountApplied,
  createdAt: row.createdAt,
  event: {
    id: row.eventId,
    title: row.eventTitle,
    location: row.eventLocation,
    date: row.eventDate,
    time: row.eventTime,
    price: row.eventPrice,
    ticketsLeft: row.eventTicketsLeft,
    info: row.eventInfo,
    organizerId: row.eventOrganizerId,
    studentDiscount: row.eventStudentDiscount,
  },
});

router.get("/my", authMiddleware, async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) return res.status(401).send("Invalid token");
  if (user.role !== "customer") return res.status(403).send("Forbidden");

  try {
    const tickets = await prisma.$queryRaw<TicketRow[]>(Prisma.sql`
      SELECT
        t.id,
        t.code,
        t."eventId",
        t."userId",
        t."purchasePrice",
        t."discountApplied",
        t."createdAt",
        e.title AS "eventTitle",
        e.location AS "eventLocation",
        e.date AS "eventDate",
        e.time AS "eventTime",
        e.price AS "eventPrice",
        e."ticketsLeft" AS "eventTicketsLeft",
        e.info AS "eventInfo",
        e."organizerId" AS "eventOrganizerId",
        e."studentDiscount" AS "eventStudentDiscount"
      FROM "Ticket" t
      JOIN "Event" e ON e.id = t."eventId"
      WHERE t."userId" = ${user.id}
      ORDER BY t."createdAt" DESC
    `);
    res.json(tickets.map(mapTicketRow));
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

router.get("/:id", authMiddleware, async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) return res.status(401).send("Invalid token");
  try {
    const tickets = await prisma.$queryRaw<TicketRow[]>(Prisma.sql`
      SELECT
        t.id,
        t.code,
        t."eventId",
        t."userId",
        t."purchasePrice",
        t."discountApplied",
        t."createdAt",
        e.title AS "eventTitle",
        e.location AS "eventLocation",
        e.date AS "eventDate",
        e.time AS "eventTime",
        e.price AS "eventPrice",
        e."ticketsLeft" AS "eventTicketsLeft",
        e.info AS "eventInfo",
        e."organizerId" AS "eventOrganizerId",
        e."studentDiscount" AS "eventStudentDiscount"
      FROM "Ticket" t
      JOIN "Event" e ON e.id = t."eventId"
      WHERE t.id = ${req.params.id}
      LIMIT 1
    `);
    const ticket = tickets[0];
    if (!ticket) return res.status(404).send("Ticket not found");
    if (ticket.userId !== user.id) return res.status(403).send("Forbidden");
    res.json(mapTicketRow(ticket));
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

export default router;
