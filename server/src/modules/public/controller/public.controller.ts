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
         WHERE o.idOrden = @idOrden AND o.anulado = 0 AND e.anulado = 0 AND c.anulado = 0`
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
      fechaHoraEntregadoEquipoOrden,
      nombreEstadoOrden,
      idEstadoOrden,
      diagnosticoAClienteOrden,
      nombreEstadoPresupuesto,
      idEstadoPresupuesto,
      montoPresupuesto,
      fotoEquipo,
    } = data as any;

    // Construir URL accesible si la ruta apunta a /uploads
    let fotoUrl: string | null = null;
    if (typeof fotoEquipo === "string" && fotoEquipo) {
      const p = fotoEquipo.replace(/\\/g, "/");
      if (p.startsWith("/uploads") || p.includes("/uploads/")) {
        const base = `${req.protocol}://${req.get("host")}`;
        fotoUrl = p.startsWith("/") ? `${base}${p}` : `${base}/${p}`;
      } else {
        // Si es una URL absoluta ya
        if (/^https?:\/\//i.test(p)) fotoUrl = p;
      }
    }

    // Traer datos de garantía si existen
    let garantia: {
      tiempoOrdenGarantia: string | null;
      trabajoOrdenGarantia: string | null;
      venceEl: string | null;
    } | null = null;
    try {
      const pool2 = await getPool();
      const { recordset: gset } = await pool2
        .request()
        .input("idOrden", idOrden)
        .query(
          `SELECT tiempoOrdenGarantia, trabajoOrdenGarantia FROM dbo.OrdenGarantia WHERE idOrden = @idOrden`
        );
      if (gset?.[0]) {
        const tiempo = gset[0].tiempoOrdenGarantia as string | null;
        const trabajo = gset[0].trabajoOrdenGarantia as string | null;
        let vence: string | null = null;
        if (tiempo && fechaHoraEntregadoEquipoOrden) {
          // Intento simple: si el tiempo contiene número + palabra (día/mes/año), calcular fin
          const m = String(tiempo)
            .toLowerCase()
            .match(/(\d+)\s*(dia|d[ií]as|mes|meses|a[nñ]o|a[nñ]os)/);
          if (m) {
            const n = parseInt(m[1], 10);
            const unit = m[2];
            const d0 = new Date(fechaHoraEntregadoEquipoOrden);
            const d = new Date(d0);
            if (/dia|d[ií]as/.test(unit)) d.setDate(d.getDate() + n);
            else if (/mes|meses/.test(unit)) d.setMonth(d.getMonth() + n);
            else if (/a[nñ]o|a[nñ]os/.test(unit))
              d.setFullYear(d.getFullYear() + n);
            vence = d.toISOString();
          }
        }
        garantia = {
          tiempoOrdenGarantia: tiempo ?? null,
          trabajoOrdenGarantia: trabajo ?? null,
          venceEl: vence,
        };
      }
    } catch {}

    res.json({
      idOrden: id,
      fechaHoraCreadoOrden,
      fechaHoraEntregadoEquipoOrden,
      nombreEstadoOrden,
      idEstadoOrden,
      diagnosticoAClienteOrden,
      nombreEstadoPresupuesto,
      idEstadoPresupuesto,
      montoPresupuesto,
      fotoEquipo: fotoEquipo ?? null,
      fotoUrl,
      garantia,
    });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Error" });
  }
}
