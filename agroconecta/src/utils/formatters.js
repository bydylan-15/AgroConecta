export function formatDOP(monto) {
  return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP', minimumFractionDigits: 2 }).format(Number(monto) || 0);
}

export function calcularDiasRestantes(fechaLimiteStr) {
  if (!fechaLimiteStr) return 99;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const limite = new Date(fechaLimiteStr + 'T00:00:00');
  return Math.ceil((limite - hoy) / (1000 * 60 * 60 * 24));
}
