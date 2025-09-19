<template>
  <v-container class="py-6">
    <v-row class="mb-4" align="center" justify="space-between">
      <v-col cols="12" md="6">
        <h2 class="text-h5 font-weight-bold">Estadísticas</h2>
        <div class="text-body-2 opacity-70">
          Resumen de marcas, clientes y tiempos de finalización.
        </div>
      </v-col>
      <v-col cols="12" md="3" class="d-flex align-end justify-end">
        <v-select
          v-model="limit"
          :items="limits"
          label="Top"
          hide-details
          density="comfortable"
          style="max-width: 140px"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="d-flex align-center justify-space-between">
            <span class="text-subtitle-1 font-weight-medium">Top marcas</span>
            <v-chip size="small" color="info" variant="tonal"
              >{{ marcasTotal }} total</v-chip
            >
          </v-card-title>
          <v-card-text>
            <Bar :data="chartMarcas.data" :options="chartOptions" />
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="d-flex align-center justify-space-between">
            <span class="text-subtitle-1 font-weight-medium">Top clientes</span>
            <v-chip size="small" color="info" variant="tonal"
              >{{ clientesTotal }} total</v-chip
            >
          </v-card-title>
          <v-card-text>
            <Bar :data="chartClientes.data" :options="chartOptions" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-2">
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2" color="primary">mdi-timer-sand</v-icon>
            <span class="text-subtitle-1 font-weight-medium"
              >Tiempo promedio de finalización</span
            >
          </v-card-title>
          <v-card-text>
            <div class="text-h5 font-weight-bold">
              {{ avgSecondsLabel }}
            </div>
            <div class="text-caption opacity-70">
              Basado en órdenes finalizadas
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from "vue";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "vue-chartjs";
import { useTheme } from "vuetify";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type StatItem = { label: string; value: number };

const theme = useTheme();
const isDark = computed(() => theme.global.current.value.dark);

const limit = ref(8);
const limits = [5, 8, 10, 12, 15];

const chartMarcas = ref({
  data: {
    labels: [] as string[],
    datasets: [
      {
        label: "Órdenes",
        data: [] as number[],
        backgroundColor: [] as string[],
      },
    ],
  },
});
const chartClientes = ref({
  data: {
    labels: [] as string[],
    datasets: [
      {
        label: "Órdenes",
        data: [] as number[],
        backgroundColor: [] as string[],
      },
    ],
  },
});

const marcasTotal = computed(() =>
  chartMarcas.value.data.datasets[0].data.reduce((a, b) => a + b, 0)
);
const clientesTotal = computed(() =>
  chartClientes.value.data.datasets[0].data.reduce((a, b) => a + b, 0)
);

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: isDark.value ? "#E5E7EB" : "#111827" } },
    title: { display: false },
    tooltip: { enabled: true },
  },
  scales: {
    x: {
      ticks: { color: isDark.value ? "#CBD5E1" : "#374151" },
      grid: {
        color: isDark.value ? "rgba(148,163,184,0.2)" : "rgba(0,0,0,0.05)",
      },
    },
    y: {
      ticks: { color: isDark.value ? "#CBD5E1" : "#374151" },
      grid: {
        color: isDark.value ? "rgba(148,163,184,0.2)" : "rgba(0,0,0,0.05)",
      },
    },
  },
}));

const avgSeconds = ref<number | null>(null);
const avgSecondsLabel = computed(() => formatDuration(avgSeconds.value ?? 0));

function formatDuration(seconds: number) {
  if (!seconds || seconds <= 0) return "—";
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m} minutos`;
}

async function fetchTop(endpoint: string, limit: number): Promise<StatItem[]> {
  const { data } = await axios.get<StatItem[]>(
    `/api/stats/${endpoint}?limit=${limit}`
  );
  return data;
}

async function refreshCharts() {
  const [marcas, clientes] = await Promise.all([
    fetchTop("top-marcas", limit.value),
    fetchTop("top-clientes", limit.value),
  ]);

  const colorsMarcas = marcas.map((_, i) => palette(i));
  const colorsClientes = clientes.map((_, i) => palette(i + 3));

  chartMarcas.value = {
    data: {
      labels: marcas.map((m) => m.label),
      datasets: [
        {
          label: "Órdenes",
          data: marcas.map((m) => m.value),
          backgroundColor: colorsMarcas,
        },
      ],
    },
  };
  chartClientes.value = {
    data: {
      labels: clientes.map((c) => c.label),
      datasets: [
        {
          label: "Órdenes",
          data: clientes.map((c) => c.value),
          backgroundColor: colorsClientes,
        },
      ],
    },
  };
}

async function refreshAvg() {
  const { data } = await axios.get<{ seconds: number }>(
    `/api/stats/avg-finalizacion`
  );
  avgSeconds.value = data.seconds ?? 0;
}

function palette(i: number) {
  // Usa colores del tema para integrarse con Vuetify
  const colors = [
    getCssColor("primary"),
    getCssColor("success"),
    getCssColor("info"),
    getCssColor("warning"),
    getCssColor("error"),
    "#10B981",
    "#8B5CF6",
    "#F59E0B",
    "#60A5FA",
    "#EF4444",
  ];
  return colors[i % colors.length];
}

function getCssColor(name: string) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(
    `--v-theme-${name}`
  );
  // Vuetify expone las variables como "r,g,b"
  return v ? `rgb(${v.trim()})` : "#8884d8";
}

onMounted(async () => {
  await Promise.all([refreshCharts(), refreshAvg()]);
});

watch(limit, async () => {
  await refreshCharts();
});
</script>

<style scoped>
.opacity-70 {
  opacity: 0.7;
}
/* For charts to have some height */
:deep(canvas) {
  min-height: 260px;
}
</style>
