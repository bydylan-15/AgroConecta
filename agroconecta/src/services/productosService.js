import { db, storage, isFirebaseConfigured } from './firebase';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const DEMO_KEY = 'agro_demo_productos';
const fechaEnDias = (dias) => new Date(Date.now() + dias * 86400000).toISOString().split('T')[0];

const DATOS_INICIALES = [
  {
    id: 'prod-1',
    nombre: 'Tomates Barceló',
    categoria: 'Hortalizas',
    descripcion: 'Tomate fresco de invernadero, calibre grande, listo para despacho inmediato.',
    precio: 42,
    unidad: 'kg',
    cantidad: 150,
    agricultorId: 'demo-agricultor',
    agricultorNombre: 'Finquita Valle Verde',
    ubicacion: 'Constanza',
    fechaLimite: fechaEnDias(2),
    imagenUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'prod-2',
    nombre: 'Plátano Barahonero',
    categoria: 'Víveres y Tubérculos',
    descripcion: 'Racimos seleccionados de primera calidad, corte reciente.',
    precio: 22,
    unidad: 'unidad',
    cantidad: 500,
    agricultorId: 'demo-agricultor-2',
    agricultorNombre: 'Agropecuaria del Sur',
    ubicacion: 'Baní',
    fechaLimite: fechaEnDias(5),
    imagenUrl: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'prod-3',
    nombre: 'Cebolla Roja',
    categoria: 'Hortalizas',
    descripcion: 'Sacos curados y secos de alta durabilidad para restaurantes y supermercados.',
    precio: 48,
    unidad: 'kg',
    cantidad: 200,
    agricultorId: 'demo-agricultor',
    agricultorNombre: 'Finquita Valle Verde',
    ubicacion: 'Constanza',
    fechaLimite: fechaEnDias(1),
    imagenUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80'
  }
];

function getLocalProductos() {
  const saved = localStorage.getItem(DEMO_KEY);
  if (!saved) {
    localStorage.setItem(DEMO_KEY, JSON.stringify(DATOS_INICIALES));
    return DATOS_INICIALES;
  }
  return JSON.parse(saved);
}

export async function crearProducto(datos, archivoImagen) {
  let imagenUrl = 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80';
  if (!isFirebaseConfigured) {
    const lista = getLocalProductos();
    const nuevo = { ...datos, id: 'prod-' + Date.now(), precio: Number(datos.precio), cantidad: Number(datos.cantidad), imagenUrl };
    localStorage.setItem(DEMO_KEY, JSON.stringify([nuevo, ...lista]));
    return nuevo;
  }
  if (archivoImagen) {
    const storageRef = ref(storage, `productos/${Date.now()}_${archivoImagen.name}`);
    await uploadBytes(storageRef, archivoImagen);
    imagenUrl = await getDownloadURL(storageRef);
  }
  return addDoc(collection(db, 'productos'), { ...datos, precio: Number(datos.precio), cantidad: Number(datos.cantidad), imagenUrl, creadoEn: serverTimestamp() });
}

export async function obtenerProductos() {
  if (!isFirebaseConfigured) return getLocalProductos();
  const q = query(collection(db, 'productos'), orderBy('creadoEn', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
