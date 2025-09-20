<template>
  <v-app>
    <v-app-bar
      app
      class="appbar-center"
      elevation="0"
      :color="
        $route.meta?.hideNavActions
          ? 'transparent'
          : isDark
          ? 'surface'
          : 'primary'
      "
    >
      <v-app-bar-title
        class="font-weight-bold d-flex align-center"
        :style="{
          color:
            $route.meta?.hideNavActions || isDark
              ? 'rgb(var(--v-theme-on-surface))'
              : 'rgb(var(--v-theme-on-primary))',
        }"
      >
        <div class="brand d-flex align-center">
          <img src="/src/img/CRT.png" alt="CRT" height="50" class="logo" />
          <span class="brand-text ml-2">CRT Gestion</span>
        </div>
      </v-app-bar-title>
      <v-spacer />
      <template v-if="!$route.meta?.hideNavActions">
        <div class="nav-actions d-flex align-center ga-2">
          <v-btn
            variant="text"
            :color="isDark ? 'on-surface' : 'on-primary'"
            to="/"
            >Inicio</v-btn
          >
          <v-btn
            v-if="false"
            variant="text"
            :color="isDark ? 'on-surface' : 'on-primary'"
            to="/users"
            >Usuarios</v-btn
          >
          <v-btn
            variant="text"
            :color="isDark ? 'on-surface' : 'on-primary'"
            to="/ordenes/nueva"
            >Nueva Orden</v-btn
          >
          <v-btn
            variant="text"
            :color="isDark ? 'on-surface' : 'on-primary'"
            to="/ordenes"
            >Órdenes</v-btn
          >
          <v-btn
            variant="text"
            :color="isDark ? 'on-surface' : 'on-primary'"
            to="/clientes"
            >Clientes</v-btn
          >
          <v-btn
            variant="text"
            :color="isDark ? 'on-surface' : 'on-primary'"
            to="/estadisticas"
            >Estadísticas</v-btn
          >
          <v-divider
            vertical
            class="mx-2"
            :color="isDark ? 'on-surface' : 'on-primary'"
          />
          <v-menu location="bottom end">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                icon
                :color="isDark ? 'on-surface' : 'on-primary'"
                :title="'Cambiar color de acento'"
              >
                <v-icon>mdi-palette-swatch</v-icon>
              </v-btn>
            </template>
            <v-sheet class="pa-2" elevation="3" rounded>
              <div class="d-flex ga-2">
                <v-btn
                  v-for="key in accentKeys"
                  :key="key"
                  size="small"
                  icon
                  :style="{
                    backgroundColor: isDark
                      ? accentOptions[key].dark
                      : accentOptions[key].light,
                    border:
                      currentAccent === key
                        ? '2px solid #fff'
                        : '2px solid transparent',
                  }"
                  @click="changeAccentFromKey(key)"
                />
              </div>
            </v-sheet>
          </v-menu>
          <v-divider
            vertical
            class="mx-2"
            :color="isDark ? 'on-surface' : 'on-primary'"
          />

          <template v-if="token">
            <v-menu location="bottom end">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  variant="text"
                  :color="isDark ? 'on-surface' : 'on-primary'"
                  class="px-2"
                >
                  <v-avatar
                    size="28"
                    class="mr-2"
                    color="white"
                    variant="tonal"
                  >
                    <v-icon size="20">mdi-account</v-icon>
                  </v-avatar>
                  <span class="text-body-2">{{ me?.name || me?.email }}</span>
                  <v-icon class="ml-1" size="18">mdi-chevron-down</v-icon>
                </v-btn>
              </template>
              <v-list density="comfortable" min-width="220">
                <v-list-item
                  :title="me?.name || me?.email"
                  prepend-icon="mdi-account"
                />
                <v-divider class="my-1" />
                <v-list-item
                  title="Cerrar sesión"
                  prepend-icon="mdi-logout"
                  @click="onLogout"
                />
              </v-list>
            </v-menu>
          </template>
        </div>
      </template>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useTheme } from "vuetify";
import { useAuth } from "./modules/auth/composables/useAuth";

const router = useRouter();
const { token, me, logout } = useAuth();
const theme = useTheme();
const isDark = computed(() => theme.global.current.value.dark);

type AccentKey = "steel" | "teal" | "violet" | "amber";
const accentOptions: Record<AccentKey, { light: string; dark: string }> = {
  steel: { light: "#6B7280", dark: "#9CA3AF" },
  teal: { light: "#0D9488", dark: "#2DD4BF" },
  violet: { light: "#7C3AED", dark: "#A78BFA" },
  amber: { light: "#B45309", dark: "#F59E0B" },
};
const currentAccent = ref<AccentKey>(
  (localStorage.getItem("theme:accent") as AccentKey) || "steel"
);
const accentKeys = Object.keys(accentOptions) as AccentKey[];

function applyAccent(accent: AccentKey) {
  const acc = accentOptions[accent];
  if (!acc) return;
  const themes = theme.themes.value as any;
  if (themes.crtLight?.colors) themes.crtLight.colors.primary = acc.light;
  if (themes.crtDark?.colors) themes.crtDark.colors.primary = acc.dark;
}

function changeAccent(accent: AccentKey) {
  currentAccent.value = accent;
  localStorage.setItem("theme:accent", accent);
  applyAccent(accent);
}

function changeAccentFromKey(key: string) {
  changeAccent(key as AccentKey);
}

onMounted(() => {
  applyAccent(currentAccent.value);
});

function onLogout() {
  logout();
  router.replace({ name: "login" });
}
</script>

<style scoped>
.app-bar-glass {
  backdrop-filter: saturate(160%) blur(10px);
  background: rgba(255, 255, 255, 0.6) !important;
}
.appbar-center :deep(.v-toolbar__content) {
  align-items: center;
}
.nav-actions {
  align-self: center;
}
.logo {
  display: block;
}
.brand-text {
  line-height: 1;
  display: inline-flex;
  align-items: center;
}
.brand {
  display: inline-flex;
  align-items: center;
}
</style>
