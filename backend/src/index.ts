import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import authRoutes from "./routes/auth";
import eventRoutes from "./routes/events";
import ticketRoutes from "./routes/tickets";

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use("/auth", authRoutes);
app.use("/events", eventRoutes);
app.use("/tickets", ticketRoutes);

app.listen(4000, () => console.log("Server running on http://localhost:4000"));

