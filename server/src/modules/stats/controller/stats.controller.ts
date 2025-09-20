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
  WHERE o.anulado = 0 AND e.anulado = 0
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
  WHERE o.anulado = 0 AND e.anulado = 0 AND c.anulado = 0
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
  WHERE o.fechaHoraFinalizadoOrden IS NOT NULL AND o.anulado = 0`;
    const { recordset } = await pool.request().query(q);
    const seconds = Number(recordset[0]?.avgSeconds || 0);
    res.json({ seconds });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Error" });
  }
}

export async function presupuestoPercent(req: Request, res: Response) {
  try {
    const pool = await getPool();
    const q = `
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN LOWER(pe.nombreEstadoPresupuesto) LIKE '%apro%' OR LOWER(pe.nombreEstadoPresupuesto) LIKE '%acep%' THEN 1 ELSE 0 END) AS approved,
        SUM(CASE WHEN LOWER(pe.nombreEstadoPresupuesto) LIKE '%rech%' OR LOWER(pe.nombreEstadoPresupuesto) LIKE '%nega%' THEN 1 ELSE 0 END) AS rejected
  FROM dbo.Presupuesto p
  JOIN dbo.PresupuestoEstado pe ON pe.idPresupuestoEstado = p.idPresupuestoEstado
  JOIN dbo.Orden o ON o.idOrden = p.idOrden
  WHERE o.anulado = 0`;
    const { recordset } = await pool.request().query(q);
    const row = recordset[0] || {};
    const total = Number(row.total || 0);
    const approved = Number(row.approved || 0);
    const rejected = Number(row.rejected || 0);
    const other = Math.max(total - approved - rejected, 0);
    const approvedPct = total ? Math.round((approved / total) * 100) : 0;
    const rejectedPct = total ? Math.round((rejected / total) * 100) : 0;
    res.json({ total, approved, rejected, other, approvedPct, rejectedPct });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Error" });
  }
}

export async function ingresosMensuales(req: Request, res: Response) {
  try {
    const months = Math.min(Math.max(Number(req.query.months || 12), 1), 36);
    const pool = await getPool();
    const q = `
      WITH range AS (
        SELECT CAST(DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1) AS DATE) AS startMonth,
                 CAST(DATEADD(MONTH, -(@months-1), DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1)) AS DATE) AS minMonth
      )
      SELECT
        FORMAT(DATEFROMPARTS(YEAR(p.fechaHoraCreadoPresupuesto), MONTH(p.fechaHoraCreadoPresupuesto), 1), 'yyyy-MM') AS ym,
        SUM(CAST(p.montoPresupuesto AS DECIMAL(18,2))) AS total
      FROM dbo.Presupuesto p
      JOIN dbo.PresupuestoEstado pe ON pe.idPresupuestoEstado = p.idPresupuestoEstado
      JOIN dbo.Orden o ON o.idOrden = p.idOrden
      CROSS JOIN range r
      WHERE (LOWER(pe.nombreEstadoPresupuesto) LIKE '%apro%' OR LOWER(pe.nombreEstadoPresupuesto) LIKE '%acep%')
        AND p.fechaHoraCreadoPresupuesto >= r.minMonth
        AND o.anulado = 0
      GROUP BY FORMAT(DATEFROMPARTS(YEAR(p.fechaHoraCreadoPresupuesto), MONTH(p.fechaHoraCreadoPresupuesto), 1), 'yyyy-MM')
      ORDER BY ym ASC`;
    const { recordset } = await pool.request().input("months", months).query(q);

    // Construye la serie completa de meses con 0 si no hay datos
    const now = new Date();
    const series: { month: string; total: number }[] = [];
    const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
    const map = new Map<string, number>();
    for (const r of recordset) map.set(String(r.ym), Number(r.total || 0));
    for (let i = 0; i < months; i++) {
      const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      series.push({ month: key, total: map.get(key) || 0 });
    }
    res.json(series);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Error" });
  }
}
