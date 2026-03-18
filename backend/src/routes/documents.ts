import "dotenv/config";
import express from "express";
import multer from "multer";
import type { Request, Response } from "express";
import { Prisma } from "../generated/prisma/client";
import { prisma } from "../prisma";
import { authMiddleware } from "../middleware/auth";
import { uploadDocument, downloadDocument, deleteDocumentFile } from "../services/documentStorage";

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", authMiddleware, upload.single("document"), async (req: Request & { file?: Express.Multer.File }, res: Response) => {
  const user = req.user;
  if (!user) return res.status(401).send("Invalid token");
  if (!req.file) return res.status(400).send("No file uploaded");

  try {
    const storedDocument = await uploadDocument({
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      buffer: req.file.buffer,
    });

    const document = await prisma.document.create({
      data: {
        filename: storedDocument.filename,
        originalName: req.file.originalname,
        mimetype: storedDocument.mimetype,
        size: storedDocument.size,
        path: storedDocument.path,
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

    await deleteDocumentFile({
      path: document.path,
      filename: document.filename,
    });

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
    if (document.userId !== user.id) {
      const organizerAccess =
        user.role === "organizer" &&
        document.type === "student_id" &&
        (
          await prisma.$queryRaw<{ id: string }[]>(
            Prisma.sql`
              SELECT t.id
              FROM "Ticket" t
              JOIN "Event" e ON e.id = t."eventId"
              WHERE t."userId" = ${document.userId}
                AND t."discountApplied" = true
                AND e."organizerId" = ${user.id}
              LIMIT 1
            `
          )
        ).length > 0;

      if (!organizerAccess) return res.status(403).send("Forbidden");
    }

    const file = await downloadDocument({
      path: document.path,
      filename: document.filename,
      originalName: document.originalName,
      mimetype: document.mimetype,
    });

    res.setHeader("Content-Type", file.mimetype);
    res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(file.filename)}"`);
    if (file.size !== undefined) {
      res.setHeader("Content-Length", String(file.size));
    }
    file.stream.pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

export default router;
