import "vuetify/styles";
import "@mdi/font/css/materialdesignicons.css";
import { createVuetify } from "vuetify";
import { aliases, mdi } from "vuetify/iconsets/mdi";

const crtLight = {
  dark: false,
  colors: {
    background: "#F5F7FA",
    surface: "#FFFFFF",
    "surface-variant": "#EEF1F5",
    primary: "#0E7C86", // teal sobrio
    secondary: "#6B7280", // gray-500
    success: "#16A34A",
    info: "#0284C7",
    warning: "#D97706",
    error: "#DC2626",
    // estados de orden
    "order-created": "#2563EB", // azul
    "order-diagnosis": "#7C3AED", // violeta
    "order-repair": "#D97706", // naranja
    "order-finalized": "#16A34A", // verde
    "order-delivered": "#0D9488", // teal
    // estados de presupuesto
    "budget-pending": "#F59E0B", // amber
    "budget-approved": "#059669", // emerald
    "budget-rejected": "#DC2626", // red
    "budget-review": "#4F46E5", // indigo
  },
};

const crtDark = {
  dark: true,
  colors: {
    background: "#0F1115",
    surface: "#151A22",
    "surface-variant": "#1E2530",
    primary: "#2DD4BF", // teal más vivo en oscuro
    secondary: "#9CA3AF",
    success: "#22C55E",
    info: "#60A5FA",
    warning: "#F59E0B",
    error: "#F87171",
    // estados de orden
    "order-created": "#60A5FA",
    "order-diagnosis": "#A78BFA",
    "order-repair": "#F59E0B",
    "order-finalized": "#34D399",
    "order-delivered": "#2DD4BF",
    // estados de presupuesto
    "budget-pending": "#F59E0B",
    "budget-approved": "#34D399",
    "budget-rejected": "#F87171",
    "budget-review": "#818CF8",
  },
};

const savedTheme = "crtDark";

const vuetify = createVuetify({
  theme: {
    defaultTheme: savedTheme,
    themes: { crtDark },
  },
  defaults: {
    VBtn: { rounded: "lg", color: "primary", variant: "tonal" },
    VCard: { rounded: "xl", elevation: 4 },
    VTextField: {
      variant: "outlined",
      density: "comfortable",
      color: "primary",
    },
    VSelect: { variant: "outlined", density: "comfortable", color: "primary" },
    VAutocomplete: {
      variant: "outlined",
      density: "comfortable",
      color: "primary",
    },
    VDataTable: { density: "comfortable" },
  },
  icons: {
    defaultSet: "mdi",
    aliases,
    sets: { mdi },
  },
});
export default vuetify;
