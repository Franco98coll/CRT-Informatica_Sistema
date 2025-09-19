import { listEquipos, type Equipo } from "../repository/equipos.repository.js";

export async function getEquipos(): Promise<Equipo[]> {
  return listEquipos();
}
