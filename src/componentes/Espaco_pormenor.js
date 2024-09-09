import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebaseconfig'; 
import { getAuth } from 'firebase/auth';
import Aside from "../Aside";
import Aside_user from "../Aside_user";
import Navbar from "./Navbar"; 
import Navbar_user from './Navbar_user';
import { FaEdit, FaChevronDown, FaChevronUp } from "react-icons/fa";
import "../css/Espaco_pormenor.css";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EspacoPormenor = () => {
    const location = useLocation();
    const { espaco } = location.state || {}; // Valor padrão se o estado não estiver disponível
    const [userPerfil, setUserPerfil] = useState(null); // Estado para armazenar o perfil do usuário
    const [expand, setExpand] = useState(null); // Estado para controlar a expansão das seções
    const [startDate, setStartDate] = useState(''); //Input para startDate da reserva
    const [endDate, setEndDate] = useState(''); //Input para endDate da reserva
    const navigate = useNavigate();
    const ReservasDB = collection(db, "Reservas")

    useEffect(() => {
        const fetchUserPerfil = async () => {
            try {
                const auth = getAuth();
                const user = auth.currentUser;

                if (user) {
                    const q = query(collection(db, 'Utilizadores'), where('Ref_autenticacao', '==', user.uid));
                    const querySnapshot = await getDocs(q);

                    if (!querySnapshot.empty) {
                        const userData = querySnapshot.docs[0].data();
                        setUserPerfil(userData.Perfil);
                    } else {
                        toast.error('Utilizador não encontrado na coleção Utilizadores', {
                            toastStyle: { backgroundColor: '#ff9c0c', color: 'white' },
                        });
                    }
                } else {
                    toast.error('Nenhum utilizador encontrado autenticado', {
                        toastStyle: { backgroundColor: '#ff9c0c', color: 'white' },
                    });
                }
            } catch (error) {
                toast.error('Erro ao buscar o perfil do utilizador', {
                    toastStyle: { backgroundColor: '#ff9c0c', color: 'white' },
                });
            }
        };

        fetchUserPerfil();
    }, []);

    if (!espaco) {
        return <div>Carregando...</div>;
    }

    const handleButtonClick = () => {
        navigate('/editar_espaco', { state: { espaco } });
    };

    const handleExpandClick = (section) => {
        setExpand(expand === section ? null : section);
    };

    const handleReserveClick = async () => {
        try {
            const auth = getAuth();
            const user = auth.currentUser;

            if (!user) {
                console.error("Nenhum utilizador autenticado encontrado");
                return;
            }

            if (!startDate || !endDate) { // Verifica se as datas estão preenchidas
                 toast.error('Por favor, selecione as datas de início e fim da reserva.', {
                    toastStyle: { backgroundColor: '#ff9c0c', color: 'white' },
                }) ;
                 
                return;
            };

            const newReserva = {
                Data_criacao: serverTimestamp(), // Data de criação da reserva
                Data_inicio: startDate, // Data início colocada no input
                Data_fim: endDate, // Data fim colocada no input
                ID_espaco: espaco.id, // ID do espaço a ser reservado
                ID_utilizador: user.uid, // ID do utilizador que está a fazer a reserva
            };

            await addDoc(ReservasDB, newReserva);

            
            navigate('/Reservas'); 
        } catch (error) {
            toast.error('Erro ao criar a reserva', {
                toastStyle: { backgroundColor: '#ff9c0c', color: 'white' },
            });
        }
    };

    const renderSectionContent = (section) => {
        switch (section) {
            case 'Localização e Disponibilidade':
                return (
                    <div>
                        <p><strong>Localização:</strong> {espaco.localizacao}</p>
                        <p><strong>Disponível Desde:</strong> {espaco.dataInicio}</p>
                        <p><strong>Disponível Até:</strong> {espaco.dataFim}</p>
                    </div>
                );
                
            case 'Descrição':
                return  <p><strong>Descrição:</strong> {espaco.descricao}</p>;
            
            case 'Capacidade':
                return <p><strong>Capacidade:</strong> {espaco.capacidade}</p>
            default:
                return null;
        }
    };

    return (
        <div className="utilizadores-container">
            <ToastContainer />
            {userPerfil === 'Admin' ? (
                <Aside className="aside" />
            ) : (
                <Aside_user className="aside" />
            )}
            <div className="main-content">
                {userPerfil === 'Admin' ? (
                    <Navbar className="navbar" />
                ) : (
                     <Navbar_user className="navbar" /> 
                )} 
                <h1 style={{ textAlign: "center", marginTop: "3em", marginBottom: "2em" }}>{espaco.nome}</h1>

                {userPerfil === 'Admin' && (
                    <p style={{ color: "#09492c", textAlign: "right", fontSize:"20px", cursor:"pointer"}}>
                        <span onClick={handleButtonClick} className="add-button">
                            Editar
                            <FaEdit size={30} style={{ marginLeft: '8px' }} />
                        </span>
                    </p>
                )}

                <div className="espaco-pormenor-container">
                    {espaco.imagemURL && (
                        <img src={espaco.imagemURL} alt={espaco.nome} className="espaco-img" />
                    )}

                    <div className="right-container">
                        <div className="reservation-form">
                            <div>
                                <label htmlFor="startDate">De:</label>
                                <input
                                    type="date"
                                    id="startDate"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="endDate">Até:</label>
                                <input
                                    type="date"
                                    id="endDate"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                            <button className="reserve-button" onClick={handleReserveClick}>Reservar</button>
                        </div>

                        <div className="details-sections">
                            {['Localização e Disponibilidade', 'Descrição', 'Capacidade'].map((section, index) => (
                                <div key={index} className="details-section">
                                    <div
                                        className="section-header"
                                        onClick={() => handleExpandClick(section)}
                                    >
                                        <h3>{section}</h3>
                                        {expand === section ? <FaChevronUp /> : <FaChevronDown />}
                                    </div>
                                    {expand === section && (
                                        <div className="section-content">
                                            {renderSectionContent(section)}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EspacoPormenor;
