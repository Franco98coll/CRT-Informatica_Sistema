<template>
  <v-container class="track-container" fluid>
    <v-card v-if="!data" class="mx-auto" max-width="560" elevation="10">
      <v-card-title class="d-flex align-center ga-2">
        <v-icon>mdi-package-variant</v-icon>
        Seguimiento de orden
      </v-card-title>
      <v-card-text>
        <v-form @submit.prevent="onSubmit">
          <v-text-field
            v-model="idOrdenInput"
            label="Número de orden"
            type="number"
            required
          />
          <v-text-field
            v-model="documentoInput"
            label="Documento (DNI/CUIT)"
            hint="Ingresá solo números, sin puntos ni guiones"
            persistent-hint
            required
          />
          <v-btn color="primary" block type="submit">Consultar</v-btn>
        </v-form>
        <div v-if="loading" class="text-center my-6">
          <v-progress-circular indeterminate color="primary" />
        </div>
        <v-alert v-if="error" type="error" class="mt-4" density="comfortable">
          {{ error }}
        </v-alert>
      </v-card-text>
    </v-card>

    <v-card v-else class="mx-auto" max-width="720" elevation="10">
      <v-card-title class="d-flex align-center ga-2">
        <v-icon>mdi-clipboard-text-outline</v-icon>
        Detalle de tu orden #{{ data.idOrden }}
        <v-spacer />
        <v-btn variant="text" @click="resetView" prepend-icon="mdi-arrow-left"
          >Nueva consulta</v-btn
        >
      </v-card-title>
      <v-card-text>
        <div class="d-flex align-center ga-2 mb-3">
          <v-chip :color="estadoColor(data.nombreEstadoOrden)" variant="tonal">
            Estado:
            {{ data.nombreEstadoOrden }}
          </v-chip>
          <v-chip
            v-if="data.nombreEstadoPresupuesto"
            :color="presuColor(data.nombreEstadoPresupuesto)"
            variant="tonal"
          >
            Presupuesto:
            {{ data.nombreEstadoPresupuesto }}
          </v-chip>
        </div>
        <v-row>
          <v-col cols="12" md="7">
            <div class="text-caption text-medium-emphasis">Diagnóstico</div>
            <div class="text-body-2 mt-1">
              {{
                data.diagnosticoAClienteOrden ||
                "Todavía no hay diagnóstico cargado."
              }}
            </div>
          </v-col>
          <v-col cols="12" md="5">
            <v-sheet class="pa-3" rounded="lg" color="surface-variant">
              <div class="text-caption text-medium-emphasis">
                Fecha de creación
              </div>
              <div class="text-body-2">
                {{ new Date(data.fechaHoraCreadoOrden).toLocaleString() }}
              </div>
              <div v-if="data.montoPresupuesto" class="mt-3">
                <div class="text-caption text-medium-emphasis">Presupuesto</div>
                <div class="text-body-2">$ {{ data.montoPresupuesto }}</div>
              </div>
            </v-sheet>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from "vue";

type PublicOrden = {
  idOrden: number;
  fechaHoraCreadoOrden: string;
  nombreEstadoOrden: string;
  idEstadoOrden?: number;
  diagnosticoAClienteOrden?: string | null;
  nombreEstadoPresupuesto?: string | null;
  idEstadoPresupuesto?: number | null;
  montoPresupuesto?: string | null;
};

const idOrdenInput = ref<string>("");
const documentoInput = ref<string>("");
const loading = ref(false);
const error = ref<string | null>(null);
const data = ref<PublicOrden | null>(null);

async function onSubmit() {
  error.value = null;
  data.value = null;
  const id = Number(idOrdenInput.value);
  if (!id || Number.isNaN(id)) {
    error.value = "Ingresá un número de orden válido";
    return;
  }
  const doc = (documentoInput.value || "").replace(/\D+/g, "");
  if (!doc) {
    error.value = "Ingresá el documento del titular";
    return;
  }
  loading.value = true;
  try {
    const params = new URLSearchParams({ documento: doc });
    const res = await fetch(`/api/public/ordenes/${id}?${params.toString()}`);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      throw new Error(j?.error || "No encontrado");
    }
    data.value = await res.json();
  } catch (e: any) {
    error.value = e?.message || "Error al consultar";
  } finally {
    loading.value = false;
  }
}

function resetView() {
  data.value = null;
  idOrdenInput.value = "";
  documentoInput.value = "";
  error.value = null;
}

function estadoColor(nombre?: string | null): string | undefined {
  const n = (nombre || "").toLowerCase();
  if (n.includes("crea")) return "order-created";
  if (n.includes("diag")) return "order-diagnosis";
  if (n.includes("repar") || n.includes("serv")) return "order-repair";
  if (n.includes("final")) return "order-finalized";
  if (n.includes("entreg")) return "order-delivered";
  return "secondary";
}
function presuColor(nombre?: string | null): string | undefined {
  const n = (nombre || "").toLowerCase();
  if (n.includes("pend")) return "budget-pending";
  if (n.includes("apro") || n.includes("acep")) return "budget-approved";
  if (n.includes("rech") || n.includes("nega")) return "budget-rejected";
  if (n.includes("rev") || n.includes("sol")) return "budget-review";
  return "secondary";
}
</script>

<style scoped>
.track-container {
  min-height: calc(100vh - 64px);
  display: grid;
  place-items: center;
}
</style>
