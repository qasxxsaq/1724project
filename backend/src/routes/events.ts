import express from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma";

const router = express.Router();
const SECRET = "secret_key"; // same as auth

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

router.get("/", async (req, res) => {
  try {
    const events = await prisma.event.findMany();
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

router.get("/my", authMiddleware, async (req: any, res) => {
  console.log('GET /events/my user', req.user);
  if (req.user.role !== "organizer") {
    return res.status(403).send("Forbidden");
  }
  try {
    const myEvents = await prisma.event.findMany({ where: { organizerId: req.user.id } });
    console.log('myEvents count', myEvents.length);
    res.json(myEvents);
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

router.post("/", authMiddleware, async (req: any, res) => {
  console.log('POST /events user', req.user);
  if (req.user.role !== "organizer") return res.status(403).send("Forbidden");

  const { title, location, date, time, price, ticketsLeft, info } = req.body;
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
        organizerId: req.user.id,
      },
    });
    console.log('Created event organizerId', event.organizerId, 'id', event.id);
    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

router.post("/:id/buy", authMiddleware, async (req: any, res) => {
  try {
    const event = await prisma.event.findUnique({ where: { id: req.params.id } });
    if (!event) return res.status(404).send("Event not found");
    if (event.ticketsLeft <= 0) return res.status(400).send("Sold out");

    const updated = await prisma.event.update({
      where: { id: req.params.id },
      data: { ticketsLeft: event.ticketsLeft - 1 },
    });
    res.json({ message: "Ticket purchased", ticketsLeft: updated.ticketsLeft });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

router.put("/:id", authMiddleware, async (req: any, res: any) => {
  if (req.user.role !== "organizer") {
    return res.status(403).send("Forbidden");
  }

  try {
    const exists = await prisma.event.findFirst({
      where: { id: req.params.id, organizerId: req.user.id },
    });
    if (!exists) return res.status(404).send("Event not found");

    const { title, location, date, time, price, ticketsLeft, info } = req.body;
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
      },
    });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

router.delete("/:id", authMiddleware, async (req: any, res) => {
  if (req.user.role !== "organizer") {
    return res.status(403).send("Forbidden");
  }

  try {
    const event = await prisma.event.findFirst({ where: { id: req.params.id, organizerId: req.user.id } });
    if (!event) return res.status(404).send("Event not found");

    await prisma.event.delete({ where: { id: req.params.id } });
    res.json({ message: "Event deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

export default router;

