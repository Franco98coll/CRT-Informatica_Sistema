<template>
  <v-container class="py-6">
    <v-row class="mb-4" align="center" justify="space-between">
      <v-col cols="12" md="6">
        <h2 class="text-h5 font-weight-bold">Clientes</h2>
        <div class="text-body-2 opacity-70">Gestioná tus clientes</div>
      </v-col>
      <v-col cols="12" md="6" class="d-flex justify-end ga-2">
        <v-text-field
          v-model="search"
          placeholder="Buscar por nombre, tel o documento"
          density="compact"
          hide-details
          style="max-width: 360px"
          @keyup.enter="onSearch"
        />
        <v-btn color="primary" @click="onSearch"
          ><v-icon>mdi-magnify</v-icon></v-btn
        >
        <v-btn color="primary" variant="tonal" @click="openCreate"
          ><v-icon>mdi-plus</v-icon></v-btn
        >
      </v-col>
    </v-row>

    <v-card>
      <v-data-table
        :headers="headers"
        :items="items"
        :loading="loading"
        hide-default-footer
        items-per-page="100"
        item-value="idCliente"
      >
        <template v-slot:[`item.actions`]="{ item }">
          <v-btn
            size="small"
            variant="text"
            icon="mdi-pencil"
            @click="openEdit(item)"
          />
          <v-btn
            size="small"
            variant="text"
            color="error"
            icon="mdi-delete"
            @click="askDelete(item)"
          />
        </template>
      </v-data-table>
    </v-card>

    <!-- Dialog create/edit -->
    <v-dialog v-model="dialog" max-width="480">
      <v-card>
        <v-card-title>{{
          form.id ? "Editar cliente" : "Nuevo cliente"
        }}</v-card-title>
        <v-card-text>
          <v-text-field v-model="form.NombreCliente" label="Nombre" required />
          <v-text-field v-model="form.TelefonoCliente" label="Teléfono" />
          <v-text-field v-model="form.DocumentoCliente" label="Documento" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialog = false">Cancelar</v-btn>
          <v-btn color="primary" @click="save" :loading="saving"
            ><v-icon>mdi-content-save</v-icon></v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Confirmaciones y toasts ahora con SweetAlert2 -->
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import Swal from "sweetalert2";
import {
  toastSuccess,
  alertError,
  confirmDanger,
  toastInfo,
} from "../../../utils/notify";
import {
  listClientes,
  searchClientes,
  createCliente,
  updateCliente,
  deleteCliente,
  type Cliente,
} from "../api/clients.api";

const headers = [
  { title: "ID", value: "idCliente", align: "end" as const, width: 80 },
  { title: "Nombre", value: "NombreCliente" },
  { title: "Teléfono", value: "TelefonoCliente" },
  { title: "Documento", value: "DocumentoCliente" },
  {
    title: "",
    value: "actions",
    sortable: false,
    align: "end" as const,
    width: 110,
  },
];

const items = ref<Cliente[]>([]);
const loading = ref(false);
const search = ref("");

const dialog = ref(false);
const saving = ref(false);
const form = ref<{
  id?: number;
  NombreCliente: string;
  TelefonoCliente?: string | null;
  DocumentoCliente?: string | null;
}>({ NombreCliente: "" });

const toDelete = ref<Cliente | null>(null);
const deleting = ref(false);

// usa utilidades centralizadas

async function loadAll() {
  loading.value = true;
  try {
    items.value = await listClientes();
  } catch (e: any) {
    alertError(e?.message || "Error al cargar");
  } finally {
    loading.value = false;
  }
}

async function onSearch() {
  if (!search.value.trim()) return loadAll();
  loading.value = true;
  try {
    items.value = await searchClientes(search.value.trim());
  } catch (e: any) {
    alertError(e?.message || "Error al buscar");
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  form.value = {
    NombreCliente: "",
    TelefonoCliente: null,
    DocumentoCliente: null,
  };
  dialog.value = true;
}

function openEdit(c: Cliente) {
  form.value = {
    id: c.idCliente,
    NombreCliente: c.NombreCliente,
    TelefonoCliente: c.TelefonoCliente,
    DocumentoCliente: c.DocumentoCliente,
  };
  dialog.value = true;
}

async function save() {
  if (!form.value.NombreCliente?.trim()) {
    toastSuccess("Ingresá el nombre");
    return;
  }
  try {
    saving.value = true;
    if (form.value.id) {
      await updateCliente(form.value.id, {
        NombreCliente: form.value.NombreCliente.trim(),
        TelefonoCliente: form.value.TelefonoCliente ?? null,
        DocumentoCliente: form.value.DocumentoCliente ?? null,
      });
      toastSuccess("Cliente actualizado");
    } else {
      await createCliente({
        NombreCliente: form.value.NombreCliente.trim(),
        TelefonoCliente: form.value.TelefonoCliente ?? null,
        DocumentoCliente: form.value.DocumentoCliente ?? null,
      });
      toastSuccess("Cliente creado");
    }
    dialog.value = false;
    await loadAll();
  } catch (e: any) {
    alertError(e?.message || "Error al guardar");
  } finally {
    saving.value = false;
  }
}

function askDelete(c: Cliente) {
  toDelete.value = c;
  // Se gestionará con Swal directamente en doDelete()
}

async function doDelete() {
  if (!toDelete.value) return;
  const c = toDelete.value;
  const ok = await Swal.fire({
    title: "Eliminar cliente",
    text: `¿Seguro que querés eliminar a "${c.NombreCliente}"?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#e53935",
  }).then((r) => r.isConfirmed);
  if (!ok) return;
  deleting.value = true;
  try {
    await deleteCliente(c.idCliente);
    toastSuccess("Cliente eliminado");
    await loadAll();
  } catch (e: any) {
    alertError(e?.message || "Error al eliminar");
  } finally {
    deleting.value = false;
  }
}

onMounted(loadAll);
</script>

<style scoped>
.opacity-70 {
  opacity: 0.7;
}
</style>
