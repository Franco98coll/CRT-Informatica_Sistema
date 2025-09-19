import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "node:path";
import fs from "node:fs";
import usersRouter from "./modules/users/users.routes.js";
import authRouter from "./modules/auth/auth.routes.js";
import clientesRouter from "./modules/clientes/clientes.routes.js";
import equiposRouter from "./modules/equipos/equipos.routes.js";
import ordenesRouter from "./modules/ordenes/ordenes.routes.js";
import presupuestosRouter from "./modules/presupuestos/presupuestos.routes.js";
import catalogosRouter from "./modules/catalogos/catalogos.routes.js";
import publicRouter from "./modules/public/public.routes.js";
import statsRouter from "./modules/stats/stats.routes.js";
import { getPool } from "./config/db.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Static uploads
const uploadsDir = path.join(process.cwd(), "uploads");
const uploadsEquiposDir = path.join(uploadsDir, "equipos");
if (!fs.existsSync(uploadsEquiposDir)) {
  fs.mkdirSync(uploadsEquiposDir, { recursive: true });
}
app.use("/uploads", express.static(uploadsDir));

import type { Request, Response } from "express";

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});
app.get("/api/db/ping", async (_req: Request, res: Response) => {
  try {
    const pool = await getPool();
    const { recordset } = await pool.request().query("SELECT 1 as ok");
    res.json({ ok: true, recordset });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message || "DB error" });
  }
});

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/clientes", clientesRouter);
app.use("/api/equipos", equiposRouter);
app.use("/api/ordenes", ordenesRouter);
app.use("/api/presupuestos", presupuestosRouter);
app.use("/api/catalogos", catalogosRouter);
app.use("/api/public", publicRouter);
app.use("/api/stats", statsRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
