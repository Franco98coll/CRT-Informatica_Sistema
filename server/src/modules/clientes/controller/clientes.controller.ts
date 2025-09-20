import type { Request, Response } from "express";
import {
  getClientes,
  findClientes,
  addCliente,
  editCliente,
  removeCliente,
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

export async function update(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const { NombreCliente, TelefonoCliente, DocumentoCliente } = req.body || {};
    if (!id || Number.isNaN(id))
      return res.status(400).json({ error: "id inválido" });
    if (!NombreCliente || typeof NombreCliente !== "string") {
      return res.status(400).json({ error: "NombreCliente requerido" });
    }
    await editCliente(id, {
      NombreCliente,
      TelefonoCliente: TelefonoCliente ?? null,
      DocumentoCliente: DocumentoCliente ?? null,
    });
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Error" });
  }
}

export async function remove(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (!id || Number.isNaN(id))
      return res.status(400).json({ error: "id inválido" });
    await removeCliente(id);
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Error" });
  }
}
