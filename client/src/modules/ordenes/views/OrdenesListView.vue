<template>
  <v-container class="py-6">
    <h2>Órdenes</h2>
    <v-row class="mb-4" align="center">
      <v-col cols="12" md="4" class="d-flex align-center py-0 mt-5">
        <v-text-field
          v-model="qCliente"
          label="Buscar cliente/telefono/doc"
          clearable
          density="compact"
          class="input-36 flex-grow-1"
        />
      </v-col>
      <v-col cols="12" md="3" class="d-flex align-center py-0 mt-5">
        <v-select
          v-model="idEstadoOrden"
          :items="estados"
          item-title="nombreEstadoOrden"
          item-value="idEstadoOrden"
          label="Estado de orden"
          clearable
          density="compact"
          class="input-36 flex-grow-1"
        />
      </v-col>
      <v-col cols="6" md="2" class="d-flex align-center py-0 mt-5">
        <v-text-field
          v-model="fechaDesde"
          label="Desde"
          type="date"
          density="compact"
          class="input-36 flex-grow-1"
        />
      </v-col>
      <v-col cols="6" md="2" class="d-flex align-center py-0 mt-5">
        <v-text-field
          v-model="fechaHasta"
          label="Hasta"
          type="date"
          density="compact"
          class="input-36 flex-grow-1"
        />
      </v-col>
      <v-col cols="12" md="1" class="d-flex align-center justify-center py-0">
        <v-btn color="primary" class="btn-36" @click="buscar"
          ><v-icon>mdi-magnify</v-icon></v-btn
        >
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
            :color="colorForOrdenId(item.idEstadoOrden, item.nombreEstadoOrden)"
            variant="tonal"
            >{{
              labelForOrdenId(item.idEstadoOrden, item.nombreEstadoOrden)
            }}</v-chip
          >
          <div class="d-inline-flex ga-1">
            <v-tooltip
              v-for="est in estados"
              :key="est.idEstadoOrden"
              :text="
                item.idEstadoOrden === est.idEstadoOrden
                  ? 'Actual'
                  : labelForOrdenId(est.idEstadoOrden, est.nombreEstadoOrden)
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
                  :color="
                    colorForOrdenId(est.idEstadoOrden, est.nombreEstadoOrden)
                  "
                  :variant="
                    item.idEstadoOrden === est.idEstadoOrden ? 'flat' : 'text'
                  "
                  :disabled="
                    item.idEstadoOrden === est.idEstadoOrden ||
                    isTransitionDisabled(item, est)
                  "
                  @click="setEstadoOrden(item, est)"
                >
                  <v-icon
                    :icon="
                      iconForOrdenId(est.idEstadoOrden, est.nombreEstadoOrden)
                    "
                  ></v-icon>
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
        <div class="d-inline-flex ga-2 align-center">
          <v-tooltip
            text="Imprimir ticket"
            location="top"
            color="surface-variant"
            content-class="tooltip-contrast"
          >
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                icon
                size="small"
                variant="text"
                @click="printOrden(item)"
              >
                <v-icon>mdi-printer</v-icon>
              </v-btn>
            </template>
          </v-tooltip>
          <v-tooltip
            text="Imprimir etiqueta"
            location="top"
            color="surface-variant"
            content-class="tooltip-contrast"
          >
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                icon
                size="small"
                variant="text"
                @click="printEtiqueta(item)"
              >
                <v-icon>mdi-sticker-text-outline</v-icon>
              </v-btn>
            </template>
          </v-tooltip>
          <v-btn size="small" :to="`/ordenes/${item.idOrden}`"
            ><v-icon>mdi-pencil</v-icon> Editar</v-btn
          >
        </div>
      </template>
    </v-data-table>

    <!-- Dialog: datos de garantía al entregar -->
    <v-dialog v-model="entregarDialog" max-width="520">
      <v-card>
        <v-card-title>Registrar garantía de la orden</v-card-title>
        <v-card-text class="d-flex flex-column ga-3">
          <v-text-field
            v-model="entregarForm.tiempoOrdenGarantia"
            label="Tiempo de garantía (ej: 90 días)"
            placeholder="Ej: 90 días, 3 meses, 1 año"
            density="compact"
          />
          <v-textarea
            v-model="entregarForm.trabajoOrdenGarantia"
            label="¿Qué cubre la garantía?"
            placeholder="Describe la cobertura: trabajo realizado, repuestos, condiciones, etc."
            rows="3"
            density="compact"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="cancelarEntrega">Cancelar</v-btn>
          <v-btn color="primary" @click="confirmarEntrega"
            >Confirmar entrega</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useOrdenes, type OrdenRow } from "../composables/useOrdenes";
