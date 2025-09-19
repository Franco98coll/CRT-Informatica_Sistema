import {
  listEstadoOrden,
  listEstadoPresupuesto,
  type EstadoOrden,
  type EstadoPresupuesto,
  type EquipoMarca,
  type EquipoAccesorio,
  searchMarcas,
  searchAccesorios,
} from "../repository/catalogos.repository.js";

export const getEstadoOrden = (): Promise<EstadoOrden[]> => listEstadoOrden();
export const getEstadoPresupuesto = (): Promise<EstadoPresupuesto[]> =>
  listEstadoPresupuesto();

export const findMarcas = (q: string): Promise<EquipoMarca[]> =>
  searchMarcas(q);
export const findAccesorios = (q: string): Promise<EquipoAccesorio[]> =>
  searchAccesorios(q);
