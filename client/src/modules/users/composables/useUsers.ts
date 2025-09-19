import { ref } from "vue";
import axios from "axios";

export type User = {
  id: number;
  name: string;
  email: string;
};

export function useUsers() {
  const users = ref<User[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchUsers = async () => {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await axios.get<User[]>("/api/users");
      users.value = data;
    } catch (e: any) {
      error.value = e?.message ?? "Error al cargar usuarios";
    } finally {
      loading.value = false;
    }
  };

  return { users, loading, error, fetchUsers };
}
