<template>
  <v-container class="py-6">
    <h2>Órdenes</h2>
    <v-row class="mb-4" align="end">
      <v-col cols="12" md="4">
        <v-text-field
          v-model="qCliente"
          label="Buscar cliente/telefono/doc"
          clearable
        />
      </v-col>
      <v-col cols="12" md="3">
        <v-select
          v-model="idEstadoOrden"
          :items="estados"
          item-title="nombreEstadoOrden"
          item-value="idEstadoOrden"
          label="Estado de orden"
          clearable
        />
      </v-col>
      <v-col cols="6" md="2">
        <v-text-field v-model="fechaDesde" label="Desde" type="date" />
      </v-col>
      <v-col cols="6" md="2">
        <v-text-field v-model="fechaHasta" label="Hasta" type="date" />
      </v-col>
      <v-col cols="12" md="1">
        <v-btn color="primary" @click="buscar">Filtrar</v-btn>
      </v-col>
    </v-row>
    <v-data-table
      :items="items"
      :headers="headers"
      hide-default-footer
      items-per-page="100"
      density="compact"
      class="orders-table"
    >
      <template v-slot:[`item.nombreEstadoOrden`]="{ item }">
        <div class="d-inline-flex align-center ga-1">
          <v-chip
            size="small"
            :color="colorForOrden(item.nombreEstadoOrden)"
            variant="tonal"
            >{{ item.nombreEstadoOrden }}</v-chip
          >
          <div class="d-inline-flex ga-1">
            <v-tooltip
              v-for="est in estados"
              :key="est.idEstadoOrden"
              :text="
                item.idEstadoOrden === est.idEstadoOrden
                  ? 'Actual'
                  : est.nombreEstadoOrden
              "
              location="top"
              color="surface-variant"
              content-class="tooltip-contrast"
            >
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon
                  size="x-small"
                  :color="colorForOrden(est.nombreEstadoOrden)"
                  :variant="
                    item.idEstadoOrden === est.idEstadoOrden ? 'flat' : 'text'
                  "
                  :disabled="
                    item.idEstadoOrden === est.idEstadoOrden ||
                    isTransitionDisabled(item, est)
                  "
                  @click="setEstadoOrden(item, est.idEstadoOrden)"
                >
                  <v-icon :icon="iconForOrden(est.nombreEstadoOrden)"></v-icon>
                </v-btn>
              </template>
            </v-tooltip>
          </div>
        </div>
      </template>
      <template v-slot:[`item.nombreEstadoPresupuesto`]="{ item }">
        <div class="d-inline-flex align-center ga-1">
          <v-chip
            size="small"
            :color="colorForPresupuesto(item.nombreEstadoPresupuesto)"
            variant="tonal"
            >{{ item.nombreEstadoPresupuesto || "—" }}</v-chip
          >
          <div class="d-inline-flex ga-1">
            <v-tooltip
              v-for="est in estadosPresupuesto"
              :key="est.idEstadoPresupuesto"
              :text="
                item.idEstadoPresupuesto === est.idEstadoPresupuesto
                  ? 'Actual'
                  : est.nombreEstadoPresupuesto
              "
              location="top"
              color="surface-variant"
              content-class="tooltip-contrast"
            >
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon
                  size="x-small"
                  :color="colorForPresupuesto(est.nombreEstadoPresupuesto)"
                  :variant="
                    item.idEstadoPresupuesto === est.idEstadoPresupuesto
                      ? 'flat'
                      : 'text'
                  "
                  :disabled="
                    item.idEstadoPresupuesto === est.idEstadoPresupuesto
                  "
                  @click="setEstadoPresupuesto(item, est.idEstadoPresupuesto)"
                >
                  <v-icon
                    :icon="iconForPresupuesto(est.nombreEstadoPresupuesto)"
                  ></v-icon>
                </v-btn>
              </template>
            </v-tooltip>
          </div>
        </div>
      </template>
      <template v-slot:[`item.fotoEquipo`]="{ item }">
        <v-avatar
          size="36"
          v-if="item.fotoEquipo"
          class="equipo-avatar clickable"
          @click="openFoto(item)"
          :title="'Ver foto'"
        >
          <v-img :src="item.fotoEquipo" alt="foto" cover />
        </v-avatar>
        <span v-else>—</span>
      </template>
      <template v-slot:[`item.actions`]="{ item }">
        <v-btn size="small" :to="`/ordenes/${item.idOrden}`">Editar</v-btn>
      </template>
    </v-data-table>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useOrdenes, type OrdenRow } from "../composables/useOrdenes";
import { useCatalogos } from "./../composables/useCatalogos";

const { listFull } = useOrdenes();
const { searchMarcas } = useCatalogos();
const items = ref<OrdenRow[]>([]);
const headers = [
  { title: "#", value: "idOrden" },
  { title: "Fecha", value: "fechaHoraCreadoOrden" },
  { title: "Foto", value: "fotoEquipo", sortable: false },
  { title: "Cliente", value: "NombreCliente" },
  { title: "Serie", value: "numeroDeSerieEquipo" },
  { title: "Estado", value: "nombreEstadoOrden" },
  { title: "Presupuesto", value: "montoPresupuesto" },
  { title: "Estado Presup.", value: "nombreEstadoPresupuesto" },
  { title: "", value: "actions", sortable: false },
];

