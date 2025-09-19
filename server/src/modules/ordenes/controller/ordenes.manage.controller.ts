import type { Request, Response } from "express";
import {
  listOrdenesFull,
  getOrdenFullById,
  updateEstadoOrden,
} from "../repository/ordenes.repository.js";
import {
  upsertPresupuesto,
  setPresupuestoEstado,
} from "../../presupuestos/repository/presupuestos.repository.js";
import { updateOrdenFields } from "../repository/ordenes.repository.js";
import { getPool } from "../../../config/db.js";

export async function listFull(req: Request, res: Response) {
  try {
    const qCliente = (req.query.qCliente as string) || undefined;
    const idEstadoOrden = req.query.idEstadoOrden
      ? Number(req.query.idEstadoOrden)
      : undefined;
    const fechaDesde = (req.query.fechaDesde as string) || undefined;
    const fechaHasta = (req.query.fechaHasta as string) || undefined;
    const data = await listOrdenesFull({
      qCliente,
      idEstadoOrden,
      fechaDesde,
      fechaHasta,
    });
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Error" });
  }
}

export async function getDetail(req: Request, res: Response) {
  try {
    const idOrden = Number(req.params.id);
    const data = await getOrdenFullById(idOrden);
    if (!data) return res.status(404).json({ error: "no encontrado" });
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Error" });
  }
}

export async function update(req: Request, res: Response) {
  try {
    const idOrden = Number(req.params.id);
    const {
      idEstadoOrden,
      montoPresupuesto,
      idEstadoPresupuesto,
      fallaEquipoOrden,
      diagnosticoTecnicoOrden,
      diagnosticoAClienteOrden,
      fechaHoraFinalizadoOrden,
      fechaHoraEntregadoEquipoOrden,
    } = req.body || {};

    if (idEstadoOrden) {
      const current = await getOrdenFullById(idOrden);
      if (!current) return res.status(404).json({ error: "no encontrado" });

      const pool = await getPool();
      const { recordset } = await pool
        .request()
        .input("id", Number(idEstadoOrden))
        .query(
          "SELECT nombreEstadoOrden FROM dbo.OrdenEstado WHERE idOrdenEstado = @id"
        );
      const targetName: string = recordset[0]?.nombreEstadoOrden || "";

      const cur = (current.nombreEstadoOrden || "").toLowerCase();
      const tgt = (targetName || "").toLowerCase();

      if (cur.includes("entreg")) {
        return res
          .status(400)
          .json({ error: "Una orden entregada no puede modificarse." });
      }
      if (cur.includes("final") && !tgt.includes("entreg")) {
        return res.status(400).json({
          error: "Una orden finalizada solo puede cambiar a Entregado.",
        });
      }

      await updateEstadoOrden(idOrden, Number(idEstadoOrden));

      const setFinalizado = tgt.includes("final");
      const setEntregado = tgt.includes("entreg");

      // Actualizamos campos textuales
      await updateOrdenFields({
        idOrden,
        fallaEquipoOrden: fallaEquipoOrden ?? undefined,
        diagnosticoTecnicoOrden: diagnosticoTecnicoOrden ?? undefined,
        diagnosticoAClienteOrden: diagnosticoAClienteOrden ?? undefined,
      });

      // Sellos de tiempo con hora local del servidor (evita desfase UTC)
      const setsNow: string[] = [];
      if (setFinalizado) setsNow.push("fechaHoraFinalizadoOrden");
      if (setEntregado) setsNow.push("fechaHoraEntregadoEquipoOrden");
      if (setsNow.length) {
        const sql = `UPDATE dbo.Orden SET ${setsNow
          .map((c) => `${c} = SYSDATETIME()`)
          .join(", ")} WHERE idOrden = @id`;
        await pool.request().input("id", idOrden).query(sql);
      }
    } else {
      await updateOrdenFields({
        idOrden,
        fallaEquipoOrden: fallaEquipoOrden ?? undefined,
        diagnosticoTecnicoOrden: diagnosticoTecnicoOrden ?? undefined,
        diagnosticoAClienteOrden: diagnosticoAClienteOrden ?? undefined,
        fechaHoraFinalizadoOrden: fechaHoraFinalizadoOrden ?? undefined,
        fechaHoraEntregadoEquipoOrden:
          fechaHoraEntregadoEquipoOrden ?? undefined,
      });
    }
    if (idEstadoPresupuesto) {
      if (montoPresupuesto != null) {
        await upsertPresupuesto(
          idOrden,
          Number(montoPresupuesto),
          Number(idEstadoPresupuesto)
        );
      } else {
        await setPresupuestoEstado(idOrden, Number(idEstadoPresupuesto));
      }
    }
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Error" });
  }
}
