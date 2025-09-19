<template>
  <v-container class="py-6" max-width="900">
    <h2>Nueva Orden</h2>
    <v-stepper v-model="step" class="mt-4">
      <v-stepper-header>
        <v-stepper-item
          :complete="step > 1"
          :value="1"
          title="Cliente"
          :color="step >= 1 ? 'primary' : 'secondary'"
        />
        <v-divider
          class="mx-2 flex-grow-1"
          :thickness="2"
          :color="step >= 2 ? 'primary' : 'surface-variant'"
        />
        <v-stepper-item
          :complete="step > 2"
          :value="2"
          title="Equipo"
          :color="step >= 2 ? 'primary' : 'secondary'"
        />
        <v-divider
          class="mx-2 flex-grow-1"
          :thickness="2"
          :color="step >= 3 ? 'primary' : 'surface-variant'"
        />
        <v-stepper-item
          :complete="step > 3"
          :value="3"
          title="Orden"
          :color="step >= 3 ? 'primary' : 'secondary'"
        />
      </v-stepper-header>
      <v-stepper-window>
        <v-stepper-window-item :value="1">
          <v-row>
            <v-col cols="12" md="8">
              <v-text-field
                v-model="clienteSearch"
                label="Buscar cliente (nombre/teléfono/documento)"
                @keyup.enter="buscarClientes"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-btn color="primary" @click="buscarClientes">Buscar</v-btn>
            </v-col>
          </v-row>
          <v-row v-if="clientes.length">
            <v-col cols="12">
              <v-data-table
                :items="clientes"
                :headers="headersClientes"
                item-key="idCliente"
                density="compact"
              >
                <template v-slot:[`item.actions`]="{ item }">
                  <v-btn
                    size="small"
                    color="primary"
                    @click="seleccionarCliente(item)"
                    >Elegir</v-btn
                  >
                </template>
              </v-data-table>
            </v-col>
          </v-row>
          <v-divider class="my-6" />
          <h4>Crear cliente</h4>
          <v-row>
            <v-col cols="12" md="6"
              ><v-text-field
                label="Nombre"
                v-model="nuevoCliente.NombreCliente"
            /></v-col>
            <v-col cols="12" md="3"
              ><v-text-field
                label="Teléfono"
                v-model="nuevoCliente.TelefonoCliente"
            /></v-col>
            <v-col cols="12" md="3"
              ><v-text-field
                label="Documento"
                v-model="nuevoCliente.DocumentoCliente"
            /></v-col>
          </v-row>
          <v-btn
            :disabled="!nuevoCliente.NombreCliente"
            color="success"
            @click="crearCliente"
            >Guardar y continuar</v-btn
          >
        </v-stepper-window-item>

        <v-stepper-window-item :value="2">
          <v-row>
            <v-col cols="12" md="8">
              <v-text-field
                v-model="serial"
                label="Número de serie"
                @keyup.enter="buscarEquipo"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-btn color="primary" @click="buscarEquipo">Buscar equipo</v-btn>
            </v-col>
          </v-row>
          <div v-if="equipoEncontrado">
            <v-alert type="info" class="mb-4"
              >Equipo encontrado. Se usará para la orden.</v-alert
            >
            <p>
              <strong>Marca:</strong>
              {{ equipoEncontrado.marcaEquipo || "-" }} |
              <strong>Modelo:</strong>
              {{ equipoEncontrado.modeloEquipo || "-" }}
            </p>
            <v-btn color="primary" @click="step = 3">Continuar</v-btn>
          </div>
          <div v-else>
            <h4>Crear equipo</h4>
            <v-alert v-if="errorEquipo" type="error" class="mb-3">{{
              errorEquipo
            }}</v-alert>
            <v-row>
              <v-col cols="12" md="4">
                <v-autocomplete
                  v-model="marcaSeleccionada"
                  :items="marcas"
                  :loading="loadingMarcas"
                  item-title="marcaEquipo"
                  item-value="idEquipoMarca"
                  label="Marca"
                  hide-no-data
                  hide-details
                  clearable
                  @update:search="onSearchMarca"
                />
              </v-col>
              <v-col cols="12" md="4"
                ><v-text-field
                  label="Modelo"
                  v-model="equipoNuevo.modeloEquipo"
              /></v-col>
              <v-col cols="12" md="4">
                <v-autocomplete
                  v-model="accesorioSeleccionado"
                  :items="accesorios"
                  :loading="loadingAccesorios"
                  item-title="accesorio"
                  item-value="idEquipoAccesorio"
                  label="Accesorio (opcional)"
                  multiple
                  hide-no-data
                  hide-details
                  clearable
                  @update:search="onSearchAccesorio"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-file-input
                  v-model="fotoFiles"
                  label="Foto del equipo"
                  prepend-icon="mdi-camera"
                  accept="image/*"
                  show-size
                />
              </v-col>
            </v-row>
            <v-btn
              :disabled="!serial || !clienteId"
              color="success"
              @click="crearEquipo"
              >Guardar y continuar</v-btn
            >
          </div>
        </v-stepper-window-item>

        <v-stepper-window-item :value="3">
          <v-textarea label="Falla" v-model="orden.fallaEquipoOrden" rows="3" />
          <v-textarea
            label="Diagnóstico técnico"
            v-model="orden.diagnosticoTecnicoOrden"
            rows="3"
          />
          <v-textarea
            label="Diagnóstico al cliente"
            v-model="orden.diagnosticoAClienteOrden"
            rows="3"
          />
          <v-btn :disabled="!equipoId" color="primary" @click="guardarOrden"
            >Crear orden</v-btn
          >
          <v-alert v-if="ordenCreada" type="success" class="mt-4"
            >Orden creada: #{{ ordenCreada }}</v-alert
          >
        </v-stepper-window-item>
      </v-stepper-window>
    </v-stepper>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import {
  useNuevaOrden,
  type Cliente,
  type Equipo,
} from "../composables/useNuevaOrden";
import {
  useCatalogos,
  type EquipoMarca,
  type EquipoAccesorio,
} from "../composables/useCatalogos";

