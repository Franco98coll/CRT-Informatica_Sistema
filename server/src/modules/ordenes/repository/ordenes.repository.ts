import { getPool } from "../../../config/db.js";

export type Orden = {
  idOrden: number;
  fechaHoraCreadoOrden: string;
  fechaHoraFinalizadoOrden: string | null;
  fechaHoraEntregadoEquipoOrden: string | null;
  idEquipo: number;
  idEstadoOrden: number;
};

export async function listOrdenes(): Promise<Orden[]> {
  const pool = await getPool();
  const { recordset } = await pool.request().query(
    `SELECT TOP (200)
       idOrden,
       CONVERT(varchar(19), fechaHoraCreadoOrden, 126) AS fechaHoraCreadoOrden,
       CONVERT(varchar(19), fechaHoraFinalizadoOrden, 126) AS fechaHoraFinalizadoOrden,
       CONVERT(varchar(19), fechaHoraEntregadoEquipoOrden, 126) AS fechaHoraEntregadoEquipoOrden,
       idEquipo,
       idEstadoOrden
     FROM dbo.Orden
    WHERE anulado = 0
     ORDER BY idOrden DESC`
  );
  return recordset as Orden[];
}

export type OrdenFull = {
  idOrden: number;
  fechaHoraCreadoOrden: string;
  numeroDeSerieEquipo: string | null;
  fotoEquipo?: string | null;
  NombreCliente: string;
  nombreEstadoOrden: string;
  idEstadoOrden?: number;
  montoPresupuesto: string | null;
  nombreEstadoPresupuesto: string | null;
  idEstadoPresupuesto?: number | null;
  fallaEquipoOrden?: string | null;
  diagnosticoTecnicoOrden?: string | null;
  diagnosticoAClienteOrden?: string | null;
};

export async function listOrdenesFull(filters?: {
  qCliente?: string;
  idEstadoOrden?: number;
  fechaDesde?: string; // YYYY-MM-DD
  fechaHasta?: string; // YYYY-MM-DD
}): Promise<OrdenFull[]> {
  const pool = await getPool();
  const req = pool.request();
  const where: string[] = [];
  if (filters?.qCliente && filters.qCliente.trim()) {
    req.input("qCliente", `%${filters.qCliente.trim()}%`);
    where.push(
      `(c.NombreCliente LIKE @qCliente OR c.TelefonoCliente LIKE @qCliente OR c.DocumentoCliente LIKE @qCliente)`
    );
  }
  if (filters?.idEstadoOrden) {
    req.input("idEstadoOrden", filters.idEstadoOrden);
    where.push(`o.idOrdenEstado = @idEstadoOrden`);
  }
  if (filters?.fechaDesde) {
    req.input("fechaDesde", filters.fechaDesde);
    where.push(`CONVERT(date, o.fechaHoraCreadoOrden) >= @fechaDesde`);
  }
  if (filters?.fechaHasta) {
    req.input("fechaHasta", filters.fechaHasta);
    where.push(`CONVERT(date, o.fechaHoraCreadoOrden) <= @fechaHasta`);
  }
  // Filtrar registros anulados
  where.push("o.anulado = 0", "e.anulado = 0", "c.anulado = 0");
  const whereSql = `WHERE ${where.join(" AND ")}`;
  const { recordset } = await req.query(
    `SELECT TOP (300)
       o.idOrden,
       CONVERT(varchar(19), o.fechaHoraCreadoOrden, 126) AS fechaHoraCreadoOrden,
       e.numeroDeSerieEquipo,
       e.fotoEquipo,
       c.NombreCliente,
     oe.nombreEstadoOrden,
     o.idOrdenEstado AS idEstadoOrden,
       CONVERT(varchar(32), p.montoPresupuesto) AS montoPresupuesto,
     pe.nombreEstadoPresupuesto,
     p.idPresupuestoEstado AS idEstadoPresupuesto,
       o.fallaEquipoOrden,
       o.diagnosticoTecnicoOrden,
       o.diagnosticoAClienteOrden
    FROM dbo.Orden o
    JOIN dbo.Equipo e ON e.idEquipo = o.idEquipo
    JOIN dbo.Cliente c ON c.idCliente = e.idCliente
     JOIN dbo.OrdenEstado oe ON oe.idOrdenEstado = o.idOrdenEstado
     LEFT JOIN dbo.Presupuesto p ON p.idOrden = o.idOrden
     LEFT JOIN dbo.PresupuestoEstado pe ON pe.idPresupuestoEstado = p.idPresupuestoEstado
     ${whereSql}
     ORDER BY o.idOrden DESC`
  );
  return recordset as OrdenFull[];
}

