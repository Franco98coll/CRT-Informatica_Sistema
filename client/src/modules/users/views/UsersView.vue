<template>
  <v-container class="py-6">
    <v-row>
      <v-col cols="12" class="d-flex gap-2">
        <v-btn color="primary" @click="fetchUsers" :loading="loading"
          >Cargar usuarios</v-btn
        >
      </v-col>
      <v-col cols="12">
        <users-table :items="users" :loading="loading" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useUsers } from "../composables/useUsers";
import UsersTable from "../components/UsersTable.vue";

const { users, loading, fetchUsers } = useUsers();

onMounted(fetchUsers);
</script>
