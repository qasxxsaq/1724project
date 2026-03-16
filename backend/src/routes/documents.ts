import "dotenv/config";
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import type { Request, Response } from "express";
import { prisma } from "../prisma";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();

const uploadsDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.post("/upload", authMiddleware, upload.single("document"), async (req: Request & { file?: Express.Multer.File }, res: Response) => {
  const user = req.user;
  if (!user) return res.status(401).send("Invalid token");
  if (!req.file) return res.status(400).send("No file uploaded");

  try {
    const document = await prisma.document.create({
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        type: req.body.type || "general",
        userId: user.id,
      },
    });
    res.json(document);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

router.get("/my", authMiddleware, async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) return res.status(401).send("Invalid token");
  try {
    const documents = await prisma.document.findMany({
      where: { userId: user.id },
      orderBy: { uploadedAt: "desc" },
    });
    res.json(documents);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

router.delete("/:id", authMiddleware, async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) return res.status(401).send("Invalid token");
  try {
    const document = await prisma.document.findUnique({
      where: { id: req.params.id },
    });
    if (!document) return res.status(404).send("Document not found");
    if (document.userId !== user.id) return res.status(403).send("Forbidden");

    await prisma.document.delete({
      where: { id: req.params.id },
    });
    res.send("Document deleted");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

router.get("/:id/download", authMiddleware, async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) return res.status(401).send("Invalid token");
  try {
    const document = await prisma.document.findUnique({
      where: { id: req.params.id },
    });
    if (!document) return res.status(404).send("Document not found");
    if (document.userId !== user.id) return res.status(403).send("Forbidden");

    res.download(document.path, document.originalName);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

export default router;
