import "dotenv/config";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import authRoutes from "./routes/auth";
import eventRoutes from "./routes/events";
import ticketRoutes from "./routes/tickets";
import documentRoutes from "./routes/documents";

const app = express();
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

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server running on port ${port}`))
  .on("error", (err) => console.error("Failed to start server:", err));

