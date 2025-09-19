import type { Request, Response } from "express";
import { getPool } from "../../../config/db.js";

export async function topMarcas(req: Request, res: Response) {
  try {
    const limit = Number(req.query.limit || 8);
    const pool = await getPool();
    const q = `
      SELECT TOP (@limit)
        COALESCE(em.marcaEquipo, e.marcaEquipo, 'Sin marca') AS marca,
        COUNT(*) AS total
      FROM dbo.Orden o
      JOIN dbo.Equipo e ON e.idEquipo = o.idEquipo
      LEFT JOIN dbo.EquipoMarca em ON em.idEquipoMarca = e.idMarcaEquipo
      GROUP BY COALESCE(em.marcaEquipo, e.marcaEquipo, 'Sin marca')
      ORDER BY total DESC`;
    const { recordset } = await pool.request().input("limit", limit).query(q);
    res.json(
      recordset.map((r: any) => ({ label: r.marca, value: Number(r.total) }))
    );
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Error" });
  }
}

export async function topClientes(req: Request, res: Response) {
  try {
    const limit = Number(req.query.limit || 8);
    const pool = await getPool();
    const q = `
      SELECT TOP (@limit)
        c.NombreCliente AS cliente,
        COUNT(*) AS total
      FROM dbo.Orden o
      JOIN dbo.Equipo e ON e.idEquipo = o.idEquipo
      JOIN dbo.Cliente c ON c.idCliente = e.idCliente
      GROUP BY c.NombreCliente
      ORDER BY total DESC`;
    const { recordset } = await pool.request().input("limit", limit).query(q);
    res.json(
      recordset.map((r: any) => ({ label: r.cliente, value: Number(r.total) }))
    );
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Error" });
  }
}

export async function avgFinalization(req: Request, res: Response) {
  try {
    const pool = await getPool();
    const q = `
      SELECT AVG(CAST(DATEDIFF(SECOND, o.fechaHoraCreadoOrden, o.fechaHoraFinalizadoOrden) AS BIGINT)) AS avgSeconds
      FROM dbo.Orden o
      WHERE o.fechaHoraFinalizadoOrden IS NOT NULL`;
    const { recordset } = await pool.request().query(q);
    const seconds = Number(recordset[0]?.avgSeconds || 0);
    res.json({ seconds });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Error" });
  }
}
