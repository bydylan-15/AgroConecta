import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/ui/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Catalogo from './pages/Catalogo';
import Solicitudes from './pages/Solicitudes';
import MisPedidos from './pages/MisPedidos';
import Dashboard from './pages/Dashboard';

function RutaPrivada({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/AgroConecta">
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/catalogo" element={<RutaPrivada><Catalogo /></RutaPrivada>} />
          <Route path="/solicitudes" element={<RutaPrivada><Solicitudes /></RutaPrivada>} />
          <Route path="/pedidos" element={<RutaPrivada><MisPedidos /></RutaPrivada>} />
          <Route path="/dashboard" element={<RutaPrivada><Dashboard /></RutaPrivada>} />
          <Route path="*" element={<Navigate to="/catalogo" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
