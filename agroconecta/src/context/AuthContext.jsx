import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, isFirebaseConfigured } from '../services/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const entrarModoDemo = (rol) => {
    const perfilDemo = rol === 'agricultor'
      ? { uid: 'demo-agricultor', nombre: 'Finquita Valle Verde', correo: 'productor@agro.do', rol: 'agricultor', ubicacion: 'Constanza' }
      : { uid: 'demo-comprador', nombre: 'Restaurante El Conuco', correo: 'comprador@agro.do', rol: 'comprador', ubicacion: 'Santo Domingo' };
    setUser({ uid: perfilDemo.uid, email: perfilDemo.correo });
    setUserData(perfilDemo);
    localStorage.setItem('agro_demo_user', JSON.stringify(perfilDemo));
  };

  async function register({ nombre, correo, password, rol, telefono, ubicacion }) {
    if (!isFirebaseConfigured) {
      const perfil = { uid: 'user-' + Date.now(), nombre, correo, rol, telefono, ubicacion };
      setUser({ uid: perfil.uid, email: correo });
      setUserData(perfil);
      localStorage.setItem('agro_demo_user', JSON.stringify(perfil));
      return;
    }
    const cred = await createUserWithEmailAndPassword(auth, correo, password);
    const perfil = { uid: cred.user.uid, nombre, correo, rol, telefono, ubicacion, creadoEn: serverTimestamp() };
    await setDoc(doc(db, 'usuarios', cred.user.uid), perfil);
    setUserData(perfil);
  }

  function login(correo, password) {
    if (!isFirebaseConfigured) {
      entrarModoDemo(correo.includes('comprador') ? 'comprador' : 'agricultor');
      return Promise.resolve();
    }
    return signInWithEmailAndPassword(auth, correo, password);
  }

  function logout() {
    localStorage.removeItem('agro_demo_user');
    setUser(null);
    setUserData(null);
    return isFirebaseConfigured ? signOut(auth) : Promise.resolve();
  }

  useEffect(() => {
    if (!isFirebaseConfigured) {
      const saved = localStorage.getItem('agro_demo_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        setUser({ uid: parsed.uid, email: parsed.correo });
        setUserData(parsed);
      }
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const snap = await getDoc(doc(db, 'usuarios', currentUser.uid));
        if (snap.exists()) setUserData(snap.data());
      } else {
        setUserData(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <AuthContext.Provider value={{ user, userData, register, login, logout, entrarModoDemo, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
