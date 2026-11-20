import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sprout, LogOut, LayoutDashboard, ShoppingBag, FileText, PackageCheck, RefreshCw } from 'lucide-react';

export default function Navbar() {
  const { userData, logout, entrarModoDemo } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const alternarRolDemo = () => {
    const nuevoRol = userData?.rol === 'agricultor' ? 'comprador' : 'agricultor';
    entrarModoDemo(nuevoRol);
  };

  return (
    <nav className="bg-agro-900 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <Sprout className="w-7 h-7 text-agro-500" />
          <span>AgroConecta <span className="text-xs bg-agro-700 px-2 py-0.5 rounded-full">RD</span></span>
        </Link>

        {userData && (
          <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
            <Link to="/catalogo" className="flex items-center gap-1 hover:text-agro-500">
              <ShoppingBag className="w-4 h-4" /> Catálogo
            </Link>
            <Link to="/solicitudes" className="flex items-center gap-1 hover:text-agro-500">
              <FileText className="w-4 h-4" /> Solicitudes y Ofertas
            </Link>
            <Link to="/pedidos" className="flex items-center gap-1 hover:text-agro-500">
              <PackageCheck className="w-4 h-4" /> Mis Pedidos
            </Link>
            <Link to="/dashboard" className="flex items-center gap-1 hover:text-agro-500">
              <LayoutDashboard className="w-4 h-4" /> Análisis y Sensores
            </Link>
            <div className="flex items-center gap-2 border-l border-agro-700 pl-3">
              <button
                onClick={alternarRolDemo}
                title="Cambiar rápido entre Agricultor y Comprador"
                className="flex items-center gap-1 text-xs bg-agro-600 hover:bg-agro-500 px-2.5 py-1 rounded uppercase font-bold"
              >
                <RefreshCw className="w-3 h-3" /> {userData.rol}
              </button>
              <span className="hidden md:inline text-agro-100">{userData.nombre}</span>
              <button onClick={handleLogout} title="Cerrar sesión" className="p-1.5 rounded hover:bg-agro-700 text-red-300">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
