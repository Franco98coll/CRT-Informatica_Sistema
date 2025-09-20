import { getPool } from "../../../config/db.js";
import sql from "../../../config/db.js";

export type Cliente = {
  idCliente: number;
  NombreCliente: string;
  TelefonoCliente: string | null;
  DocumentoCliente: string | null;
};

export type CreateClienteInput = {
  NombreCliente: string;
  TelefonoCliente?: string | null;
  DocumentoCliente?: string | null;
};

export async function listClientes(): Promise<Cliente[]> {
  const pool = await getPool();
  const { recordset } = await pool.request().query(
    `SELECT TOP (200)
       idCliente,
       NombreCliente,
       TelefonoCliente,
       DocumentoCliente
     FROM dbo.Cliente
     WHERE anulado = 0
     ORDER BY idCliente DESC`
  );
  return recordset as Cliente[];
}

export async function searchClientes(term: string): Promise<Cliente[]> {
  const pool = await getPool();
  const like = `%${term}%`;
  const req = pool
    .request()
    .input("term", like)
    .input("term2", like)
    .input("term3", like);
  const { recordset } = await req.query(
    `SELECT TOP (50)
       idCliente, NombreCliente, TelefonoCliente, DocumentoCliente
     FROM dbo.Cliente
    WHERE anulado = 0 AND (NombreCliente LIKE @term
        OR TelefonoCliente LIKE @term2
      OR DocumentoCliente LIKE @term3)
     ORDER BY idCliente DESC`
  );
  return recordset as Cliente[];
}

export async function createCliente(
  input: CreateClienteInput
): Promise<number> {
  const pool = await getPool();
  const req = pool
    .request()
    .input("NombreCliente", sql.NVarChar(150), input.NombreCliente)
    .input("TelefonoCliente", sql.NVarChar(30), input.TelefonoCliente ?? null)
    .input(
      "DocumentoCliente",
      sql.NVarChar(30),
      input.DocumentoCliente ?? null
    );

  const { recordset } = await req.query(
    `INSERT INTO dbo.Cliente (NombreCliente, TelefonoCliente, DocumentoCliente)
     OUTPUT INSERTED.idCliente AS id
     VALUES (@NombreCliente, @TelefonoCliente, @DocumentoCliente);`
  );
  return recordset[0]?.id as number;
}

export async function updateCliente(
  idCliente: number,
  input: CreateClienteInput
): Promise<void> {
  const pool = await getPool();
  const req = pool
    .request()
    .input("idCliente", sql.Int, idCliente)
    .input("NombreCliente", sql.NVarChar(150), input.NombreCliente)
    .input("TelefonoCliente", sql.NVarChar(30), input.TelefonoCliente ?? null)
    .input(
      "DocumentoCliente",
      sql.NVarChar(30),
      input.DocumentoCliente ?? null
    );

  await req.query(
    `UPDATE dbo.Cliente
     SET NombreCliente = @NombreCliente,
         TelefonoCliente = @TelefonoCliente,
         DocumentoCliente = @DocumentoCliente
     WHERE idCliente = @idCliente`
  );
}

export async function deleteCliente(idCliente: number): Promise<void> {
  const pool = await getPool();
  const req = pool.request().input("idCliente", sql.Int, idCliente);
  await req.query(
    `UPDATE dbo.Cliente SET anulado = 1 WHERE idCliente = @idCliente`
  );
}
