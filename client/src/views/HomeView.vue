<template>
  <v-container class="home-center" fluid>
    <div class="brand-wrap">
      <img :src="isDark ? logoDark : logoLight" alt="CRT" />
    </div>
  </v-container>
</template>
<script setup lang="ts">
import { computed } from "vue";
import { useTheme } from "vuetify";

const theme = useTheme();
const isDark = computed(() => theme.global.current.value.dark);
const logoLight = "/src/img/crt-cuadrado.jpg";
const logoDark = "/src/img/CRT.png";
</script>

<style scoped>
.home-center {
  min-height: calc(100vh - 64px);
  display: grid;
  place-items: center;
}
.brand-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 28px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.6);
  box-shadow: 0 10px 30px rgba(2, 6, 23, 0.08);
}
.brand-wrap img {
  max-width: min(70vw, 640px);
  height: auto;
}
.v-theme--crtDark .brand-wrap {
  background: rgba(21, 26, 34, 0.65);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
}

/* Mejor contraste en modo claro */
.v-theme--crtLight .brand-wrap {
  background: color-mix(in srgb, rgb(var(--v-theme-primary)) 10%, white 90%);
  border: 1px solid rgba(2, 6, 23, 0.06);
}
.v-theme--crtLight .brand-wrap img {
  filter: drop-shadow(0 8px 24px rgba(2, 6, 23, 0.15));
}
</style>
