import "dotenv/config";
import express from "express";
import { createServer } from "http";
import cors from "cors";
import bodyParser from "body-parser";
import authRoutes from "./routes/auth";
import eventRoutes from "./routes/events";
import ticketRoutes from "./routes/tickets";
import documentRoutes from "./routes/documents";
import { initSocket } from "./socket";

const app = express();
const httpServer = createServer(app);
initSocket(httpServer);

app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
}));
app.use(bodyParser.json());

// Endpoint for deployment health check
app.get("/health", (_req, res) => { res.status(200).json({ status: "ok" }); });

app.use("/auth", authRoutes);
app.use("/events", eventRoutes);
app.use("/tickets", ticketRoutes);
app.use("/documents", documentRoutes);

const port = Number(process.env.PORT) || 4000;
httpServer.listen(port, "0.0.0.0", () => console.log(`Server running on port ${port}`));

