export function calcularCompatibilidad(solicitud, oferta) {
  const razones = [];
  let scorePrecio = 0;
  const precioOferta = Number(oferta.precioOfrecido);
  const presupuesto = Number(solicitud.presupuestoMax);

  if (precioOferta <= presupuesto) {
    const ahorro = presupuesto > 0 ? (presupuesto - precioOferta) / presupuesto : 0;
    scorePrecio = Math.min(35, 30 + ahorro * 5);
    razones.push(`Precio dentro del presupuesto (RD$ ${precioOferta})`);
  } else {
    const exceso = presupuesto > 0 ? (precioOferta - presupuesto) / presupuesto : 1;
    scorePrecio = Math.max(0, 35 * (1 - exceso * 2));
    razones.push(`Precio superior al presupuesto (RD$ ${precioOferta})`);
  }

  const cantOfrecida = Number(oferta.cantidadOfrecida);
  const cantRequerida = Number(solicitud.cantidadRequerida);
  const ratioCantidad = cantRequerida > 0 ? Math.min(1, cantOfrecida / cantRequerida) : 0;
  const scoreCantidad = ratioCantidad * 30;
  razones.push(
    ratioCantidad >= 1
      ? `Cubre el 100% de la cantidad (${cantRequerida} uds)`
      : `Cubre el ${Math.round(ratioCantidad * 100)}% del volumen requerido`
  );

  const mismaZona = oferta.ubicacion?.trim().toLowerCase() === solicitud.ubicacion?.trim().toLowerCase();
  const scoreUbicacion = mismaZona ? 20 : 8;
  razones.push(mismaZona ? `Misma zona geográfica (${oferta.ubicacion})` : `Zona distinta (${oferta.ubicacion || 'N/A'})`);

  const hoy = new Date();
  const limite = new Date(oferta.fechaLimite);
  const diasRestantes = Math.ceil((limite - hoy) / (1000 * 60 * 60 * 24));
  let scoreFecha = 5;

  if (diasRestantes <= 3) {
    scoreFecha = 15;
    razones.push(`Alta prioridad de salida (vence en ${Math.max(0, diasRestantes)} días)`);
  } else if (diasRestantes <= 7) {
    scoreFecha = 10;
    razones.push(`Comercialización próxima (${diasRestantes} días)`);
  } else {
    razones.push(`Lote con margen amplio (${diasRestantes} días)`);
  }

  const puntajeTotal = Math.round(scorePrecio + scoreCantidad + scoreUbicacion + scoreFecha);
  return {
    ...oferta,
    puntajeTotal,
    desglose: { precio: Math.round(scorePrecio), cantidad: Math.round(scoreCantidad), ubicacion: scoreUbicacion, fecha: scoreFecha },
    razones,
  };
}

export function ordenarOfertasCompatibles(solicitud, listaOfertas) {
  return listaOfertas.map((o) => calcularCompatibilidad(solicitud, o)).sort((a, b) => b.puntajeTotal - a.puntajeTotal);
}
