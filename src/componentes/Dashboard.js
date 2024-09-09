import React, { useEffect, useState, useContext } from 'react';
import Navbar from './Navbar';
import Aside from '../Aside';
import '../css/Dashboard.css'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import { UserContext } from '../UserContext';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../config/firebaseconfig';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = useContext(UserContext);

  const [Reservas, setReservas] = useState([]);
  const [ReservasCount, setReservasCount] = useState(0);

  const [Membros, setMembros] = useState([]);
  const [MembrosCount, setMembrosCount] = useState(0);

  const [Espacos, setEspacos] = useState([]);
  const [EspacosCount, setEspacosCount] = useState(0);

  const [espacosMap, setEspacosMap] = useState({});
  const [reservasHoje, setReservasHoje] = useState([]);

  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];

    // Fetch Reservas and filter those for the current day
    const q = query(collection(db, 'Reservas'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const allReservas = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReservas(allReservas);
      setReservasCount(allReservas.length);

      const reservasHoje = allReservas.filter(reserva => {
        const dataInicio = reserva.Data_inicio;
        const dataFim = reserva.Data_fim;
        return (dataInicio <= formattedDate && dataFim >= formattedDate);
      });

      setReservasHoje(reservasHoje);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'Utilizadores'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const UtilizadoresCard = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMembros(UtilizadoresCard);
      setMembrosCount(UtilizadoresCard.length);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'Espacos'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const EspacosCard = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Cria um mapa de ID_espaco para nome
      const espacosMap = EspacosCard.reduce((acc, espaco) => {
        acc[espaco.id] = espaco.nome;
        return acc;
      }, {});
      
      setEspacos(EspacosCard);
      setEspacosCount(EspacosCard.length);
      setEspacosMap(espacosMap); 
    });

    return () => unsubscribe();
  }, []);

  const getUserNameById = (id_utilizador) => {
    const user = Membros.find(member => member.Ref_autenticacao === id_utilizador);
    return user ? user.Nome : 'Utilizador Desconhecido';
  };

  return (
    <div className="dashboard-container">
      <Aside className="aside" />
      <div className="main-content">
        <Navbar className="navbar" />

        <div className="content_cardsDashboard" style={{ marginTop: "3em" }}>
          <div className="cardsDashboard card-1">
            <div className="card-header">
              <h3>Reservas</h3>
            </div>
            <div className="card-body">
              <p>{ReservasCount}</p>
            </div>
            <div className="card-footer card-footer-1">
              <p onClick={() => navigate("/Reservas")}>Ver mais...</p>
            </div>
          </div>

          <div className="cardsDashboard card-2">
            <div className="card-header">
              <h3>Utilizadores</h3>
            </div>
            <div className="card-body">
              <p>{MembrosCount}</p>
            </div>
            <div className="card-footer card-footer-2">
              <p onClick={() => navigate("/Utilizadores")}>Ver mais...</p>
            </div>
          </div>

          <div className="cardsDashboard card-3">
            <div className="card-header">
              <h3>Espaços</h3>
            </div>
            <div className="card-body">
              <p>{EspacosCount}</p>
            </div>
            <div className="card-footer card-footer-3">
              <p onClick={() => navigate("/Espacos")}>Ver mais...</p>
            </div>
          </div>
        </div>

        <div style={{ marginTop: "10em", width: '100%' }}>
          <h3>Reservas para Hoje</h3>
          <table className="table" style={{ width: '100%', tableLayout: 'fixed' }}>
            <thead>
              <tr>
                <th style={{ width: '5%' }}>#</th>
                <th style={{ width: '30%' }}>Utilizador</th>
                <th style={{ width: '30%' }}>Espaço</th>
                <th style={{ width: '20%' }}>Data Início</th>
                <th style={{ width: '15%' }}>Data Fim</th>
              </tr>
            </thead>
            <tbody>
              {reservasHoje.map((reserva, index) => (
                <tr key={reserva.id}>
                  <td>{index + 1}</td>
                  <td>{getUserNameById(reserva.ID_utilizador)}</td>
                  <td>{espacosMap[reserva.ID_espaco] || 'Espaço Desconhecido'}</td>
                  <td>{reserva.Data_inicio}</td>
                  <td>{reserva.Data_fim}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