import { useCatalogos } from "./../composables/useCatalogos";
import Swal from "sweetalert2";
import { toastSuccess, alertError } from "../../../utils/notify";

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
  const curId: number | null | undefined = row?.idEstadoOrden;
  const tgtId: number | null | undefined =
    typeof est === "number" ? est : est?.idEstadoOrden;
  if (!curId || !tgtId) return false;
  // Si ya está entregada (5), bloquear todo
  if (curId === 5) return true;
  // Si está finalizada (4), solo permitir entregada (5)
  if (curId === 4 && tgtId !== 5) return true;
  return false;
}

const entregarDialog = ref(false);
const entregarForm = ref<{
  tiempoOrdenGarantia: string;
  trabajoOrdenGarantia: string;
}>({ tiempoOrdenGarantia: "", trabajoOrdenGarantia: "" });
const entregarTarget = ref<{
  row: any;
  idEstado: number;
  nombre: string;
} | null>(null);

async function setEstadoOrden(row: any, estado: any) {
  const idEstado = typeof estado === "number" ? estado : estado?.idEstadoOrden;
  const nombre = (estado?.nombreEstadoOrden || "").toLowerCase();
  if (!idEstado || row.idEstadoOrden === idEstado) return;
  if (nombre.includes("entreg") || nombre.includes("entrag")) {
    entregarTarget.value = {
      row,
      idEstado,
      nombre: estado?.nombreEstadoOrden || "",
    };
    // Resetear formulario por si quedó algo de otra entrega
    entregarForm.value = { tiempoOrdenGarantia: "", trabajoOrdenGarantia: "" };
    const ok = await Swal.fire({
      title: "Confirmar entrega",
      text: "Vas a marcar la orden como Entregada. ¿Continuar?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, continuar",
      cancelButtonText: "Cancelar",
    }).then((r) => r.isConfirmed);
    if (!ok) return;
    entregarDialog.value = true;
    return;
  }
  try {
    const resp = await fetch(`/api/ordenes/${row.idOrden}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idEstadoOrden: idEstado }),
    });
    if (!resp.ok) {
      let msg = "No se pudo actualizar";
      try {
        const j = await resp.json();
        msg = j?.error || j?.message || msg;
      } catch {}
      throw new Error(msg);
    }
    await buscar();
    const n = (estado?.nombreEstadoOrden || "").toLowerCase();
    if (n.includes("final")) toastSuccess("Orden finalizada");
    else toastSuccess("Estado actualizado");
  } catch (e: any) {
    alertError(e?.message || "No se pudo actualizar");
  }
}

async function confirmarEntrega() {
  if (!entregarTarget.value) return;
  const { row, idEstado } = entregarTarget.value;
  const payload: any = {
    idEstadoOrden: idEstado,
    tiempoOrdenGarantia: entregarForm.value.tiempoOrdenGarantia || null,
    trabajoOrdenGarantia: entregarForm.value.trabajoOrdenGarantia || null,
  };
  try {
    const resp = await fetch(`/api/ordenes/${row.idOrden}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!resp.ok) {
      let msg = "No se pudo registrar la entrega";
      try {
        const j = await resp.json();
        msg = j?.error || j?.message || msg;
      } catch {}
      throw new Error(msg);
    }
    entregarDialog.value = false;
    entregarTarget.value = null;
    await buscar();
    toastSuccess("Entregado", "Se registró la entrega y garantía.");
  } catch (e: any) {
    alertError(e?.message || "No se pudo registrar la entrega");
  }
}

