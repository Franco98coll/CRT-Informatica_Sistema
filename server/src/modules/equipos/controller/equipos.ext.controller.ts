import type { Request, Response } from "express";
import { findBySerial, addEquipo } from "../service/equipos.ext.service.js";

export async function bySerial(req: Request, res: Response) {
  try {
    const serial = String(req.params.serial || "").trim();
    if (!serial) return res.status(400).json({ error: "serial requerido" });
    const equipo = await findBySerial(serial);
    if (!equipo) return res.status(404).json({ error: "no encontrado" });
    res.json(equipo);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Error" });
  }
}

export async function create(req: Request, res: Response) {
  try {
    const {
      marcaEquipo,
      modeloEquipo,
      numeroDeSerieEquipo,
      fotoEquipo,
      idCliente,
      idMarcaEquipo,
      idEquipoAccesorio,
      idsEquipoAccesorio,
    } = req.body || {};
    if (!numeroDeSerieEquipo || typeof numeroDeSerieEquipo !== "string")
      return res.status(400).json({ error: "numeroDeSerieEquipo requerido" });
    const idClienteNum = Number(idCliente);
    if (!idClienteNum || Number.isNaN(idClienteNum))
      return res.status(400).json({ error: "idCliente requerido" });
    const id = await addEquipo({
      marcaEquipo: marcaEquipo ?? null,
      modeloEquipo: modeloEquipo ?? null,
      numeroDeSerieEquipo,
      fotoEquipo: fotoEquipo ?? null,
      idCliente: idClienteNum,
      idMarcaEquipo: idMarcaEquipo != null ? Number(idMarcaEquipo) : null,
      idEquipoAccesorio:
        idEquipoAccesorio != null ? Number(idEquipoAccesorio) : null,
      idsEquipoAccesorio: (() => {
        if (Array.isArray(idsEquipoAccesorio)) {
          return idsEquipoAccesorio
            .map((x: any) => Number(x))
            .filter((n: any) => !Number.isNaN(n));
        }
        if (typeof idsEquipoAccesorio === "string") {
          try {
            const arr = JSON.parse(idsEquipoAccesorio);
            if (Array.isArray(arr)) {
              return arr
                .map((x: any) => Number(x))
                .filter((n: any) => !Number.isNaN(n));
            }
          } catch {}
        }
        return null;
      })(),
    });
    res.status(201).json({ id });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Error" });
  }
}
