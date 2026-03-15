import express from "express";
import { Event } from "../types";
import jwt from "jsonwebtoken";

const router = express.Router();
const SECRET = "secret_key"; // same as auth
const events: Event[] = [];

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

router.get("/", (req, res) => {
  res.json(events);
});

router.post("/", authMiddleware, (req: any, res) => {
  if (req.user.role !== "organizer") return res.status(403).send("Forbidden");
  const { title, location, date, time, price, ticketsLeft, info } = req.body;
  const event: Event = {
    id: Date.now().toString(),
    title,
    location,
    date,
    time,
    price,
    ticketsLeft,
    info,
    organizerId: req.user.id
  };
  events.push(event);
  res.json(event);
});

router.post("/:id/buy", authMiddleware, (req: any, res) => {
  const event = events.find(e => e.id === req.params.id);
  if (!event) return res.status(404).send("Event not found");
  if (event.ticketsLeft <= 0) return res.status(400).send("Sold out");
  event.ticketsLeft -= 1;
  res.json({ message: "Ticket purchased", ticketsLeft: event.ticketsLeft });
});

// Organizer: show all my events
router.get("/my", authMiddleware, (req: any, res) => {
  if (req.user.role !== "organizer") {
    return res.status(403).send("Forbidden");
  }
  const myEvents = events.filter(e => e.organizerId === req.user.id);
  res.json(myEvents);
});

// Organizer: edit event
router.put("/:id", authMiddleware, (req: any, res: any) => {
  if (req.user.role !== "organizer") {
    return res.status(403).send("Forbidden");
  }
  const event = events.find(
    (e) => e.id === req.params.id && e.organizerId === req.user.id
  );
  if (!event) {
    return res.status(404).send("Event not found");
  }

  const { title, location, date, time, price, ticketsLeft, info } = req.body;
  if (title !== undefined) event.title = title;
  if (location !== undefined) event.location = location;
  if (date !== undefined) event.date = date;
  if (time !== undefined) event.time = time;
  if (price !== undefined) event.price = Number(price);
  if (ticketsLeft !== undefined) event.ticketsLeft = Number(ticketsLeft);
  if (info !== undefined) event.info = info;

  res.json(event);
});

// Organizer:delete certain event
router.delete("/:id", authMiddleware, (req: any, res) => {
  if (req.user.role !== "organizer") {
    return res.status(403).send("Forbidden");
  }
  const index = events.findIndex(
    (e) => e.id === req.params.id && e.organizerId === req.user.id
  );
  if (index === -1) {
    return res.status(404).send("Event not found");
  }
  events.splice(index, 1);
  res.json({ message: "Event deleted" });
});

export default router;

