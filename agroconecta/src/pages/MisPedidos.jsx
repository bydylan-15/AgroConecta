import { useEffect, useState } from 'react';
import { obtenerPedidos } from '../services/comercioService';
import { formatDOP } from '../utils/formatters';
import Badge from '../components/ui/Badge';

export default function MisPedidos() {
  const [pedidos, setPedidos] = useState([]);
  useEffect(() => { obtenerPedidos().then(setPedidos); }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Historial de Pedidos Confirmados</h1>
      <p className="text-sm text-slate-500 mb-6">Transacciones cerradas con descuento automático de inventario</p>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b text-slate-600">
            <tr><th className="p-4">Producto</th><th className="p-4">Productor</th><th className="p-4">Comprador</th><th className="p-4">Cantidad</th><th className="p-4">Precio Unit.</th><th className="p-4">Total (RD$)</th><th className="p-4">Estado</th></tr>
          </thead>
          <tbody className="divide-y">
            {pedidos.map((ped) => (
              <tr key={ped.id} className="hover:bg-slate-50">
                <td className="p-4 font-semibold text-slate-900">{ped.productoNombre}</td>
                <td className="p-4">{ped.agricultorNombre}</td>
                <td className="p-4">{ped.compradorNombre}</td>
                <td className="p-4">{ped.cantidad} uds</td>
                <td className="p-4">{formatDOP(ped.precioUnitario)}</td>
                <td className="p-4 font-bold text-agro-700">{formatDOP(ped.total)}</td>
                <td className="p-4"><Badge variant="green">{ped.estado}</Badge></td>
              </tr>
            ))}
            {pedidos.length === 0 && <tr><td colSpan="7" className="p-6 text-center text-slate-400">Aún no hay pedidos confirmados.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
