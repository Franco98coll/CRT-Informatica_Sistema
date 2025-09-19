import axios from "axios";

export type EquipoMarca = { idEquipoMarca: number; marcaEquipo: string };
export type EquipoAccesorio = {
  idEquipoAccesorio: number;
  accesorio: string;
};

export function useCatalogos() {
  const searchMarcas = async (q: string) => {
    const { data } = await axios.get<EquipoMarca[]>(`/api/catalogos/marcas`, {
      params: { q },
    });
    return data;
  };

  const searchAccesorios = async (q: string) => {
    const { data } = await axios.get<EquipoAccesorio[]>(
      `/api/catalogos/accesorios`,
      { params: { q } }
    );
    return data;
  };

  return { searchMarcas, searchAccesorios };
}