export async function getOrdenFullById(
  idOrden: number
): Promise<OrdenFull | null> {
  const pool = await getPool();
  const req = pool.request().input("idOrden", idOrden);
  const { recordset } = await req.query(
    `SELECT 
       o.idOrden,
       CONVERT(varchar(19), o.fechaHoraCreadoOrden, 126) AS fechaHoraCreadoOrden,
       e.numeroDeSerieEquipo,
       e.fotoEquipo,
       c.NombreCliente,
       oe.nombreEstadoOrden,
       o.idOrdenEstado AS idEstadoOrden,
       CONVERT(varchar(32), p.montoPresupuesto) AS montoPresupuesto,
     pe.nombreEstadoPresupuesto,
     p.idPresupuestoEstado AS idEstadoPresupuesto,
     o.fallaEquipoOrden,
     o.diagnosticoTecnicoOrden,
     o.diagnosticoAClienteOrden
    FROM dbo.Orden o
    JOIN dbo.Equipo e ON e.idEquipo = o.idEquipo
    JOIN dbo.Cliente c ON c.idCliente = e.idCliente
     JOIN dbo.OrdenEstado oe ON oe.idOrdenEstado = o.idOrdenEstado
     LEFT JOIN dbo.Presupuesto p ON p.idOrden = o.idOrden
     LEFT JOIN dbo.PresupuestoEstado pe ON pe.idPresupuestoEstado = p.idPresupuestoEstado
    WHERE o.idOrden = @idOrden AND o.anulado = 0 AND e.anulado = 0 AND c.anulado = 0`
  );
  return (recordset[0] as OrdenFull) || null;
}

export async function updateEstadoOrden(
  idOrden: number,
  idEstadoOrden: number
): Promise<void> {
  const pool = await getPool();
  await pool
    .request()
    .input("idOrden", idOrden)
    .input("idOrdenEstado", idEstadoOrden)
    .query(
      `UPDATE dbo.Orden SET idOrdenEstado = @idOrdenEstado WHERE idOrden = @idOrden`
    );
}

export async function updateOrdenFields(params: {
  idOrden: number;
  fallaEquipoOrden?: string | null;
  diagnosticoTecnicoOrden?: string | null;
  diagnosticoAClienteOrden?: string | null;
  fechaHoraFinalizadoOrden?: string | null;
  fechaHoraEntregadoEquipoOrden?: string | null;
}): Promise<void> {
  const { idOrden } = params;
  const sets: string[] = [];
  const pool = await getPool();
  const req = pool.request().input("idOrden", idOrden);
  const add = (col: string, val: any) => {
    sets.push(`${col} = @${col}`);
    req.input(col, val);
  };
  if (params.fallaEquipoOrden !== undefined)
    add("fallaEquipoOrden", params.fallaEquipoOrden);
  if (params.diagnosticoTecnicoOrden !== undefined)
    add("diagnosticoTecnicoOrden", params.diagnosticoTecnicoOrden);
  if (params.diagnosticoAClienteOrden !== undefined)
    add("diagnosticoAClienteOrden", params.diagnosticoAClienteOrden);
  if (params.fechaHoraFinalizadoOrden !== undefined)
    add("fechaHoraFinalizadoOrden", params.fechaHoraFinalizadoOrden);
  if (params.fechaHoraEntregadoEquipoOrden !== undefined)
    add("fechaHoraEntregadoEquipoOrden", params.fechaHoraEntregadoEquipoOrden);
  if (!sets.length) return;
  const sql = `UPDATE dbo.Orden SET ${sets.join(
    ", "
  )} WHERE idOrden = @idOrden`;
  await req.query(sql);
}
