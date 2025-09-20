import {
  listClientes,
  searchClientes,
  createCliente,
  updateCliente,
  deleteCliente,
  type Cliente,
  type CreateClienteInput,
} from "../repository/clientes.repository.js";

export async function getClientes(): Promise<Cliente[]> {
  return listClientes();
}

export async function findClientes(term: string): Promise<Cliente[]> {
  return searchClientes(term);
}

export async function addCliente(input: CreateClienteInput): Promise<number> {
  return createCliente(input);
}

export async function editCliente(id: number, input: CreateClienteInput) {
  return updateCliente(id, input);
}

export async function removeCliente(id: number) {
  return deleteCliente(id);
}
