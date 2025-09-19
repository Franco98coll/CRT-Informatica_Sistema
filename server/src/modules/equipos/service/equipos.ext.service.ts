import {
  createEquipo,
  getEquipoBySerial,
  type CreateEquipoInput,
  type Equipo,
} from "../repository/equipos.repository.js";

export const findBySerial = (serial: string): Promise<Equipo | null> =>
  getEquipoBySerial(serial);
export const addEquipo = (input: CreateEquipoInput): Promise<number> =>
  createEquipo(input);
