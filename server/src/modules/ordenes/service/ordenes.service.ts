import { listOrdenes, type Orden } from "../repository/ordenes.repository.js";

export async function getOrdenes(): Promise<Orden[]> {
  return listOrdenes();
}
