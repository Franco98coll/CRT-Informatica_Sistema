import type { Request, Response } from "express";
import { getPresupuestos } from "../service/presupuestos.service.js";

export async function list(_req: Request, res: Response) {
  try {
    const data = await getPresupuestos();
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Error" });
  }
}