function cancelarEntrega() {
  entregarDialog.value = false;
  entregarTarget.value = null;
}

async function setEstadoPresupuesto(row: any, idEstado: number) {
  if (row.idEstadoPresupuesto === idEstado) return;
  try {
    const resp = await fetch(`/api/ordenes/${row.idOrden}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idEstadoPresupuesto: idEstado }),
    });
    if (!resp.ok) {
      let msg = "No se pudo actualizar el presupuesto";
      try {
        const j = await resp.json();
        msg = j?.error || j?.message || msg;
      } catch {}
      throw new Error(msg);
    }
    await buscar();
    toastSuccess("Estado de presupuesto actualizado");
  } catch (e: any) {
    alertError(e?.message || "No se pudo actualizar el presupuesto");
  }
}

function openFoto(row: any) {
  const url = row?.fotoEquipo;
  if (!url) return;
  window.open(url, "_blank", "noopener,noreferrer");
}

function printOrden(row: any) {
  const id = row?.idOrden;
  if (!id) return;
  const url = `${window.location.origin}/ordenes/${id}/ticket?print=1`;
  const iframe = document.createElement("iframe");
  function printEtiqueta(row: any) {
    const id = row?.idOrden;
    if (!id) return;
    const url = `${window.location.origin}/ordenes/${id}/etiqueta?print=1`;
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.src = url;

    let printed = false;
    const cleanup = () => {
      setTimeout(() => {
        try {
          iframe.parentNode && iframe.parentNode.removeChild(iframe);
        } catch {}
      }, 1000);
    };
    const handleMsg = (ev: MessageEvent) => {
      if (!ev?.data || ev.data?.type !== "label-ready") return;
      if (printed) return;
      printed = true;
      try {
        const w = iframe.contentWindow;
        if (w) {
          w.focus();
          w.print();
        }
      } catch {}
      window.removeEventListener("message", handleMsg);
      cleanup();
    };
    window.addEventListener("message", handleMsg);
    iframe.onload = () => {
      setTimeout(() => {
        if (printed) return;
        try {
          const w = iframe.contentWindow;
          if (w) {
            w.focus();
            w.print();
            printed = true;
          }
        } catch {}
        window.removeEventListener("message", handleMsg);
        cleanup();
      }, 1000);
    };
    document.body.appendChild(iframe);
  }
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.src = url;
  let printed = false;
  const cleanup = () => {
    setTimeout(() => {
      try {
        iframe.parentNode && iframe.parentNode.removeChild(iframe);
      } catch {}
    }, 1000);
  };
  const handleMsg = (ev: MessageEvent) => {
    if (!ev?.data || ev.data?.type !== "ticket-ready") return;
    if (printed) return;
    printed = true;
    try {
      const w = iframe.contentWindow;
      if (w) {
        w.focus();
        w.print();
      }
    } catch {}
    window.removeEventListener("message", handleMsg);
    cleanup();
  };
  window.addEventListener("message", handleMsg);
  // Fallback si no llega el mensaje
  iframe.onload = () => {
    setTimeout(() => {
      if (printed) return;
      try {
        const w = iframe.contentWindow;
        if (w) {
          w.focus();
          w.print();
          printed = true;
        }
      } catch {}
      window.removeEventListener("message", handleMsg);
      cleanup();
    }, 1000);
  };
  document.body.appendChild(iframe);
}

// Imprimir etiqueta con QR (iframe oculto)
function printEtiqueta(row: any) {
  const id = row?.idOrden;
  if (!id) return;
  const url = `${window.location.origin}/ordenes/${id}/etiqueta?print=1`;
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.src = url;

  let printed = false;
  const cleanup = () => {
    setTimeout(() => {
      try {
        iframe.parentNode && iframe.parentNode.removeChild(iframe);
      } catch {}
    }, 1000);
  };
  const handleMsg = (ev: MessageEvent) => {
    if (!ev?.data || ev.data?.type !== "label-ready") return;
    if (printed) return;
    printed = true;
    try {
      const w = iframe.contentWindow;
      if (w) {
        w.focus();
        w.print();
      }
    } catch {}
    window.removeEventListener("message", handleMsg);
    cleanup();
  };
  window.addEventListener("message", handleMsg);
  iframe.onload = () => {
    setTimeout(() => {
      if (printed) return;
      try {
        const w = iframe.contentWindow;
        if (w) {
          w.focus();
          w.print();
          printed = true;
        }
      } catch {}
      window.removeEventListener("message", handleMsg);
      cleanup();
    }, 1000);
  };
  document.body.appendChild(iframe);
}

function iconForOrden(nombre: string): string {
  const n = (nombre || "").toLowerCase();
  if (n.includes("crea")) return "mdi-plus-box-outline";
  if (n.includes("diag")) return "mdi-stethoscope";
  if (n.includes("esper") || n.includes("repuest") || n.includes("respuest"))
    return "mdi-clock-outline";
  if (n.includes("proce")) return "mdi-tools";
  if (n.includes("repar") || n.includes("serv")) return "mdi-tools";
  if (n.includes("final")) return "mdi-check-circle-outline";
  if (n.includes("entreg") || n.includes("entrag"))
    return "mdi-truck-check-outline";
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
  if (n.includes("esper") || n.includes("repuest") || n.includes("respuest"))
    return "warning";
  if (n.includes("proce")) return "order-repair";
  if (n.includes("repar") || n.includes("serv")) return "order-repair";
  if (n.includes("final")) return "order-finalized";
  if (n.includes("entreg") || n.includes("entrag")) return "order-delivered";
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

function normalizeEstadoNombre(nombre?: string | null): string {
  const raw = String(nombre || "").trim();
  const n = raw.toLowerCase();
  if (n.includes("entrag") || n.includes("entreg")) return "Entregada";
  if (n.includes("final")) return "Finalizada";
  if (n.includes("proce")) return "En proceso";
  if (n.includes("esper") || n.includes("repuest") || n.includes("respuest"))
    return "Esperando repuesto";
  if (n.includes("crea")) return "Creada";
  return raw || "";
}

function colorForOrdenId(
  id?: number | null,
  nombre?: string | null
): string | undefined {
  switch (id) {
    case 1:
      return "order-created";
    case 2:
      return "order-repair";
    case 3:
      return "warning";
    case 4:
      return "order-finalized";
    case 5:
      return "order-delivered";
    default:
      return colorForOrden(normalizeEstadoNombre(nombre));
  }
}

function iconForOrdenId(id?: number | null, nombre?: string | null): string {
  switch (id) {
    case 1:
      return "mdi-plus-box-outline";
    case 2:
      return "mdi-tools";
    case 3:
      return "mdi-clock-outline";
    case 4:
      return "mdi-check-circle-outline";
    case 5:
      return "mdi-truck-check-outline";
    default:
      return iconForOrden(normalizeEstadoNombre(nombre || ""));
  }
}

function labelForOrdenId(id?: number | null, nombre?: string | null): string {
  switch (id) {
    case 1:
      return "Creada";
    case 2:
      return "En proceso";
    case 3:
      return "Esperando repuesto";
    case 4:
      return "Finalizada";
    case 5:
      return "Entregada";
    default:
      return normalizeEstadoNombre(nombre);
  }
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

/* Igualar altura de inputs al botón (36px) */
.input-36 :deep(.v-field),
.input-36 :deep(.v-field__input) {
  min-height: 36px;
  height: 36px;
}
.input-36 :deep(.v-field__append-inner),
.input-36 :deep(.v-field__prepend-inner) {
  height: 36px;
}

/* Forzar altura/ancho del botón a 36px */
.btn-36 {
  --v-btn-height: 36px;
  height: 36px !important;
  min-height: 36px !important;
  width: 36px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
