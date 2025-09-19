import type { Request, Response } from "express";
import { getOrdenFullById } from "../../ordenes/repository/ordenes.repository.js";
import { getPool } from "../../../config/db.js";

export async function getPublicOrden(req: Request, res: Response) {
  try {
    const idOrden = Number(req.params.id);
    if (!idOrden || Number.isNaN(idOrden)) {
      return res.status(400).json({ error: "idOrden inválido" });
    }
    const documentoParam = (req.query.documento ||
      req.query.doc ||
      "") as string;
    if (!documentoParam) {
      return res.status(400).json({ error: "documento requerido" });
    }

    // Normalizar documento a solo dígitos para comparar DNIs con/ sin puntos, guiones, etc.
    const norm = (s: string | null | undefined) =>
      String(s || "").replace(/\D+/g, "");
    const docIngresado = norm(documentoParam);
    if (!docIngresado) {
      return res.status(400).json({ error: "documento inválido" });
    }

    // Verificar que el documento del cliente propietario de la orden coincida
    const pool = await getPool();
    const { recordset } = await pool
      .request()
      .input("idOrden", idOrden)
      .query(
        `SELECT TOP (1) c.DocumentoCliente AS documento
         FROM dbo.Orden o
         JOIN dbo.Equipo e ON e.idEquipo = o.idEquipo
         JOIN dbo.Cliente c ON c.idCliente = e.idCliente
         WHERE o.idOrden = @idOrden`
      );
    const docDB = norm(recordset?.[0]?.documento ?? "");
    if (!docDB || docDB !== docIngresado) {
      // No revelar si existe o no la orden; devolver 404 para seguridad
      return res.status(404).json({ error: "no encontrado" });
    }
    const data = await getOrdenFullById(idOrden);
    if (!data) return res.status(404).json({ error: "no encontrado" });
    const {
      idOrden: id,
      fechaHoraCreadoOrden,
      nombreEstadoOrden,
      idEstadoOrden,
      diagnosticoAClienteOrden,
      nombreEstadoPresupuesto,
      idEstadoPresupuesto,
      montoPresupuesto,
    } = data;
    res.json({
      idOrden: id,
      fechaHoraCreadoOrden,
      nombreEstadoOrden,
      idEstadoOrden,
      diagnosticoAClienteOrden,
      nombreEstadoPresupuesto,
      idEstadoPresupuesto,
      montoPresupuesto,
    });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Error" });
  }
}
