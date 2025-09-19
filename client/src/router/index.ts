import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import { useAuth } from "@/modules/auth/composables/useAuth";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "home",
    component: () => import("@/views/HomeView.vue"),
  },
  {
    // usuarios eliminado
    path: "/usuarios", // mantener placeholder por si hay links viejos
    redirect: "/",
  },
  {
    path: "/ordenes/nueva",
    name: "ordenes-nueva",
    component: () => import("@/modules/ordenes/views/NuevaOrdenView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/ordenes",
    name: "ordenes-list",
    component: () => import("@/modules/ordenes/views/OrdenesListView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/ordenes/:id",
    name: "ordenes-edit",
    component: () => import("@/modules/ordenes/views/OrdenEditView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/login",
    name: "login",
    component: () => import("@/modules/auth/views/LoginView.vue"),
    meta: { hideNavActions: true },
  },
  {
    path: "/seguimiento",
    name: "track-order",
    component: () => import("@/views/TrackOrderView.vue"),
    meta: { hideNavActions: true },
  },
  {
    path: "/estadisticas",
    name: "estadisticas",
    component: () => import("@/views/StatsView.vue"),
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const { token } = useAuth();
  if (to.meta?.requiresAuth && !token.value) {
    return { name: "login", query: { redirect: to.fullPath } };
  }
  return true;
});

export default router;
