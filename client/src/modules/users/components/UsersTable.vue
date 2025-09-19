<template>
  <v-card>
    <v-card-title>Usuarios</v-card-title>
    <v-data-table :items="items" :loading="loading" :headers="headers" />
  </v-card>
</template>

<script setup lang="ts">
import type { User } from "../composables/useUsers";

const props = defineProps<{ items: User[]; loading: boolean }>();

const headers = [
  { title: "ID", key: "id" },
  { title: "Nombre", key: "name" },
  { title: "Email", key: "email" },
];
</script>
