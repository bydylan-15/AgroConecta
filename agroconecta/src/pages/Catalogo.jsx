import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { crearProducto, obtenerProductos } from '../services/productosService';
import { formatDOP, calcularDiasRestantes } from '../utils/formatters';
import Badge from '../components/ui/Badge';
import { PlusCircle, MapPin, Calendar, Search } from 'lucide-react';

export default function Catalogo() {
  const { userData } = useAuth();
  const [productos, setProductos] = useState([]);
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroZona, setFiltroZona] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [imagen, setImagen] = useState(null);
  const [nuevoProd, setNuevoProd] = useState({
    nombre: '', categoria: 'Hortalizas', descripcion: '', precio: '', unidad: 'kg', cantidad: '', ubicacion: userData?.ubicacion || 'Constanza', fechaLimite: ''
  });

  const cargar = async () => setProductos(await obtenerProductos());
  useEffect(() => { cargar(); }, []);

  const handlePublicar = async (e) => {
    e.preventDefault();
    await crearProducto({ ...nuevoProd, agricultorId: userData.uid, agricultorNombre: userData.nombre }, imagen);
    setMostrarForm(false);
    setNuevoProd({ nombre: '', categoria: 'Hortalizas', descripcion: '', precio: '', unidad: 'kg', cantidad: '', ubicacion: userData?.ubicacion || 'Constanza', fechaLimite: '' });
    setImagen(null);
    cargar();
  };

  const filtrados = productos.filter((p) => {
    const matchNombre = p.nombre.toLowerCase().includes(filtroTexto.toLowerCase());
    const matchZona = filtroZona ? p.ubicacion === filtroZona : true;
    return matchNombre && matchZona;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Catálogo Agrícola Disponible</h1>
          <p className="text-sm text-slate-500">Cosechas activas listas para comercialización directa</p>
        </div>
        {userData?.rol === 'agricultor' && (
          <button onClick={() => setMostrarForm(!mostrarForm)} className="flex items-center gap-2 bg-agro-600 hover:bg-agro-700 text-white px-4 py-2.5 rounded-lg font-semibold shadow-sm">
            <PlusCircle className="w-5 h-5" /> {mostrarForm ? 'Cerrar Formulario' : 'Publicar Lote de Cosecha'}
          </button>
        )}
      </div>

      {mostrarForm && userData?.rol === 'agricultor' && (
        <form onSubmit={handlePublicar} className="bg-white p-6 rounded-xl shadow-md border border-slate-200 mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <h2 className="md:col-span-3 font-bold text-lg text-agro-900">Nuevo Lote Disponible</h2>
          <input required placeholder="Producto (ej. Tomates Barceló)" value={nuevoProd.nombre} onChange={(e) => setNuevoProd({ ...nuevoProd, nombre: e.target.value })} className="border rounded-lg px-3 py-2" />
          <select value={nuevoProd.categoria} onChange={(e) => setNuevoProd({ ...nuevoProd, categoria: e.target.value })} className="border rounded-lg px-3 py-2 bg-white">
            <option>Hortalizas</option><option>Frutas</option><option>Víveres y Tubérculos</option><option>Granos y Cereales</option>
          </select>
          <input required type="number" placeholder="Precio por unidad (RD$)" value={nuevoProd.precio} onChange={(e) => setNuevoProd({ ...nuevoProd, precio: e.target.value })} className="border rounded-lg px-3 py-2" />
          <div className="flex gap-2">
            <input required type="number" placeholder="Cantidad" value={nuevoProd.cantidad} onChange={(e) => setNuevoProd({ ...nuevoProd, cantidad: e.target.value })} className="border rounded-lg px-3 py-2 w-2/3" />
            <select value={nuevoProd.unidad} onChange={(e) => setNuevoProd({ ...nuevoProd, unidad: e.target.value })} className="border rounded-lg px-3 py-2 w-1/3 bg-white">
              <option value="kg">kg</option><option value="quintal">quintal</option><option value="unidad">unidad</option>
            </select>
          </div>
          <input required placeholder="Ubicación" value={nuevoProd.ubicacion} onChange={(e) => setNuevoProd({ ...nuevoProd, ubicacion: e.target.value })} className="border rounded-lg px-3 py-2" />
          <div>
            <label className="text-xs text-slate-500 block">Fecha límite comercialización</label>
            <input required type="date" value={nuevoProd.fechaLimite} onChange={(e) => setNuevoProd({ ...nuevoProd, fechaLimite: e.target.value })} className="border rounded-lg px-3 py-1.5 w-full" />
          </div>
          <input placeholder="Descripción breve" value={nuevoProd.descripcion} onChange={(e) => setNuevoProd({ ...nuevoProd, descripcion: e.target.value })} className="border rounded-lg px-3 py-2 md:col-span-2" />
          <input type="file" accept="image/*" onChange={(e) => setImagen(e.target.files[0])} className="text-sm text-slate-600" />
          <button type="submit" className="md:col-span-3 bg-agro-600 text-white font-semibold py-2.5 rounded-lg hover:bg-agro-700">Guardar y Publicar Cosecha</button>
        </form>
      )}

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input placeholder="Buscar producto..." value={filtroTexto} onChange={(e) => setFiltroTexto(e.target.value)} className="w-full pl-9 pr-3 py-2 border rounded-lg bg-white" />
        </div>
        <select value={filtroZona} onChange={(e) => setFiltroZona(e.target.value)} className="border rounded-lg px-3 py-2 bg-white">
          <option value="">Todas las zonas</option>
          <option value="Constanza">Constanza</option><option value="San Cristóbal">San Cristóbal</option><option value="Santo Domingo">Santo Domingo</option><option value="La Vega">La Vega</option><option value="Baní">Baní</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtrados.map((prod) => {
          const dias = calcularDiasRestantes(prod.fechaLimite);
          return (
            <div key={prod.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
              <img src={prod.imagenUrl} alt={prod.nombre} className="h-44 w-full object-cover" />
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h3 className="font-bold text-lg text-slate-900">{prod.nombre}</h3>
                    <Badge variant={dias <= 3 ? 'red' : 'green'}>{dias <= 3 ? `Urgente (${Math.max(0, dias)}d)` : prod.categoria}</Badge>
                  </div>
                  <p className="text-xs text-slate-500 mb-2">Productor: <strong>{prod.agricultorNombre}</strong></p>
                  <p className="text-sm text-slate-600 mb-3">{prod.descripcion}</p>
                </div>
                <div className="border-t pt-3 mt-2 space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">Precio:</span><span className="font-bold text-agro-700">{formatDOP(prod.precio)} / {prod.unidad}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Disponible:</span><span className="font-semibold">{prod.cantidad} {prod.unidad}</span></div>
                  <div className="flex justify-between text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {prod.ubicacion}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Límite: {prod.fechaLimite}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
