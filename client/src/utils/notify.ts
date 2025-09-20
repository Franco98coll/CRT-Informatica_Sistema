import Swal from "sweetalert2";

export function toastSuccess(title: string, text?: string) {
  Swal.fire({
    toast: true,
    position: "top-end",
    icon: "success",
    title,
    text,
    showConfirmButton: false,
    timer: 1800,
    timerProgressBar: true,
  });
}

export function toastInfo(title: string, text?: string) {
  Swal.fire({
    toast: true,
    position: "top-end",
    icon: "info",
    title,
    text,
    showConfirmButton: false,
    timer: 1800,
    timerProgressBar: true,
  });
}

export function toastError(title: string, text?: string) {
  Swal.fire({
    toast: true,
    position: "top-end",
    icon: "error",
    title,
    text,
    showConfirmButton: false,
    timer: 2200,
    timerProgressBar: true,
  });
}

export function alertError(message: string, title = "Error") {
  Swal.fire({ title, text: message, icon: "error" });
}

export async function confirmDanger(opts: {
  title: string;
  text?: string;
  confirmText?: string;
}): Promise<boolean> {
  const { title, text, confirmText } = opts;
  const res = await Swal.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: confirmText || "Sí, continuar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#e53935",
  });
  return res.isConfirmed;
}