const qCliente = ref("");
const idEstadoOrden = ref<number | null>(null);
const fechaDesde = ref<string | null>(null);
const fechaHasta = ref<string | null>(null);
const estados = ref<
  Array<{ idEstadoOrden: number; nombreEstadoOrden: string }>
>([]);
const estadosPresupuesto = ref<
  Array<{ idEstadoPresupuesto: number; nombreEstadoPresupuesto: string }>
>([]);

async function cargarEstados() {
  // reutilizamos catálogo del backend
  const res = await fetch(`/api/catalogos/estado-orden`);
  estados.value = await res.json();
  const res2 = await fetch(`/api/catalogos/estado-presupuesto`);
  estadosPresupuesto.value = await res2.json();
}

async function buscar() {
  items.value = await listFull({
    qCliente: qCliente.value || undefined,
    idEstadoOrden: idEstadoOrden.value || undefined,
    fechaDesde: fechaDesde.value || undefined,
    fechaHasta: fechaHasta.value || undefined,
  });
}

onMounted(async () => {
  await cargarEstados();
  await buscar();
});

function isTransitionDisabled(row: any, est: any) {
  const curName = (row.nombreEstadoOrden || "").toLowerCase();
  const tgtName = (est?.nombreEstadoOrden || "").toLowerCase();
  // Si ya está entregado, bloquear todo
  if (curName.includes("entreg")) return true;
  // Si está finalizado, solo permitir entregado
  if (curName.includes("final") && !tgtName.includes("entreg")) return true;
  return false;
}

async function setEstadoOrden(row: any, idEstado: number) {
  if (row.idEstadoOrden === idEstado) return;
  await fetch(`/api/ordenes/${row.idOrden}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idEstadoOrden: idEstado }),
  });
  await buscar();
}

async function setEstadoPresupuesto(row: any, idEstado: number) {
  if (row.idEstadoPresupuesto === idEstado) return;
  await fetch(`/api/ordenes/${row.idOrden}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idEstadoPresupuesto: idEstado }),
  });
  await buscar();
}

function openFoto(row: any) {
  const url = row?.fotoEquipo;
  if (!url) return;
  window.open(url, "_blank", "noopener,noreferrer");
}

function iconForOrden(nombre: string): string {
  const n = (nombre || "").toLowerCase();
  if (n.includes("crea")) return "mdi-plus-box-outline";
  if (n.includes("diag")) return "mdi-stethoscope";
  if (n.includes("repar") || n.includes("serv")) return "mdi-tools";
  if (n.includes("final")) return "mdi-check-circle-outline";
  if (n.includes("entreg")) return "mdi-truck-check-outline";
  return "mdi-checkbox-blank-circle-outline";
}

function iconForPresupuesto(nombre: string): string {
  const n = (nombre || "").toLowerCase();
  if (n.includes("pend")) return "mdi-timer-sand";
  if (n.includes("apro") || n.includes("acep"))
    return "mdi-check-decagram-outline";
  if (n.includes("rech") || n.includes("nega"))
    return "mdi-close-octagon-outline";
  if (n.includes("rev") || n.includes("sol"))
    return "mdi-comment-question-outline";
  return "mdi-cash-check";
}

function colorForOrden(nombre?: string | null): string | undefined {
  const n = (nombre || "").toLowerCase();
  if (!n) return undefined;
  if (n.includes("crea")) return "order-created";
  if (n.includes("diag")) return "order-diagnosis";
  if (n.includes("repar") || n.includes("serv")) return "order-repair";
  if (n.includes("final")) return "order-finalized";
  if (n.includes("entreg")) return "order-delivered";
  return "secondary";
}

function colorForPresupuesto(nombre?: string | null): string | undefined {
  const n = (nombre || "").toLowerCase();
  if (!n) return undefined;
  if (n.includes("pend")) return "budget-pending";
  if (n.includes("apro") || n.includes("acep")) return "budget-approved";
  if (n.includes("rech") || n.includes("nega")) return "budget-rejected";
  if (n.includes("rev") || n.includes("sol")) return "budget-review";
  return "secondary";
}
</script>

<style scoped>
.orders-table :deep(.v-table__wrapper) {
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 8px;
}
.orders-table :deep(thead th) {
  background: rgb(var(--v-theme-surface-variant));
  color: rgb(var(--v-theme-on-surface));
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  font-size: 0.78rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.3);
}
.orders-table :deep(tbody tr) {
  background: rgb(var(--v-theme-surface));
}
.v-application:not(.v-theme--crtDark)
  .orders-table
  :deep(tbody tr:nth-child(odd)) {
  background: color-mix(
    in srgb,
    rgb(var(--v-theme-surface)) 92%,
    rgb(var(--v-theme-primary)) 8%
  );
}
.orders-table :deep(tbody tr:hover) {
  background: color-mix(
    in srgb,
    rgb(var(--v-theme-surface)) 80%,
    rgb(var(--v-theme-primary)) 20%
  );
}

.equipo-avatar :deep(img),
.equipo-avatar :deep(.v-img) {
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 50%;
}
.v-theme--crtDark .equipo-avatar :deep(img),
.v-theme--crtDark .equipo-avatar :deep(.v-img) {
  border-color: rgba(255, 255, 255, 0.15);
}

.tooltip-contrast {
  color: rgb(var(--v-theme-on-surface));
  font-weight: 600;
}

.clickable {
  cursor: pointer;
}
</style>
