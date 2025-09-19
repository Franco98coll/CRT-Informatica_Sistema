import type { Request, Response } from "express";
import {
  getEstadoOrden,
  getEstadoPresupuesto,
  findMarcas,
  findAccesorios,
} from "../service/catalogos.service.js";

export async function listEstadoOrden(_req: Request, res: Response) {
  try {
    const data = await getEstadoOrden();
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Error" });
  }
}

export async function listMarcas(req: Request, res: Response) {
  try {
    const q = String(req.query.q ?? "");
    const data = await findMarcas(q);
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Error" });
  }
}

export async function listAccesorios(req: Request, res: Response) {
  try {
    const q = String(req.query.q ?? "");
    const data = await findAccesorios(q);
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Error" });
  }
}

export async function listEstadoPresupuesto(_req: Request, res: Response) {
  try {
    const data = await getEstadoPresupuesto();
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Error" });
  }
}
