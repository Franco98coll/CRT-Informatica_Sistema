import type { Request, Response } from "express";
import { addOrden } from "../service/ordenes.ext.service.js";

export async function create(req: Request, res: Response) {
  try {
    const {
      idEquipo,
      fallaEquipoOrden,
      diagnosticoTecnicoOrden,
      diagnosticoAClienteOrden,
      idEstadoOrden,
    } = req.body || {};
    if (!idEquipo || typeof idEquipo !== "number")
      return res.status(400).json({ error: "idEquipo requerido" });
    const id = await addOrden({
      idEquipo,
      fallaEquipoOrden: fallaEquipoOrden ?? null,
      diagnosticoTecnicoOrden: diagnosticoTecnicoOrden ?? null,
      diagnosticoAClienteOrden: diagnosticoAClienteOrden ?? null,
      idEstadoOrden: idEstadoOrden ?? null,
    });
    res.status(201).json({ id });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Error" });
  }
}
