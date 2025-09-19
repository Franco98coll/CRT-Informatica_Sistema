import { getPool } from "../../../config/db.js";

export type EstadoOrden = { idEstadoOrden: number; nombreEstadoOrden: string };
export type EstadoPresupuesto = {
  idEstadoPresupuesto: number;
  nombreEstadoPresupuesto: string;
};

export type EquipoMarca = { idEquipoMarca: number; marcaEquipo: string };
export type EquipoAccesorio = {
  idEquipoAccesorio: number;
  accesorio: string;
};

export async function listEstadoOrden(): Promise<EstadoOrden[]> {
  const pool = await getPool();
  const { recordset } = await pool
    .request()
    .query(
      `SELECT idOrdenEstado AS idEstadoOrden, nombreEstadoOrden FROM dbo.OrdenEstado ORDER BY idOrdenEstado`
    );
  return recordset as EstadoOrden[];
}

export async function listEstadoPresupuesto(): Promise<EstadoPresupuesto[]> {
  const pool = await getPool();
  const { recordset } = await pool
    .request()
    .query(
      `SELECT idPresupuestoEstado AS idEstadoPresupuesto, nombreEstadoPresupuesto FROM dbo.PresupuestoEstado ORDER BY idPresupuestoEstado`
    );
  return recordset as EstadoPresupuesto[];
}

export async function searchMarcas(q?: string): Promise<EquipoMarca[]> {
  const pool = await getPool();
  const req = pool.request();
  if (q && q.trim()) {
    req.input("q", `%${q.trim()}%`);
    const { recordset } = await req.query(
      `SELECT TOP (20) idEquipoMarca, marcaEquipo
       FROM dbo.EquipoMarca
       WHERE marcaEquipo LIKE @q
       ORDER BY marcaEquipo`
    );
    return recordset as EquipoMarca[];
  }
  const { recordset } = await req.query(
    `SELECT TOP (20) idEquipoMarca, marcaEquipo FROM dbo.EquipoMarca ORDER BY marcaEquipo`
  );
  return recordset as EquipoMarca[];
}

export async function searchAccesorios(q?: string): Promise<EquipoAccesorio[]> {
  const pool = await getPool();
  const req = pool.request();
  if (q && q.trim()) {
    req.input("q", `%${q.trim()}%`);
    const { recordset } = await req.query(
      `SELECT TOP (20) idEquipoAccesorio, accesorio
       FROM dbo.EquipoAccesorio
       WHERE accesorio LIKE @q
       ORDER BY accesorio`
    );
    return recordset as EquipoAccesorio[];
  }
  const { recordset } = await req.query(
    `SELECT TOP (20) idEquipoAccesorio, accesorio FROM dbo.EquipoAccesorio ORDER BY accesorio`
  );
  return recordset as EquipoAccesorio[];
}
