import {
  createOrden,
  type CreateOrdenInput,
} from "../repository/ordenes.ext.repository.js";

export const addOrden = (input: CreateOrdenInput): Promise<number> =>
  createOrden(input);
