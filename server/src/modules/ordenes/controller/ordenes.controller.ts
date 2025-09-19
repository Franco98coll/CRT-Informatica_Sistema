import type { Request, Response } from "express";
import { getOrdenes } from "../service/ordenes.service.js";

export async function list(_req: Request, res: Response) {
  try {
    const data = await getOrdenes();
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Error" });
  }
}
