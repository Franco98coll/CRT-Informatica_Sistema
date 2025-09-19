import type { Request, Response } from "express";
import {
  getClientes,
  findClientes,
  addCliente,
} from "../service/clientes.service.js";

export async function list(_req: Request, res: Response) {
  try {
    const data = await getClientes();
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Error" });
  }
}

export async function search(req: Request, res: Response) {
  try {
    const term = String(req.query.term || "").trim();
    if (!term) return res.json([]);
    const data = await findClientes(term);
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Error" });
  }
}

export async function create(req: Request, res: Response) {
  try {
    const { NombreCliente, TelefonoCliente, DocumentoCliente } = req.body || {};
    if (!NombreCliente || typeof NombreCliente !== "string") {
      return res.status(400).json({ error: "NombreCliente requerido" });
    }
    const id = await addCliente({
      NombreCliente,
      TelefonoCliente: TelefonoCliente ?? null,
      DocumentoCliente: DocumentoCliente ?? null,
    });
    res.status(201).json({ id });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Error" });
  }
}
