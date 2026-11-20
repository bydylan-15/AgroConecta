import { useEffect, useState } from 'react';
import { obtenerProductos } from '../services/productosService';
import { obtenerPedidos } from '../services/comercioService';
import { calcularDiasRestantes, formatDOP } from '../utils/formatters';
import Badge from '../components/ui/Badge';
import { AlertTriangle, Thermometer, Droplets, TrendingUp } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const [productos, setProductos] = useState([]);
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    obtenerProductos().then(setProductos);
    obtenerPedidos().then(setPedidos);
  }, []);

  const alertasUrgentes = productos.filter((p) => calcularDiasRestantes(p.fechaLimite) <= 3 && p.cantidad > 0);
  const grupos = {};
  productos.forEach((p) => {
    const key = p.nombre.trim();
    if (!grupos[key]) grupos[key] = [];
    grupos[key].push(Number(p.precio));
  });

  const etiquetas = Object.keys(grupos);
  const chartData = {
    labels: etiquetas.length ? etiquetas : ['Tomates', 'Plátanos', 'Cebolla'],
    datasets: [
      { label: 'Precio Mínimo (RD$)', data: etiquetas.length ? etiquetas.map((k) => Math.min(...grupos[k])) : [38, 18, 45], backgroundColor: '#22c55e' },
      { label: 'Precio Promedio (RD$)', data: etiquetas.length ? etiquetas.map((k) => Math.round(grupos[k].reduce((a, b) => a + b, 0) / grupos[k].length)) : [42, 22, 50], backgroundColor: '#0284c7' },
      { label: 'Precio Máximo (RD$)', data: etiquetas.length ? etiquetas.map((k) => Math.max(...grupos[k])) : [48, 25, 58], backgroundColor: '#f59e0b' }
    ]
  };

  const sensoresSimulados = [
    { lote: 'Almacén Constanza - Lote Tomates', temp: '14.2 °C', humedad: '86%' },
    { lote: 'Centro Acopio San Cristóbal - Víveres', temp: '21.5 °C', humedad: '74%' },
    { lote: 'Cámara Fría La Vega - Hortalizas', temp: '11.8 °C', humedad: '89%' }
  ];

  const volumenComercializado = pedidos.reduce((acc, p) => acc + Number(p.total || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Panel de Análisis, Alertas y Monitoreo</h1>
        <p className="text-sm text-slate-500">Indicadores comerciales registrados en AgroConecta RD</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm"><p className="text-xs font-semibold text-slate-500 uppercase">Lotes Activos</p><p className="text-3xl font-bold text-slate-900 mt-1">{productos.length}</p></div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm"><p className="text-xs font-semibold text-slate-500 uppercase">Pedidos Cerrados</p><p className="text-3xl font-bold text-agro-600 mt-1">{pedidos.length}</p></div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm"><p className="text-xs font-semibold text-slate-500 uppercase">Volumen Transado</p><p className="text-3xl font-bold text-slate-900 mt-1">{formatDOP(volumenComercializado)}</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-red-500" /> Alertas de Prioridad Comercial (≤ 3 días)</h2>
            <Badge variant="red">{alertasUrgentes.length} activas</Badge>
          </div>
          <p className="text-xs text-slate-500 mb-4">Aviso operativo basado en fechas límite declaradas por el agricultor (no constituye certificación sanitaria).</p>
          <div className="space-y-3">
            {alertasUrgentes.map((item) => {
              const dias = calcularDiasRestantes(item.fechaLimite);
              return (
                <div key={item.id} className="p-3.5 rounded-lg bg-red-50 border border-red-200 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-red-900">{item.nombre} ({item.cantidad} {item.unidad})</p>
                    <p className="text-xs text-red-700">Productor: {item.agricultorNombre} • {item.ubicacion}</p>
                  </div>
                  <Badge variant="red">{dias <= 0 ? 'Vence hoy' : `Vence en ${dias} día(s)`}</Badge>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2 mb-1"><TrendingUp className="w-5 h-5 text-agro-600" /> Análisis de Precios en AgroConecta (RD$)</h2>
          <p className="text-xs text-slate-500 mb-4">Valores mínimo, promedio y máximo calculados a partir de publicaciones internas de la plataforma.</p>
          <Bar data={chartData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div><h2 className="font-bold text-lg text-slate-900">Monitoreo de Almacenamiento</h2><p className="text-xs text-slate-500">Lecturas ambientales de referencia para preservación postcosecha</p></div>
          <Badge variant="yellow">Datos simulados de demostración</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sensoresSimulados.map((s, i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <p className="font-semibold text-sm text-slate-800 mb-3">{s.lote}</p>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5 text-sm font-bold text-blue-700"><Thermometer className="w-4 h-4" /> {s.temp}</span>
                <span className="flex items-center gap-1.5 text-sm font-bold text-cyan-700"><Droplets className="w-4 h-4" /> {s.humedad}</span>
                <Badge variant="gray">Simulado</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
