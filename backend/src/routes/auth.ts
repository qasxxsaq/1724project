import "dotenv/config";
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma";

const router = express.Router();
const SECRET = process.env.JWT_SECRET;

if (!SECRET) {
  throw new Error("JWT_SECRET is not set");
}

router.post("/register", async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password || !role) return res.status(400).send("Missing fields");

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) return res.status(400).send("Username already exists");

    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.create({ data: { username, password: hashed, role } });

    res.json({ message: "Registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).send("Missing fields");

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(400).send("Invalid credentials");

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).send("Invalid credentials");

    const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: "7d" });
    res.json({ token, role: user.role, userId: user.id });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

export default router;

