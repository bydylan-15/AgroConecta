import { db, isFirebaseConfigured } from './firebase';
import { collection, addDoc, getDocs, doc, query, where, orderBy, runTransaction, serverTimestamp } from 'firebase/firestore';

const SOL_KEY = 'agro_demo_solicitudes';
const OF_KEY = 'agro_demo_ofertas';
const PED_KEY = 'agro_demo_pedidos';
const PROD_KEY = 'agro_demo_productos';
const fechaEnDias = (dias) => new Date(Date.now() + dias * 86400000).toISOString().split('T')[0];

function initDemoComercio() {
  if (!localStorage.getItem(SOL_KEY)) {
    localStorage.setItem(SOL_KEY, JSON.stringify([
      {
        id: 'sol-1',
        compradorId: 'demo-comprador',
        compradorNombre: 'Restaurante El Conuco',
        productoRequerido: 'Tomates',
        cantidadRequerida: 100,
        presupuestoMax: 45,
        ubicacion: 'Santo Domingo',
        estado: 'abierta'
      }
    ]));
  }
  if (!localStorage.getItem(OF_KEY)) {
    localStorage.setItem(OF_KEY, JSON.stringify([
      {
        id: 'of-1',
        solicitudId: 'sol-1',
        agricultorId: 'demo-agricultor',
        agricultorNombre: 'Finquita Valle Verde',
        productoId: 'prod-1',
        productoNombre: 'Tomates Barceló',
        cantidadOfrecida: 150,
        precioOfrecido: 42,
        ubicacion: 'Constanza',
        fechaLimite: fechaEnDias(2),
        estado: 'pendiente'
      },
      {
        id: 'of-2',
        solicitudId: 'sol-1',
        agricultorId: 'demo-agricultor-3',
        agricultorNombre: 'Finca Los Hidalgos',
        productoId: 'prod-99',
        productoNombre: 'Tomate Saladette',
        cantidadOfrecida: 80,
        precioOfrecido: 47,
        ubicacion: 'San Cristóbal',
        fechaLimite: fechaEnDias(8),
        estado: 'pendiente'
      }
    ]));
  }
  if (!localStorage.getItem(PED_KEY)) localStorage.setItem(PED_KEY, JSON.stringify([]));
}

export async function crearSolicitud(datos) {
  if (!isFirebaseConfigured) {
    initDemoComercio();
    const lista = JSON.parse(localStorage.getItem(SOL_KEY));
    const nueva = { ...datos, id: 'sol-' + Date.now(), cantidadRequerida: Number(datos.cantidadRequerida), presupuestoMax: Number(datos.presupuestoMax), estado: 'abierta' };
    localStorage.setItem(SOL_KEY, JSON.stringify([nueva, ...lista]));
    return nueva;
  }
  return addDoc(collection(db, 'solicitudes'), { ...datos, cantidadRequerida: Number(datos.cantidadRequerida), presupuestoMax: Number(datos.presupuestoMax), estado: 'abierta', creadoEn: serverTimestamp() });
}

