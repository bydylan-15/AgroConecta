import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Sprout } from 'lucide-react';

export default function Login() {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, entrarModoDemo } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await login(correo, password);
      navigate('/catalogo');
    } catch (err) {
      setError('Credenciales inválidas. Verifica correo y contraseña.');
    }
  };

  const accesoRapido = (rol) => {
    entrarModoDemo(rol);
    navigate('/catalogo');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full border border-slate-200">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-agro-100 p-3 rounded-full text-agro-600 mb-2">
            <Sprout className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">AgroConecta RD</h1>
          <p className="text-sm text-slate-500">Del campo al mercado, sin barreras</p>
        </div>

        <div className="bg-agro-50 border border-agro-200 rounded-xl p-3 mb-6">
          <p className="text-xs font-bold text-agro-900 uppercase mb-2 text-center">Acceso Rápido Demostración</p>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => accesoRapido('agricultor')} className="bg-agro-600 hover:bg-agro-700 text-white text-xs font-bold py-2 px-3 rounded-lg">
              🌱 Entrar como Agricultor
            </button>
            <button onClick={() => accesoRapido('comprador')} className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 px-3 rounded-lg">
              🏪 Entrar como Comprador
            </button>
          </div>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" required value={correo} onChange={(e) => setCorreo(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2" placeholder="Correo electrónico" />
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2" placeholder="Contraseña" />
          <button type="submit" className="w-full bg-agro-600 hover:bg-agro-700 text-white font-semibold py-2.5 rounded-lg">Iniciar Sesión</button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          ¿No tienes cuenta? <Link to="/register" className="text-agro-600 font-semibold hover:underline">Regístrate aquí</Link>
        </p>
      </div>
    </div>
  );
}
