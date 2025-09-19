import { Router } from "express";
import { list } from "./controller/equipos.controller.js";
import { bySerial, create } from "./controller/equipos.ext.controller.js";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";

const router = Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(process.cwd(), "uploads", "equipos");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ts = Date.now();
    const safe = file.originalname.replace(/[^a-zA-Z0-9_.-]/g, "_");
    cb(null, `${ts}_${safe}`);
  },
});
const upload = multer({ storage });

router.get("/", list);
router.get("/by-serial/:serial", bySerial);
// Field name: 'foto'
router.post("/", upload.single("foto"), (req, res) => {
  try {
    const file = (req as any).file as Express.Multer.File | undefined;
    if (!file) {
      return res.status(400).json({ error: "foto requerida" });
    }
    const url = `/uploads/equipos/${file.filename}`;
    console.log("[UPLOAD] equipo ->", { filename: file.filename, url });
    (req as any).body = { ...req.body, fotoEquipo: url };
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "upload error" });
  }
  return create(req as any, res as any);
});

export default router;
