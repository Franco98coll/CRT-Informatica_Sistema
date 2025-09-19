import { getPool } from "../../../config/db.js";
import sql from "../../../config/db.js";

type User = {
  id: number;
  name: string;
  email: string;
};

export async function listUsers(): Promise<User[]> {
  try {
    const pool = await getPool();
    const result = await pool.request().query(
      `SELECT TOP (20)
           idUsuario   as id,
           nombreUsuario as name,
           mailUsuario   as email
         FROM dbo.Usuario`
    );
    return result.recordset as User[];
  } catch (e) {
    console.error("Error listUsers:", e);
    // Fallback mock para desarrollo sin DB
    return [
      { id: 1, name: "Alice", email: "alice@example.com" },
      { id: 2, name: "Bob", email: "bob@example.com" },
    ];
  }
}

export async function updateUserPassword(
  id: number,
  hashedPassword: string
): Promise<void> {
  const pool = await getPool();
  await pool
    .request()
    .input("id", sql.Int, id)
    .input("pass", sql.NVarChar(255), hashedPassword)
    .query(
      `UPDATE dbo.Usuario
       SET contraseñaUsuario = @pass
       WHERE idUsuario = @id`
    );
}
