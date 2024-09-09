import React, { useEffect, useState } from 'react';
import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom';
import Register from './componentes/Register';
import Auth from './Auth';
import Dashboard from './componentes/Dashboard';
import Utilizadores from './componentes/Utilizadores';
import Espacos from './componentes/Espacos';
import Adicionar_espaco from './componentes/Adicionar_espaco';
import EditarEspaco from './componentes/Editar_espaco';
import Espaco_pormenor from './componentes/Espaco_pormenor';
import Utilizador_pormenor from './componentes/Utilizador_pormenor';
import Reservas from './componentes/Reservas';
import { UserContext } from './UserContext';
import './App.css';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './config/firebaseconfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import Homepage from './componentes/Homepage';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const q = query(collection(db, 'Utilizadores'), where('Ref_autenticacao', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          setUser({ id: userDoc.id, ...userDoc.data() });
        } else {
          console.log('No user found with Ref_autenticacao:', currentUser.uid);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <UserContext.Provider value={user}>
      <BrowserRouter>
        <div className="">
          <Routes>
            <Route path="/" element={user ? <Dashboard /> : <Navigate to="/auth" />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/Utilizadores" element={<Utilizadores />} />
            <Route path="/Espacos" element={<Espacos />} />
            <Route path="/adicionar_espacos" element={<Adicionar_espaco />} />
            <Route path="/espaco_pormenor" element={<Espaco_pormenor />} />
            <Route path="/editar_espaco" element={<EditarEspaco />} />
            <Route path="/utilizador_pormenor" element={<Utilizador_pormenor />} />
            <Route path="/Homepage" element={<Homepage />} />
            <Route path="/Reservas" element={<Reservas />} />
          </Routes>
        </div>
      </BrowserRouter>
    </UserContext.Provider>
  );
}

export default App;
