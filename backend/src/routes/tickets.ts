import "dotenv/config";
import crypto from "crypto";
import express from "express";
import type { Request, Response } from "express";
import { Prisma } from "../generated/prisma/client";
import { prisma } from "../prisma";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();

type TicketRow = {
  id: string;
  code: string | null;
  eventId: string;
  userId: string;
  buyerUsername?: string | null;
  purchasePrice: number;
  discountApplied: boolean;
  discountReviewStatus?: string | null;
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
  studentDocumentId?: string | null;
  studentDocumentName?: string | null;
  studentDocumentUploadedAt?: Date | null;
};

const mapTicketRow = (row: TicketRow) => ({
  id: row.id,
  code: row.code,
  eventId: row.eventId,
  userId: row.userId,
  purchasePrice: row.purchasePrice,
  discountApplied: row.discountApplied,
  discountReviewStatus: row.discountReviewStatus ?? undefined,
  createdAt: row.createdAt,
  buyerUsername: row.buyerUsername ?? undefined,
  studentDocument: row.studentDocumentId
    ? {
        id: row.studentDocumentId,
        originalName: row.studentDocumentName ?? null,
        uploadedAt: row.studentDocumentUploadedAt ?? null,
      }
    : undefined,
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
        t."discountReviewStatus",
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
        u.username AS "buyerUsername",
        t."purchasePrice",
        t."discountApplied",
        t."discountReviewStatus",
        t."createdAt",
        e.title AS "eventTitle",
        e.location AS "eventLocation",
        e.date AS "eventDate",
        e.time AS "eventTime",
        e.price AS "eventPrice",
        e."ticketsLeft" AS "eventTicketsLeft",
        e.info AS "eventInfo",
        e."organizerId" AS "eventOrganizerId",
        e."studentDiscount" AS "eventStudentDiscount",
        d.id AS "studentDocumentId",
        d."originalName" AS "studentDocumentName",
        d."uploadedAt" AS "studentDocumentUploadedAt"
      FROM "Ticket" t
      JOIN "Event" e ON e.id = t."eventId"
      JOIN "User" u ON u.id = t."userId"
      LEFT JOIN LATERAL (
        SELECT d.id, d."originalName", d."uploadedAt"
        FROM "Document" d
        WHERE d."userId" = t."userId"
          AND d.type = 'student_id'
        ORDER BY d."uploadedAt" DESC
        LIMIT 1
      ) d ON true
      WHERE t.id = ${req.params.id}
      LIMIT 1
    `);
    const ticket = tickets[0];
    if (!ticket) return res.status(404).send("Ticket not found");
    const canView =
      (user.role === "customer" && ticket.userId === user.id) ||
      (user.role === "organizer" && ticket.eventOrganizerId === user.id);
    if (!canView) return res.status(403).send("Forbidden");
    res.json(mapTicketRow(ticket));
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

router.post("/:id/review/approve", authMiddleware, async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) return res.status(401).send("Invalid token");
  if (user.role !== "organizer") return res.status(403).send("Forbidden");

  try {
    const tickets = await prisma.$queryRaw<TicketRow[]>(Prisma.sql`
      SELECT
        t.id,
        t.code,
        t."eventId",
        t."userId",
        t."purchasePrice",
        t."discountApplied",
        t."discountReviewStatus",
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
    if (ticket.eventOrganizerId !== user.id) return res.status(403).send("Forbidden");
    if (!ticket.discountApplied) {
      return res.status(400).send("This ticket did not use student discount");
    }
    if (ticket.discountReviewStatus === "approved") {
      return res.json({ message: "Ticket already approved" });
    }

    const generatedCode = ticket.code ?? crypto.randomBytes(16).toString("hex");
    await prisma.$executeRaw(
      Prisma.sql`
        UPDATE "Ticket"
        SET "discountReviewStatus" = 'approved',
            "code" = ${generatedCode}
        WHERE id = ${req.params.id}
      `
    );

    res.json({
      message: "Student discount approved",
      discountReviewStatus: "approved",
      code: generatedCode,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

export default router;
