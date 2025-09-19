import {
  listPresupuestos,
  type Presupuesto,
} from "../repository/presupuestos.repository.js";

export async function getPresupuestos(): Promise<Presupuesto[]> {
  return listPresupuestos();
}
