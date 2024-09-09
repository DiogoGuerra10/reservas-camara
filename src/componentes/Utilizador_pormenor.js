import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Aside from "../Aside";
import Navbar from "./Navbar";
import { db } from '../config/firebaseconfig';
import { collection, query, where, onSnapshot, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import PerfilImage from "../imagens/default.jpg"; 
import 'bootstrap/dist/css/bootstrap.min.css';
import "../css/Utilizador_pormenor.css";
import { FaArrowCircleLeft, FaArrowCircleRight } from "react-icons/fa";
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { format } from 'date-fns';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '800px',
    bgcolor: 'background.paper',
    borderRadius: 5,
    boxShadow: 24,
    p: 4,
    textAlign: "center",
};

const Utilizador_pormenor = () => {
    const location = useLocation();
    const { ref_autenticacao } = location.state || {};
    const [utilizador, setUtilizador] = useState(null);
    const [reservas, setReservas] = useState([]);
    const [reservaStartIndex, setReservaStartIndex] = useState(0);
    const [verReserva, setVerReserva] = useState(null);
    const [open, setOpen] = useState(false);
    const cardsToShow = 4;
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (ref_autenticacao) {
            const q = query(collection(db, 'Utilizadores'), where('Ref_autenticacao', '==', ref_autenticacao));
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const userData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                if (userData.length > 0) {
                    setUtilizador(userData[0]);
                }
            });

            return () => unsubscribe();
        }
    }, [ref_autenticacao]);

    useEffect(() => {
        if (utilizador) {
            const reservasQuery = query(
                collection(db, 'Reservas'),
                where('ID_utilizador', '==', utilizador.Ref_autenticacao),
                orderBy('Data_fim', 'desc'),
                limit(10)  // Limite para os últimos 10 registros
            );
    
            const unsubscribe = onSnapshot(reservasQuery, async (querySnapshot) => {
                const reservasData = [];
                for (const docSnapshot of querySnapshot.docs) {
                    const data = docSnapshot.data();
                    const dataFim = data.Data_fim ? (data.Data_fim.toDate ? data.Data_fim.toDate() : new Date(data.Data_fim)) : new Date();
                    const dataInicio = data.Data_inicio ? (data.Data_inicio.toDate ? data.Data_inicio.toDate() : new Date(data.Data_inicio)) : new Date();
                    
                    // Buscar nome do espaço
                    const espacoRef = doc(db, 'Espacos', data.ID_espaco);
                    try {
                        const espacoDoc = await getDoc(espacoRef);
                        if (espacoDoc.exists()) {
                            const espacoData = espacoDoc.data();
                            reservasData.push({
                                id: docSnapshot.id,
                                ...data,
                                Data_fim: dataFim,
                                Data_inicio: dataInicio,
                                Nome_espaco: espacoData.nome || "Desconhecido"
                            });
                        } else {
                            reservasData.push({
                                id: docSnapshot.id,
                                ...data,
                                Data_fim: dataFim,
                                Data_inicio: dataInicio,
                                Nome_espaco: "Desconhecido"
                            });
                        }
                    } catch (error) {
                        console.error('Erro ao buscar documento do espaço:', error);
                    }
                }
                setReservas(reservasData);
                setLoading(false)
            }
        );
    
            return () => unsubscribe();
        }
    }, [utilizador]);

    const handleNextClick = () => {
        if (reservaStartIndex + cardsToShow < reservas.length) { 
            setReservaStartIndex(reservaStartIndex + 1);
        }
    };

    const handlePrevClick = () => {
        setReservaStartIndex(Math.max(0, reservaStartIndex - 1));
    };

    const handleOpen = (reserva) => {
        setVerReserva(reserva);
        setOpen(true);
    };

    const handleClose = () => setOpen(false);

    // Função para formatar data e hora
    const formatDate = (date) => {
        const dateObj = date.toDate ? date.toDate() : new Date(date);
        return format(dateObj, 'dd/MM/yyyy HH:mm:ss'); // Formata a data e a hora
    };

    // Função para formatar somente a data
    const formatDateOnly = (date) => {
        const dateObj = date.toDate ? date.toDate() : new Date(date);
        return format(dateObj, 'dd/MM/yyyy');
    };

    return (
        <div className="utilizadores-container" style={{marginTop:"50px"}}>
            <Aside className="aside" />
            <div className="main-content">
                <Navbar className="navbar" />
                
                {loading ? (
                    <p style={{ textAlign: 'center', color: '#083f26' }}>Carregando detalhes...</p>
                ) : utilizador ? (
                    <div className="mt-5 me-5" style={{ display: 'flex', alignItems: 'center' }}>
                        <div>
                            <div 
                                style={{ 
                                    backgroundImage: `url(${PerfilImage})`, 
                                    width: "200px", 
                                    height: "200px", 
                                    borderRadius: "50%", 
                                    backgroundPosition: "center", 
                                    backgroundSize: "cover", 
                                    backgroundRepeat: "no-repeat", 
                                    margin: "auto",
                                    marginLeft:"5px"
                                }}>
                            </div>
                        </div>
                        <div className="text-start ms-5" style={{ flex: 1 }}>
                            <h4 style={{fontSize: "24px", fontWeight: "600"}}>{utilizador.Nome}</h4>
                            <a href={`mailto:${utilizador.Email}`} style={{fontSize: "16px", fontWeight: "300"}}>{utilizador.Email}</a>    
                            <div className="dados-paciente" style={{ display: 'flex', justifyContent: 'space-between', marginTop: "20px" }}>
                                <div>
                                    <p style={{fontWeight: "600", fontSize: "16px"}}>Telm: <span style={{fontWeight: "300"}}>{utilizador.Telemovel}</span></p>
                                    <p style={{fontWeight: "600", fontSize: "16px"}}>Idade: <span style={{fontWeight: "300"}}>{utilizador.Idade}</span></p>
                                    <p style={{fontWeight: "600", fontSize: "16px"}}>Sexo: <span style={{fontWeight: "300"}}>{utilizador.Sexo}</span></p>
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <p style={{fontWeight: "600", fontSize: "16px"}}>Data início: <span style={{fontWeight: "300"}}>24/04/2023</span></p>
                                    <p style={{fontWeight: "600", fontSize: "16px"}}>Última sessão: <span style={{fontWeight: "300"}}>08/05/2024</span></p>
                                    <p style={{fontWeight: "600", fontSize: "16px"}}>Última Reserva: <span style={{fontWeight: "300"}}>10/05/2024</span> </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p style={{ textAlign: 'center', color: 'red' }}>Carregando detalhes do utilizador...</p>
                )}

                <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "5em"}}>
                    <FaArrowCircleLeft onClick={handlePrevClick} size={30} style={{cursor: 'pointer', color:"#083f26"}} />

                    {reservas.length > 0 && (
                        <span style={{margin: '0 10px', color:"#083f26", fontSize:"18px"}}>
                            {formatDateOnly(reservas[reservaStartIndex].Data_criacao)} - 
                            {formatDateOnly(reservas[Math.min(reservaStartIndex + cardsToShow - 1, reservas.length - 1)].Data_criacao)}
                        </span>
                    )}

                    <FaArrowCircleRight onClick={handleNextClick} size={30} style={{cursor: 'pointer', color:"#083f26"}} />
                </div>

                {loading ? (
                    <p style={{ textAlign: 'center', color: '#083f26' }}>Carregando reservas...</p>
                ) : reservas.length > 0 ? (
                    <div style={{display: "flex", flexWrap: 'wrap', gap: '10px'}}>
                        {reservas.slice(reservaStartIndex, reservaStartIndex + cardsToShow).map((reserva, index) => {
                            const dataCriacao = reserva.Data_criacao.toDate ? reserva.Data_criacao.toDate() : new Date(reserva.Data_criacao);
                            return (
                                <div key={index} className="card-report" style={{border: '1px solid #083f26', flex: '1 1 20%'}}>
                                    <div style={{display: "flex"}}>
                                        <p style={{fontSize: "11px", fontWeight: "500", color:"#083f26"}}>
                                            {formatDate(dataCriacao)} 
                                        </p>
                                    </div>    

                                    <p className='sintoma_report' style={{fontSize: "18px", fontWeight: "400" }}>{reserva.Nome_espaco}</p>

                                    <p style={{fontWeight: "300", color: '#083f26', position: "absolute", bottom: "0", cursor: "pointer" , fontSize:"15px"}} onClick={() => handleOpen(reserva)}>ver mais...</p>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p style={{textAlign: 'center'}}>Nenhuma reserva encontrada.</p>
                )}

                <Modal
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="modal-title"
                    aria-describedby="modal-description"
                >
                    <Box sx={style}>
                        {verReserva ? (
                            <div>
                                <h2 id="modal-title">{verReserva.Servico}</h2>
                                <p id="modal-description">
                                    <strong>Data Início:</strong> {formatDateOnly(verReserva.Data_inicio)}
                                </p>
                                <p id="modal-description">
                                    <strong>Data Fim:</strong> {formatDateOnly(verReserva.Data_fim)}
                                </p>
                                
                            </div>
                        ) : (
                            <p>Carregando detalhes da reserva...</p>
                        )}
                    </Box>
                </Modal>
            </div>
        </div>
    );
};

export default Utilizador_pormenor;