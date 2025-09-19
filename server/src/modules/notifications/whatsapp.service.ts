export async function getClienteContactoByOrden(
  _idOrden: number
): Promise<{ nombre: string; telefono: string } | null> {
  return null;
}

export async function sendWhatsAppText(
  _to: string,
  _body: string
): Promise<void> {
  // no-op
}

export function isWhatsappEnabled(): boolean {
  return false;
}
