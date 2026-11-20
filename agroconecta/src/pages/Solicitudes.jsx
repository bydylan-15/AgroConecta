import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { crearSolicitud, obtenerSolicitudes, enviarOferta, obtenerOfertasPorSolicitud, aceptarOfertaYCrearPedido } from '../services/comercioService';
import { obtenerProductos } from '../services/productosService';
import { ordenarOfertasCompatibles } from '../utils/matching';
import { formatDOP } from '../utils/formatters';
import Badge from '../components/ui/Badge';
import { Sparkles, CheckCircle2, Send } from 'lucide-react';

export default function Solicitudes() {
  const { userData } = useAuth();
  const [solicitudes, setSolicitudes] = useState([]);
  const [misProductos, setMisProductos] = useState([]);
  const [ofertasMap, setOfertasMap] = useState({});
  const [nuevaSol, setNuevaSol] = useState({ productoRequerido: '', cantidadRequerida: '', presupuestoMax: '', ubicacion: userData?.ubicacion || 'Santo Domingo' });
  const [solSeleccionada, setSolSeleccionada] = useState(null);
  const [productoElegidoId, setProductoElegidoId] = useState('');
  const [precioOferta, setPrecioOferta] = useState('');
  const [cantidadOferta, setCantidadOferta] = useState('');

  const cargarTodo = async () => {
    const sols = await obtenerSolicitudes();
    setSolicitudes(sols);
    const mapa = {};
    for (const s of sols) {
      const rawOfertas = await obtenerOfertasPorSolicitud(s.id);
      mapa[s.id] = ordenarOfertasCompatibles(s, rawOfertas);
    }
    setOfertasMap(mapa);
    if (userData?.rol === 'agricultor') {
      const prods = await obtenerProductos();
      setMisProductos(prods.filter((p) => p.agricultorId === userData.uid && p.cantidad > 0));
    }
  };

  useEffect(() => { cargarTodo(); }, [userData]);

  const handleCrearSolicitud = async (e) => {
    e.preventDefault();
    await crearSolicitud({ ...nuevaSol, compradorId: userData.uid, compradorNombre: userData.nombre });
    setNuevaSol({ productoRequerido: '', cantidadRequerida: '', presupuestoMax: '', ubicacion: userData?.ubicacion || 'Santo Domingo' });
    cargarTodo();
  };

  const handleEnviarOferta = async (e) => {
    e.preventDefault();
    const lote = misProductos.find((p) => p.id === productoElegidoId);
    if (!lote) return alert('Selecciona uno de tus lotes disponibles.');
    await enviarOferta({
      solicitudId: solSeleccionada.id, agricultorId: userData.uid, agricultorNombre: userData.nombre,
      productoId: lote.id, productoNombre: lote.nombre, cantidadOfrecida: Number(cantidadOferta || lote.cantidad),
      precioOfrecido: Number(precioOferta || lote.precio), ubicacion: lote.ubicacion, fechaLimite: lote.fechaLimite
    });
    setSolSeleccionada(null);
    cargarTodo();
  };

  const handleAceptarOferta = async (solicitud, oferta) => {
    try {
      await aceptarOfertaYCrearPedido(solicitud, oferta);
      alert('¡Pedido confirmado! El inventario del agricultor ha sido descontado automáticamente.');
      cargarTodo();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Solicitudes de Compra & Emparejamiento Inteligente</h1>
        <p className="text-sm text-slate-500">Las ofertas se ordenan automáticamente de 0 a 100 según precio (35%), volumen (30%), zona (20%) y fecha límite (15%)</p>
      </div>

      {userData?.rol === 'comprador' && (
        <form onSubmit={handleCrearSolicitud} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-5 gap-3">
          <input required placeholder="Producto requerido (ej. Tomates)" value={nuevaSol.productoRequerido} onChange={(e) => setNuevaSol({ ...nuevaSol, productoRequerido: e.target.value })} className="border rounded-lg px-3 py-2" />
          <input required type="number" placeholder="Cantidad (ej. 100)" value={nuevaSol.cantidadRequerida} onChange={(e) => setNuevaSol({ ...nuevaSol, cantidadRequerida: e.target.value })} className="border rounded-lg px-3 py-2" />
          <input required type="number" placeholder="Presupuesto máx. RD$/ud" value={nuevaSol.presupuestoMax} onChange={(e) => setNuevaSol({ ...nuevaSol, presupuestoMax: e.target.value })} className="border rounded-lg px-3 py-2" />
          <input required placeholder="Ubicación entrega" value={nuevaSol.ubicacion} onChange={(e) => setNuevaSol({ ...nuevaSol, ubicacion: e.target.value })} className="border rounded-lg px-3 py-2" />
          <button type="submit" className="bg-agro-600 hover:bg-agro-700 text-white font-semibold rounded-lg py-2 px-4">Publicar Solicitud</button>
        </form>
      )}

      <div className="space-y-6">
        {solicitudes.map((sol) => {
          const ofertas = ofertasMap[sol.id] || [];
          return (
            <div key={sol.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex flex-wrap justify-between items-start gap-4 border-b pb-4 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-900">Necesidad: {sol.productoRequerido}</h2>
                    <Badge variant={sol.estado === 'abierta' ? 'green' : 'gray'}>{sol.estado}</Badge>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">
                    Comprador: <strong>{sol.compradorNombre}</strong> • Volumen: <strong>{sol.cantidadRequerida} uds</strong> • Presupuesto máx: <strong>{formatDOP(sol.presupuestoMax)}/ud</strong> • Zona: <strong>{sol.ubicacion}</strong>
                  </p>
                </div>
                {userData?.rol === 'agricultor' && sol.estado === 'abierta' && (
                  <button onClick={() => setSolSeleccionada(sol)} className="flex items-center gap-1.5 bg-agro-600 hover:bg-agro-700 text-white text-sm font-semibold px-4 py-2 rounded-lg">
                    <Send className="w-4 h-4" /> Enviar Oferta con mi Lote
                  </button>
                )}
              </div>

              {solSeleccionada?.id === sol.id && (
                <form onSubmit={handleEnviarOferta} className="bg-agro-50 p-4 rounded-lg border border-agro-200 mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
                  <select required value={productoElegidoId} onChange={(e) => {
                    const prod = misProductos.find((p) => p.id === e.target.value);
                    setProductoElegidoId(e.target.value);
                    if (prod) { setPrecioOferta(prod.precio); setCantidadOferta(prod.cantidad); }
                  }} className="border rounded-lg px-3 py-2 bg-white">
                    <option value="">Selecciona tu lote...</option>
                    {misProductos.map((p) => <option key={p.id} value={p.id}>{p.nombre} ({p.cantidad} {p.unidad} a RD${p.precio})</option>)}
                  </select>
                  <input required type="number" placeholder="Cantidad ofrecida" value={cantidadOferta} onChange={(e) => setCantidadOferta(e.target.value)} className="border rounded-lg px-3 py-2 bg-white" />
                  <input required type="number" placeholder="Precio ofertado RD$" value={precioOferta} onChange={(e) => setPrecioOferta(e.target.value)} className="border rounded-lg px-3 py-2 bg-white" />
                  <div className="flex gap-2">
                    <button type="submit" className="flex-1 bg-agro-700 text-white font-semibold rounded-lg py-2">Confirmar</button>
                    <button type="button" onClick={() => setSolSeleccionada(null)} className="px-3 py-2 border rounded-lg bg-white">Cancelar</button>
                  </div>
                </form>
              )}

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" /> Ofertas Evaluadas por Compatibilidad ({ofertas.length})
                </h3>
                {ofertas.map((of, idx) => (
                  <div key={of.id} className={`p-4 rounded-xl border flex flex-wrap justify-between items-center gap-4 ${idx === 0 ? 'bg-agro-50/70 border-agro-400' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-agro-700 text-white text-xs font-bold px-2.5 py-1 rounded-md">Match: {of.puntajeTotal}/100 pts</span>
                        {idx === 0 && <Badge variant="green">Mejor Opción Recomendada</Badge>}
                        <span className="font-bold text-slate-900">{of.agricultorNombre}</span>
                      </div>
                      <p className="text-sm text-slate-700">Lote: <strong>{of.productoNombre}</strong> • Ofrece: <strong>{of.cantidadOfrecida} uds</strong> a <strong>{formatDOP(of.precioOfrecido)}/ud</strong></p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {of.razones.map((r, i) => <span key={i} className="text-xs bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded">✓ {r}</span>)}
                      </div>
                    </div>
                    {userData?.rol === 'comprador' && sol.estado === 'abierta' && of.estado === 'pendiente' && (
                      <button onClick={() => handleAceptarOferta(sol, of)} className="flex items-center gap-1.5 bg-slate-900 hover:bg-agro-700 text-white font-semibold px-4 py-2.5 rounded-lg">
                        <CheckCircle2 className="w-4 h-4" /> Aceptar Oferta y Crear Pedido
                      </button>
                    )}
                    {of.estado === 'aceptada' && <Badge variant="blue">Oferta Adjudicada</Badge>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
