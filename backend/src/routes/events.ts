import "dotenv/config";
import crypto from "crypto";
import express from "express";
import type { Request, Response } from "express";
import { Prisma } from "../generated/prisma/client";
import { prisma } from "../prisma";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();

type EventSaleRow = {
  ticketId: string;
  code: string | null;
  eventId: string;
  userId: string;
  createdAt: Date;
  purchasePrice: number;
  discountApplied: boolean;
  discountReviewStatus: string | null;
  username: string;
  studentDocumentId: string | null;
  studentDocumentName: string | null;
  studentDocumentUploadedAt: Date | null;
};

router.get("/", async (req, res) => {
  try {
    const events = await prisma.event.findMany();
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

router.get("/my", authMiddleware, async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) return res.status(401).send("Invalid token");
  console.log('GET /events/my user', user);
  if (user.role !== "organizer") {
    return res.status(403).send("Forbidden");
  }
  try {
    const myEvents = await prisma.event.findMany({
      where: { organizerId: user.id },
      orderBy: [{ date: "asc" }, { time: "asc" }],
    });
    const eventIds = myEvents.map((event) => event.id);
    const sales = eventIds.length === 0
      ? []
      : await prisma.$queryRaw<EventSaleRow[]>(Prisma.sql`
          SELECT
            t.id AS "ticketId",
            t.code,
            t."eventId",
            t."userId",
            t."createdAt",
            t."purchasePrice",
            t."discountApplied",
            t."discountReviewStatus",
            u.username,
            d.id AS "studentDocumentId",
            d."originalName" AS "studentDocumentName",
            d."uploadedAt" AS "studentDocumentUploadedAt"
          FROM "Ticket" t
          JOIN "User" u ON u.id = t."userId"
          LEFT JOIN LATERAL (
            SELECT d.id, d."originalName", d."uploadedAt"
            FROM "Document" d
            WHERE d."userId" = t."userId"
              AND d.type = 'student_id'
            ORDER BY d."uploadedAt" DESC
            LIMIT 1
          ) d ON true
          WHERE t."eventId" IN (${Prisma.join(eventIds)})
          ORDER BY t."createdAt" DESC
        `);
    const salesByEventId = new Map<string, EventSaleRow[]>();
    for (const sale of sales) {
      const existing = salesByEventId.get(sale.eventId) ?? [];
      existing.push(sale);
      salesByEventId.set(sale.eventId, existing);
    }

    const eventsWithSales = myEvents.map((event) => {
      const eventSales = salesByEventId.get(event.id) ?? [];
      const soldCount = eventSales.length;
      const revenue = eventSales.reduce((sum, sale) => sum + sale.purchasePrice, 0);

      return {
        ...event,
        soldCount,
        revenue,
        sales: eventSales.map((sale) => ({
          id: sale.ticketId,
          code: sale.code,
          buyerUserId: sale.userId,
          purchasedAt: sale.createdAt,
          purchasePrice: sale.purchasePrice,
          discountApplied: sale.discountApplied,
          discountReviewStatus: sale.discountReviewStatus,
          buyerUsername: sale.username,
          studentDocument: sale.studentDocumentId
            ? {
                id: sale.studentDocumentId,
                originalName: sale.studentDocumentName,
                uploadedAt: sale.studentDocumentUploadedAt,
              }
            : undefined,
        })),
      };
    });
    console.log('myEvents count', myEvents.length);
    res.json(eventsWithSales);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

router.get("/:id", async (req, res) => {
  try {
    const event = await prisma.event.findUnique({ where: { id: req.params.id } });
    if (!event) return res.status(404).send("Event not found");
    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

router.post("/", authMiddleware, async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) return res.status(401).send("Invalid token");
  console.log('POST /events user', user);
  if (user.role !== "organizer") return res.status(403).send("Forbidden");

  const { title, location, date, time, price, ticketsLeft, info, studentDiscount } = req.body;
  if (!title || !location || !date || !time || price === undefined || ticketsLeft === undefined) {
    return res.status(400).send("Missing required fields: title/location/date/time/price/ticketsLeft");
  }
  if (Number(price) < 0 || Number(ticketsLeft) < 0) {
    return res.status(400).send("Price and ticketsLeft cannot be negative");
  }
  const eventDateTime = new Date(`${date}T${time}`);
  if (Number.isNaN(eventDateTime.getTime())) {
    return res.status(400).send("Invalid date/time format");
  }
  if (eventDateTime <= new Date()) {
    return res.status(400).send("Date and time cannot be in the past");
  }

  try {
    const event = await prisma.event.create({
      data: {
        title,
        location,
        date,
        time,
        price: Number(price),
        ticketsLeft: Number(ticketsLeft),
        info: info || "",
        studentDiscount: studentDiscount || false,
        organizerId: user.id,
      },
    });
    console.log('Created event organizerId', event.organizerId, 'id', event.id);
    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

router.post("/:id/buy", authMiddleware, async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) return res.status(401).send("Invalid token");
  if (user.role !== "customer") return res.status(403).send("Forbidden");

  try {
    const event = await prisma.event.findUnique({ where: { id: req.params.id } });
    if (!event) return res.status(404).send("Event not found");

    const useStudentDiscount = req.body?.useStudentDiscount === true;
    let discountApplied = false;
    let finalPrice = event.price;
    if (useStudentDiscount) {
      if (!event.studentDiscount) {
        return res.status(400).send("This event does not offer student discount");
      }

      const studentDoc = await prisma.document.findFirst({
        where: { userId: user.id, type: "student_id" },
      });

      if (!studentDoc) {
        return res.status(400).send("Please upload your student ID before using student discount");
      }

      finalPrice = Math.floor(event.price * 0.8);
      discountApplied = true;
    }

    const updateResult = await prisma.event.updateMany({
      where: {
        id: req.params.id,
        ticketsLeft: { gt: 0 },
      },
      data: {
        ticketsLeft: { decrement: 1 },
      },
    });

    if (updateResult.count === 0) {
      return res.status(400).send("Sold out");
    }

    const ticketId = crypto.randomUUID();
    const discountReviewStatus = discountApplied ? "pending" : null;
    const code = discountReviewStatus === "pending" ? null : crypto.randomBytes(16).toString("hex");
    await prisma.$executeRaw(
      Prisma.sql`
        INSERT INTO "Ticket" ("id", "code", "eventId", "userId", "purchasePrice", "discountApplied", "discountReviewStatus", "createdAt")
        VALUES (${ticketId}, ${code}, ${req.params.id}, ${user.id}, ${finalPrice}, ${discountApplied}, ${discountReviewStatus}, NOW())
      `
    );

    res.json({
      message: "Ticket purchased",
      ticket: {
        id: ticketId,
        code,
        eventId: req.params.id,
        userId: user.id,
        purchasePrice: finalPrice,
        discountApplied,
        discountReviewStatus,
      },
      discountApplied,
      discountReviewStatus,
      finalPrice,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

router.put("/:id", authMiddleware, async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) return res.status(401).send("Invalid token");
  if (user.role !== "organizer") {
    return res.status(403).send("Forbidden");
  }

  try {
    const exists = await prisma.event.findFirst({
      where: { id: req.params.id, organizerId: user.id },
    });
    if (!exists) return res.status(404).send("Event not found");
    const existingEventDateTime = new Date(`${exists.date}T${exists.time}`);
    if (!Number.isNaN(existingEventDateTime.getTime()) && existingEventDateTime <= new Date()) {
      return res.status(400).send("Past events cannot be edited");
    }

    const { title, location, date, time, price, ticketsLeft, info, studentDiscount } = req.body;
    if (price !== undefined && Number(price) < 0) return res.status(400).send("Price cannot be negative");
    if (ticketsLeft !== undefined && Number(ticketsLeft) < 0) return res.status(400).send("ticketsLeft cannot be negative");
    if ((date !== undefined || time !== undefined) && (date === undefined || time === undefined)) {
      return res.status(400).send("Both date and time must be present if one is provided");
    }
    if (date !== undefined && time !== undefined) {
      const eventDateTime = new Date(`${date}T${time}`);
      if (Number.isNaN(eventDateTime.getTime())) {
        return res.status(400).send("Invalid date/time format");
      }
      if (eventDateTime <= new Date()) {
        return res.status(400).send("Date and time cannot be in the past");
      }
    }
    const updated = await prisma.event.update({
      where: { id: req.params.id },
      data: {
        title: title !== undefined ? title : exists.title,
        location: location !== undefined ? location : exists.location,
        date: date !== undefined ? date : exists.date,
        time: time !== undefined ? time : exists.time,
        price: price !== undefined ? Number(price) : exists.price,
        ticketsLeft: ticketsLeft !== undefined ? Number(ticketsLeft) : exists.ticketsLeft,
        info: info !== undefined ? info : exists.info,
        studentDiscount: studentDiscount !== undefined ? studentDiscount : exists.studentDiscount,
      },
    });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

router.delete("/:id", authMiddleware, async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) return res.status(401).send("Invalid token");
  if (user.role !== "organizer") {
    return res.status(403).send("Forbidden");
  }

  try {
    const event = await prisma.event.findFirst({ where: { id: req.params.id, organizerId: user.id } });
    if (!event) return res.status(404).send("Event not found");

    await prisma.event.delete({ where: { id: req.params.id } });
    res.json({ message: "Event deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

export default router;

