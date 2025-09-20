import axios from "axios";

export type Cliente = {
  idCliente: number;
  NombreCliente: string;
  TelefonoCliente: string | null;
  DocumentoCliente: string | null;
};

export type ClienteInput = {
  NombreCliente: string;
  TelefonoCliente?: string | null;
  DocumentoCliente?: string | null;
};

export async function listClientes() {
  const { data } = await axios.get<Cliente[]>(`/api/clientes`);
  return data;
}

export async function searchClientes(term: string) {
  const { data } = await axios.get<Cliente[]>(`/api/clientes/search`, {
    params: { term },
  });
  return data;
}

export async function createCliente(input: ClienteInput) {
  const { data } = await axios.post<{ id: number }>(`/api/clientes`, input);
  return data.id;
}

export async function updateCliente(id: number, input: ClienteInput) {
  await axios.put(`/api/clientes/${id}`, input);
}

export async function deleteCliente(id: number) {
  await axios.delete(`/api/clientes/${id}`);
}
