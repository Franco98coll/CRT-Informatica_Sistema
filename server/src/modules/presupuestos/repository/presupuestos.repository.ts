import { getPool } from "../../../config/db.js";
import sql from "../../../config/db.js";

export type Presupuesto = {
  idOrden: number;
  fechaHoraCreadoPresupuesto: string;
  montoPresupuesto: string;
  idEstadoPresupuesto: number;
};

export async function listPresupuestos(): Promise<Presupuesto[]> {
  const pool = await getPool();
  const { recordset } = await pool.request().query(
    `SELECT TOP (200)
       idOrden,
       CONVERT(varchar(19), fechaHoraCreadoPresupuesto, 126) AS fechaHoraCreadoPresupuesto,
       CONVERT(varchar(32), montoPresupuesto) AS montoPresupuesto,
       idPresupuestoEstado AS idEstadoPresupuesto
    FROM dbo.Presupuesto p
    JOIN dbo.Orden o ON o.idOrden = p.idOrden
    WHERE o.anulado = 0
     ORDER BY idOrden DESC`
  );
  return recordset as Presupuesto[];
}

export async function upsertPresupuesto(
  idOrden: number,
  monto: number,
  idEstadoPresupuesto: number
): Promise<void> {
  const pool = await getPool();
  const req = pool
    .request()
    .input("idOrden", idOrden)
    .input("monto", sql.Decimal(18, 2), monto)
    .input("idPresupuestoEstado", idEstadoPresupuesto);

  await req.query(`
    MERGE dbo.Presupuesto AS tgt
    USING (SELECT @idOrden AS idOrden) AS src
    ON tgt.idOrden = src.idOrden
    WHEN MATCHED THEN
      UPDATE SET montoPresupuesto = @monto, idPresupuestoEstado = @idPresupuestoEstado
    WHEN NOT MATCHED THEN
      INSERT (idOrden, fechaHoraCreadoPresupuesto, montoPresupuesto, idPresupuestoEstado)
      VALUES (@idOrden, SYSUTCDATETIME(), @monto, @idPresupuestoEstado);
  `);
}

export async function setPresupuestoEstado(
  idOrden: number,
  idEstadoPresupuesto: number
): Promise<void> {
  const pool = await getPool();
  const req = pool
    .request()
    .input("idOrden", idOrden)
    .input("idPresupuestoEstado", idEstadoPresupuesto);
  await req.query(`
    MERGE dbo.Presupuesto AS tgt
    USING (SELECT @idOrden AS idOrden) AS src
    ON tgt.idOrden = src.idOrden
    WHEN MATCHED THEN
      UPDATE SET idPresupuestoEstado = @idPresupuestoEstado
    WHEN NOT MATCHED THEN
      INSERT (idOrden, fechaHoraCreadoPresupuesto, montoPresupuesto, idPresupuestoEstado)
      VALUES (@idOrden, SYSUTCDATETIME(), 0, @idPresupuestoEstado);
  `);
}
