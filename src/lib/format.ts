export function formatDate(iso: string | null | undefined): string {
  if (!iso) {
    return '-';
  }
  return new Date(iso).toLocaleString('es-CL', {
    dateStyle: 'short',
    timeStyle: 'medium',
  });
}
