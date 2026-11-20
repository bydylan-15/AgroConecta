import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const PROVINCIAS_RD = ['Santo Domingo', 'San Cristóbal', 'Constanza', 'La Vega', 'Baní', 'Santiago', 'Azua', 'Moca'];

export default function Register() {
  const [form, setForm] = useState({ nombre: '', correo: '', password: '', rol: 'agricultor', telefono: '', ubicacion: 'Constanza' });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await register(form);
      navigate('/catalogo');
    } catch (err) {
      setError('Error al registrar: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4 py-8">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Crear Cuenta</h2>
        <p className="text-sm text-slate-500 mb-6">Selecciona tu perfil comercial en AgroConecta</p>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {['agricultor', 'comprador'].map((rolOption) => (
              <button key={rolOption} type="button" onClick={() => setForm({ ...form, rol: rolOption })}
                className={`py-2.5 px-3 rounded-lg border font-semibold capitalize text-sm ${form.rol === rolOption ? 'bg-agro-600 text-white border-agro-600' : 'bg-white text-slate-700 border-slate-300'}`}>
                {rolOption === 'agricultor' ? '🌱 Soy Agricultor' : '🏪 Soy Comprador'}
              </button>
            ))}
          </div>
          <input type="text" required placeholder="Nombre o Razón Social" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2" />
          <input type="email" required placeholder="Correo electrónico" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2" />
          <input type="password" required placeholder="Contraseña" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2" />
          <div className="grid grid-cols-2 gap-3">
            <input type="tel" required placeholder="Teléfono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2" />
            <select value={form.ubicacion} onChange={(e) => setForm({ ...form, ubicacion: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white">
              {PROVINCIAS_RD.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <button type="submit" className="w-full bg-agro-600 hover:bg-agro-700 text-white font-semibold py-2.5 rounded-lg">Completar Registro</button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600">¿Ya tienes cuenta? <Link to="/login" className="text-agro-600 font-semibold">Inicia sesión</Link></p>
      </div>
    </div>
  );
}