export async function obtenerSolicitudes() {
  if (!isFirebaseConfigured) { initDemoComercio(); return JSON.parse(localStorage.getItem(SOL_KEY)); }
  const q = query(collection(db, 'solicitudes'), orderBy('creadoEn', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function enviarOferta(datos) {
  if (!isFirebaseConfigured) {
    initDemoComercio();
    const lista = JSON.parse(localStorage.getItem(OF_KEY));
    const nueva = { ...datos, id: 'of-' + Date.now(), cantidadOfrecida: Number(datos.cantidadOfrecida), precioOfrecido: Number(datos.precioOfrecido), estado: 'pendiente' };
    localStorage.setItem(OF_KEY, JSON.stringify([nueva, ...lista]));
    return nueva;
  }
  return addDoc(collection(db, 'ofertas'), { ...datos, cantidadOfrecida: Number(datos.cantidadOfrecida), precioOfrecido: Number(datos.precioOfrecido), estado: 'pendiente', creadoEn: serverTimestamp() });
}

export async function obtenerOfertasPorSolicitud(solicitudId) {
  if (!isFirebaseConfigured) {
    initDemoComercio();
    return JSON.parse(localStorage.getItem(OF_KEY)).filter((o) => o.solicitudId === solicitudId);
  }
  const q = query(collection(db, 'ofertas'), where('solicitudId', '==', solicitudId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function aceptarOfertaYCrearPedido(solicitud, oferta) {
  if (!isFirebaseConfigured) {
    const prods = JSON.parse(localStorage.getItem(PROD_KEY) || '[]');
    const cantidadCompra = Math.min(Number(solicitud.cantidadRequerida), Number(oferta.cantidadOfrecida));
    const updatedProds = prods.map((p) => p.id === oferta.productoId ? { ...p, cantidad: Math.max(0, Number(p.cantidad) - cantidadCompra) } : p);
    localStorage.setItem(PROD_KEY, JSON.stringify(updatedProds));

    const sols = JSON.parse(localStorage.getItem(SOL_KEY)).map((s) => s.id === solicitud.id ? { ...s, estado: 'cerrada' } : s);
    localStorage.setItem(SOL_KEY, JSON.stringify(sols));

    const ofs = JSON.parse(localStorage.getItem(OF_KEY)).map((o) => o.id === oferta.id ? { ...o, estado: 'aceptada' } : o);
    localStorage.setItem(OF_KEY, JSON.stringify(ofs));

    const peds = JSON.parse(localStorage.getItem(PED_KEY) || '[]');
    peds.unshift({
      id: 'ped-' + Date.now(),
      compradorNombre: solicitud.compradorNombre,
      agricultorNombre: oferta.agricultorNombre,
      productoNombre: oferta.productoNombre,
      cantidad: cantidadCompra,
      precioUnitario: Number(oferta.precioOfrecido),
      total: cantidadCompra * Number(oferta.precioOfrecido),
      estado: 'confirmado'
    });
    localStorage.setItem(PED_KEY, JSON.stringify(peds));
    return;
  }

  const productoRef = doc(db, 'productos', oferta.productoId);
  const solicitudRef = doc(db, 'solicitudes', solicitud.id);
  const ofertaRef = doc(db, 'ofertas', oferta.id);
  const nuevoPedidoRef = doc(collection(db, 'pedidos'));

  await runTransaction(db, async (transaction) => {
    const prodSnap = await transaction.get(productoRef);
    if (!prodSnap.exists()) throw new Error('El lote del producto ya no existe.');
    const stockActual = Number(prodSnap.data().cantidad);
    const cantidadCompra = Math.min(Number(solicitud.cantidadRequerida), Number(oferta.cantidadOfrecida));
    if (stockActual < cantidadCompra) throw new Error(`Inventario insuficiente. Quedan ${stockActual}.`);

    transaction.update(productoRef, { cantidad: stockActual - cantidadCompra });
    transaction.update(solicitudRef, { estado: 'cerrada' });
    transaction.update(ofertaRef, { estado: 'aceptada' });
    transaction.set(nuevoPedidoRef, {
      compradorId: solicitud.compradorId,
      compradorNombre: solicitud.compradorNombre,
      agricultorId: oferta.agricultorId,
      agricultorNombre: oferta.agricultorNombre,
      ofertaId: oferta.id,
      productoId: oferta.productoId,
      productoNombre: oferta.productoNombre,
      cantidad: cantidadCompra,
      precioUnitario: Number(oferta.precioOfrecido),
      total: cantidadCompra * Number(oferta.precioOfrecido),
      estado: 'confirmado',
      creadoEn: serverTimestamp()
    });
  });
}

export async function obtenerPedidos() {
  if (!isFirebaseConfigured) { initDemoComercio(); return JSON.parse(localStorage.getItem(PED_KEY)); }
  const q = query(collection(db, 'pedidos'), orderBy('creadoEn', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
