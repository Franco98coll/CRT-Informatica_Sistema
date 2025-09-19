import axios from "axios";

export type OrdenRow = {
  idOrden: number;
  fechaHoraCreadoOrden: string;
  numeroDeSerieEquipo: string | null;
  fotoEquipo?: string | null;
  NombreCliente: string;
  nombreEstadoOrden: string;
  idEstadoOrden?: number;
  montoPresupuesto: string | null;
  nombreEstadoPresupuesto: string | null;
  idEstadoPresupuesto?: number | null;
  fallaEquipoOrden?: string | null;
  diagnosticoTecnicoOrden?: string | null;
  diagnosticoAClienteOrden?: string | null;
};

export function useOrdenes() {
  const listFull = async (filters?: {
    qCliente?: string;
    idEstadoOrden?: number;
    fechaDesde?: string;
    fechaHasta?: string;
  }) => {
    const { data } = await axios.get<OrdenRow[]>(`/api/ordenes/full`, {
      params: filters,
    });
    return data;
  };
  const getDetail = async (id: number) => {
    const { data } = await axios.get<OrdenRow>(`/api/ordenes/${id}`);
    return data;
  };
  const updateOrden = async (
    id: number,
    payload: {
      idEstadoOrden?: number;
      montoPresupuesto?: number;
      idEstadoPresupuesto?: number;
      fallaEquipoOrden?: string;
      diagnosticoTecnicoOrden?: string;
      diagnosticoAClienteOrden?: string;
    }
  ) => {
    const { data } = await axios.put(`/api/ordenes/${id}`, payload);
    return data;
  };
  return { listFull, getDetail, updateOrden };
}
