import {
  listClientes,
  searchClientes,
  createCliente,
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