const step = ref(1);
const clienteSearch = ref("");
const clientes = ref<Cliente[]>([]);
const headersClientes = [
  { title: "ID", value: "idCliente" },
  { title: "Nombre", value: "NombreCliente" },
  { title: "Teléfono", value: "TelefonoCliente" },
  { title: "Documento", value: "DocumentoCliente" },
  { title: "", value: "actions", sortable: false },
];

const nuevoCliente = ref<Partial<Cliente> & { NombreCliente?: string }>({
  NombreCliente: "",
});
const {
  searchClientes,
  createCliente,
  getEquipoBySerial,
  createEquipo,
  createOrden,
} = useNuevaOrden();

const clienteId = ref<number | null>(null);
function seleccionarCliente(c: Cliente) {
  clienteId.value = c.idCliente;
  step.value = 2;
}
async function buscarClientes() {
  clientes.value = await searchClientes(clienteSearch.value);
}
async function crearCliente() {
  const id = await createCliente({
    NombreCliente: nuevoCliente.value.NombreCliente!,
    TelefonoCliente: nuevoCliente.value.TelefonoCliente ?? null,
    DocumentoCliente: nuevoCliente.value.DocumentoCliente ?? null,
  });
  clienteId.value = id;
  step.value = 2;
}

const serial = ref("");
const equipoEncontrado = ref<Equipo | null>(null);
const equipoNuevo = ref<{
  marcaEquipo?: string | null;
  modeloEquipo?: string | null;
}>({});
const { searchMarcas, searchAccesorios } = useCatalogos();
const marcas = ref<EquipoMarca[]>([]);
const accesorios = ref<EquipoAccesorio[]>([]);
const marcaSeleccionada = ref<number | null>(null);
const accesorioSeleccionado = ref<number[] | null>(null);
const loadingMarcas = ref(false);
const loadingAccesorios = ref(false);
let marcaDebounce: any;
let accDebounce: any;
function onSearchMarca(q: string) {
  clearTimeout(marcaDebounce);
  loadingMarcas.value = true;
  marcaDebounce = setTimeout(async () => {
    try {
      marcas.value = await searchMarcas(q || "");
    } finally {
      loadingMarcas.value = false;
    }
  }, 250);
}
function onSearchAccesorio(q: string) {
  clearTimeout(accDebounce);
  loadingAccesorios.value = true;
  accDebounce = setTimeout(async () => {
    try {
      accesorios.value = await searchAccesorios(q || "");
    } finally {
      loadingAccesorios.value = false;
    }
  }, 250);
}
const equipoId = ref<number | null>(null);
const fotoFiles = ref<File[] | File | null>(null);
const fotoFile = computed<File | null>(() => {
  const f = fotoFiles.value as any;
  if (!f) return null;
  if (Array.isArray(f)) return f[0] || null;
  return f as File;
});
const errorEquipo = ref<string | null>(null);

async function buscarEquipo() {
  try {
    equipoEncontrado.value = await getEquipoBySerial(serial.value);
    equipoId.value = equipoEncontrado.value.idEquipo;
  } catch (e) {
    equipoEncontrado.value = null;
  }
}
async function crearEquipo() {
  errorEquipo.value = null;
  try {
    const id = await createEquipo({
      numeroDeSerieEquipo: serial.value,
      idCliente: clienteId.value!,
      marcaEquipo: equipoNuevo.value.marcaEquipo ?? null,
      modeloEquipo: equipoNuevo.value.modeloEquipo ?? null,
      foto: fotoFile.value || null,
      idMarcaEquipo: marcaSeleccionada.value,
      idsEquipoAccesorio: Array.isArray(accesorioSeleccionado.value)
        ? accesorioSeleccionado.value
        : [],
    });
    equipoId.value = id;
    step.value = 3;
  } catch (e: any) {
    errorEquipo.value =
      e?.response?.data?.error || e?.message || "Error al crear equipo";
  }
}

const orden = ref<{
  fallaEquipoOrden?: string | null;
  diagnosticoTecnicoOrden?: string | null;
  diagnosticoAClienteOrden?: string | null;
}>({});
const ordenCreada = ref<number | null>(null);
async function guardarOrden() {
  const id = await createOrden({
    idEquipo: equipoId.value!,
    fallaEquipoOrden: orden.value.fallaEquipoOrden ?? null,
    diagnosticoTecnicoOrden: orden.value.diagnosticoTecnicoOrden ?? null,
    diagnosticoAClienteOrden: orden.value.diagnosticoAClienteOrden ?? null,
  });
  ordenCreada.value = id;
}
</script>
