import express from "express";
import { User } from "../types";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();
const SECRET = "secret_key"; // demo only
const users: User[] = [];

router.post("/register", async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) return res.status(400).send("Missing fields");
  const hashed = await bcrypt.hash(password, 10);
  const user: User = { id: Date.now().toString(), username, password: hashed, role };
  users.push(user);
  res.json({ message: "Registered successfully" });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) return res.status(400).send("Invalid credentials");
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).send("Invalid credentials");
  const token = jwt.sign({ id: user.id, role: user.role }, SECRET);
  res.json({ token, role: user.role });
});

export default router;

