import { getPool } from "../../../config/db.js";
import sql from "../../../config/db.js";

export type Equipo = {
  idEquipo: number;
  marcaEquipo: string | null;
  modeloEquipo: string | null;
  numeroDeSerieEquipo: string | null;
  fotoEquipo: string | null;
  idCliente: number;
};

export type CreateEquipoInput = {
  marcaEquipo?: string | null;
  modeloEquipo?: string | null;
  numeroDeSerieEquipo: string;
  fotoEquipo?: string | null;
  idCliente: number;
  idMarcaEquipo?: number | null;
  idEquipoAccesorio?: number | null;
  idsEquipoAccesorio?: number[] | null;
};

export async function listEquipos(): Promise<Equipo[]> {
  const pool = await getPool();
  const { recordset } = await pool.request().query(
    `SELECT TOP (200)
       idEquipo, marcaEquipo, modeloEquipo, numeroDeSerieEquipo, fotoEquipo, idCliente
     FROM dbo.Equipo
     ORDER BY idEquipo DESC`
  );
  return recordset as Equipo[];
}

export async function getEquipoBySerial(
  serial: string
): Promise<Equipo | null> {
  const pool = await getPool();
  const req = pool.request().input("serial", serial);
  const { recordset } = await req.query(
    `SELECT TOP (1)
       idEquipo, marcaEquipo, modeloEquipo, numeroDeSerieEquipo, fotoEquipo, idCliente
     FROM dbo.Equipo
     WHERE numeroDeSerieEquipo = @serial`
  );
  return (recordset[0] as Equipo) || null;
}

export async function createEquipo(input: CreateEquipoInput): Promise<number> {
  const pool = await getPool();
  const req = pool
    .request()
    .input("marcaEquipo", sql.NVarChar(100), input.marcaEquipo ?? null)
    .input("modeloEquipo", sql.NVarChar(100), input.modeloEquipo ?? null)
    .input("numeroDeSerieEquipo", sql.NVarChar(100), input.numeroDeSerieEquipo)
    .input("fotoEquipo", sql.NVarChar(500), input.fotoEquipo ?? null)
    .input("idCliente", input.idCliente)
    .input("idMarcaEquipo", input.idMarcaEquipo ?? null)
    .input("idEquipoAccesorio", input.idEquipoAccesorio ?? null);

  const { recordset } = await req.query(
    `INSERT INTO dbo.Equipo (marcaEquipo, modeloEquipo, numeroDeSerieEquipo, fotoEquipo, idCliente, idMarcaEquipo, idEquipoAccesorio)
     OUTPUT INSERTED.idEquipo AS id
     VALUES (@marcaEquipo, @modeloEquipo, @numeroDeSerieEquipo, @fotoEquipo, @idCliente, @idMarcaEquipo, @idEquipoAccesorio);`
  );
  const newId = recordset[0]?.id as number;

  if (input.idsEquipoAccesorio && input.idsEquipoAccesorio.length) {
    for (const accId of input.idsEquipoAccesorio) {
      const accReq = pool
        .request()
        .input("idEquipo", newId)
        .input("idEquipoAccesorio", accId);
      await accReq.query(
        `INSERT INTO dbo.EquipoAccesorioItem (idEquipo, idEquipoAccesorio)
         VALUES (@idEquipo, @idEquipoAccesorio)`
      );
    }
  }

  return newId;
}
