<template>
  <v-container class="py-6" max-width="800">
    <v-card>
      <v-card-text>
        <h2>Editar Orden #{{ id }}</h2>
        <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>
        <div v-if="orden">
          <p class="mt-4">
            <strong>Cliente:</strong> {{ orden.NombreCliente }} |
            <strong>Serie:</strong> {{ orden.numeroDeSerieEquipo }}
          </p>
          <v-row>
            <v-col class="mt-4" cols="12" md="6">
              <v-select
                v-model="estadoOrden"
                :items="estadosOrden"
                item-title="nombreEstadoOrden"
                item-value="idEstadoOrden"
                label="Estado de la orden"
              />
            </v-col>
            <v-col class="mt-4" cols="12" md="6">
              <v-text-field
                v-model.number="monto"
                type="number"
                label="Monto presupuesto"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" md="6">
              <v-select
                v-model="estadoPresupuesto"
                :items="estadosPresupuesto"
                item-title="nombreEstadoPresupuesto"
                item-value="idEstadoPresupuesto"
                label="Estado del presupuesto"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-textarea
                v-model="falla"
                label="Falla del equipo"
                rows="2"
                auto-grow
              />
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="diagTecnico"
                label="Diagnóstico técnico"
                rows="2"
                auto-grow
              />
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="diagCliente"
                label="Diagnóstico informado al cliente"
                rows="2"
                auto-grow
              />
            </v-col>
          </v-row>
          <v-col cols="12" class="d-flex justify-end ga-2">
            <v-btn variant="text" @click="imprimirTicket">
              <v-icon start>mdi-printer</v-icon>
              Imprimir ticket
            </v-btn>
            <v-btn color="primary" @click="guardar">Guardar cambios</v-btn>
          </v-col>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { useOrdenes } from "../composables/useOrdenes";
import axios from "axios";
import { toastSuccess, alertError } from "../../../utils/notify";
import { useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const id = Number(route.params.id);
const { getDetail, updateOrden } = useOrdenes();
const orden = ref<any>(null);
const error = ref<string | null>(null);

const estadosOrden = ref<any[]>([]);
const estadosPresupuesto = ref<any[]>([]);
const estadoOrden = ref<number | null>(null);
const estadoPresupuesto = ref<number | null>(null);
const monto = ref<number | null>(null);
const falla = ref<string>("");
const diagTecnico = ref<string>("");
const diagCliente = ref<string>("");

onMounted(async () => {
  try {
    const [det, eo, ep] = await Promise.all([
      getDetail(id),
      axios.get(`/api/catalogos/estado-orden`).then((r) => r.data),
      axios.get(`/api/catalogos/estado-presupuesto`).then((r) => r.data),
    ]);
    orden.value = det;
    estadosOrden.value = eo;
    estadosPresupuesto.value = ep;
    // iniciales si existen
    estadoOrden.value =
      (eo.find((x: any) => x.nombreEstadoOrden === det.nombreEstadoOrden) || {})
        .idEstadoOrden || null;
    estadoPresupuesto.value =
      (
        ep.find(
          (x: any) => x.nombreEstadoPresupuesto === det.nombreEstadoPresupuesto
        ) || {}
      ).idEstadoPresupuesto || null;
    monto.value = det.montoPresupuesto ? Number(det.montoPresupuesto) : null;
    falla.value = det.fallaEquipoOrden || "";
    diagTecnico.value = det.diagnosticoTecnicoOrden || "";
    diagCliente.value = det.diagnosticoAClienteOrden || "";
  } catch (e: any) {
    error.value = e?.message || "Error cargando datos";
    alertError(error.value);
  }
});

async function guardar() {
  try {
    await updateOrden(id, {
      idEstadoOrden: estadoOrden.value || undefined,
      montoPresupuesto: monto.value == null ? undefined : monto.value,
      idEstadoPresupuesto: estadoPresupuesto.value || undefined,
      fallaEquipoOrden: falla.value || undefined,
      diagnosticoTecnicoOrden: diagTecnico.value || undefined,
      diagnosticoAClienteOrden: diagCliente.value || undefined,
    });
    error.value = null;
    toastSuccess("Cambios guardados");
  } catch (e: any) {
    error.value = e?.message || "Error al guardar";
    alertError(error.value);
  }
}

function imprimirTicket() {
  router.push({
    name: "ordenes-ticket",
    params: { id },
    query: { print: "1" },
  });
}
</script>
