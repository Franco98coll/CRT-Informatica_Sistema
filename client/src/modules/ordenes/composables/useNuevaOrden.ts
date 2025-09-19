import axios from "axios";

export type Cliente = {
  idCliente: number;
  NombreCliente: string;
  TelefonoCliente?: string | null;
  DocumentoCliente?: string | null;
};
export type Equipo = {
  idEquipo: number;
  numeroDeSerieEquipo: string;
  marcaEquipo?: string | null;
  modeloEquipo?: string | null;
  fotoEquipo?: string | null;
  idCliente: number;
};

export function useNuevaOrden() {
  const searchClientes = async (term: string) => {
    if (!term) return [] as Cliente[];
    const { data } = await axios.get<Cliente[]>(`/api/clientes/search`, {
      params: { term },
    });
    return data;
  };

  const createCliente = async (
    payload: Partial<Cliente> & { NombreCliente: string }
  ) => {
    const { data } = await axios.post<{ id: number }>(`/api/clientes`, payload);
    return data.id;
  };

  const getEquipoBySerial = async (serial: string) => {
    const { data } = await axios.get<Equipo>(
      `/api/equipos/by-serial/${encodeURIComponent(serial)}`
    );
    return data;
  };

  const createEquipo = async (payload: {
    numeroDeSerieEquipo: string;
    idCliente: number;
    marcaEquipo?: string | null;
    modeloEquipo?: string | null;
    // foto puede ser URL (string) o archivo (File)
    foto?: File | null;
    fotoEquipo?: string | null;
    idMarcaEquipo?: number | null;
    idEquipoAccesorio?: number | null;
    idsEquipoAccesorio?: number[] | null;
  }) => {
    // Si viene File, enviamos multipart/form-data
    if (payload.foto instanceof File) {
      const fd = new FormData();
      fd.append("numeroDeSerieEquipo", payload.numeroDeSerieEquipo);
      fd.append("idCliente", String(payload.idCliente));
      if (payload.marcaEquipo != null)
        fd.append("marcaEquipo", payload.marcaEquipo);
      if (payload.modeloEquipo != null)
        fd.append("modeloEquipo", payload.modeloEquipo);
      if (payload.idMarcaEquipo != null)
        fd.append("idMarcaEquipo", String(payload.idMarcaEquipo));
      if (payload.idEquipoAccesorio != null)
        fd.append("idEquipoAccesorio", String(payload.idEquipoAccesorio));
      if (payload.idsEquipoAccesorio && payload.idsEquipoAccesorio.length)
        fd.append(
          "idsEquipoAccesorio",
          JSON.stringify(payload.idsEquipoAccesorio)
        );
      fd.append("foto", payload.foto);
      const { data } = await axios.post<{ id: number }>(`/api/equipos`, fd);
      return data.id;
    } else {
      // caso URL o sin foto
      const body: any = {
        numeroDeSerieEquipo: payload.numeroDeSerieEquipo,
        idCliente: payload.idCliente,
        marcaEquipo: payload.marcaEquipo ?? null,
        modeloEquipo: payload.modeloEquipo ?? null,
      };
      if (payload.fotoEquipo != null) body.fotoEquipo = payload.fotoEquipo;
      if (payload.idMarcaEquipo != null)
        body.idMarcaEquipo = payload.idMarcaEquipo;
      if (payload.idEquipoAccesorio != null)
        body.idEquipoAccesorio = payload.idEquipoAccesorio;
      if (payload.idsEquipoAccesorio)
        body.idsEquipoAccesorio = payload.idsEquipoAccesorio;
      const { data } = await axios.post<{ id: number }>(`/api/equipos`, body);
      return data.id;
    }
  };

  const createOrden = async (payload: {
    idEquipo: number;
    fallaEquipoOrden?: string | null;
    diagnosticoTecnicoOrden?: string | null;
    diagnosticoAClienteOrden?: string | null;
  }) => {
    const { data } = await axios.post<{ id: number }>(`/api/ordenes`, payload);
    return data.id;
  };

  return {
    searchClientes,
    createCliente,
    getEquipoBySerial,
    createEquipo,
    createOrden,
  };
}
