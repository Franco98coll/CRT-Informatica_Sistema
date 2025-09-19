import type { Request, Response } from "express";
import { getEquipos } from "../service/equipos.service.js";

export async function list(_req: Request, res: Response) {
  try {
    const data = await getEquipos();
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Error" });
  }
}
