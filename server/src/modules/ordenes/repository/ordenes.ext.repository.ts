import { getPool } from "../../../config/db.js";

export type CreateOrdenInput = {
  idEquipo: number;
  fallaEquipoOrden?: string | null;
  diagnosticoTecnicoOrden?: string | null;
  diagnosticoAClienteOrden?: string | null;
  idEstadoOrden?: number | null; // opcional, si no se pasa se usa 'Creada'
};

export async function createOrden(input: CreateOrdenInput): Promise<number> {
  const pool = await getPool();
  const req = pool
    .request()
    .input("idEquipo", input.idEquipo)
    .input("fallaEquipoOrden", input.fallaEquipoOrden ?? null)
    .input("diagnosticoTecnicoOrden", input.diagnosticoTecnicoOrden ?? null)
    .input("diagnosticoAClienteOrden", input.diagnosticoAClienteOrden ?? null)
    .input("idOrdenEstado", input.idEstadoOrden ?? null);

  const sql = `
    DECLARE @estadoCreada INT = COALESCE(@idOrdenEstado, (
      SELECT TOP 1 idOrdenEstado FROM dbo.OrdenEstado WHERE nombreEstadoOrden = N'Creada' ORDER BY idOrdenEstado
    ));
    DECLARE @idCliente INT = (SELECT TOP 1 e.idCliente FROM dbo.Equipo e WHERE e.idEquipo = @idEquipo);
    INSERT INTO dbo.Orden (
      idEquipo, idCliente, fallaEquipoOrden, diagnosticoTecnicoOrden, diagnosticoAClienteOrden, idOrdenEstado
    )
    OUTPUT INSERTED.idOrden AS id
    VALUES (@idEquipo, @idCliente, @fallaEquipoOrden, @diagnosticoTecnicoOrden, @diagnosticoAClienteOrden, @estadoCreada);
  `;

  const { recordset } = await req.query(sql);
  return recordset[0]?.id as number;
}
