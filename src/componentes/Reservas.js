import React, { useState, useEffect } from 'react';
import Aside from "../Aside";
import Navbar from "./Navbar";
import Aside_user from "../Aside_user";
import Navbar_user from "./Navbar_user";
import { collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../config/firebaseconfig'; 
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { FaUser } from 'react-icons/fa';
import { FaRegCalendarAlt } from "react-icons/fa";
import "../css/Reservas.css";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Reservas = () => {
    const [userPerfil, setUserPerfil] = useState(null);
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true); 

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
                        console.error("Utilizador não encontrado na coleção 'Utilizadores'");
                        toast.error('Utilizador não encontrado.', {
                            toastStyle: { backgroundColor: '#ff9c0c', color: 'white' },
                        });
                    }
                } else {
                    console.error("Nenhum utilizador autenticado encontrado");
                    toast.error('Nenhum utilizador autenticado.', {
                        toastStyle: { backgroundColor: '#ff9c0c', color: 'white' },
                    });
                }
            } catch (error) {
                console.error("Erro ao buscar o perfil do utilizador:", error);
                toast.error('Erro ao carregar o perfil.', {
                    toastStyle: { backgroundColor: '#ff9c0c', color: 'white' },
                });
            }
        };

        fetchUserPerfil();
    }, []);

    useEffect(() => {
        const fetchReservas = async () => {
            setLoading(true); 
            try {
                const auth = getAuth();
                const user = auth.currentUser;

                let reservasQuery;
                if (userPerfil === 'Admin') {
                    reservasQuery = collection(db, 'Reservas');
                } else {
                    reservasQuery = query(collection(db, 'Reservas'), where('ID_utilizador', '==', user.uid));
                }

                const reservasSnapshot = await getDocs(reservasQuery);
                const reservasData = await Promise.all(reservasSnapshot.docs.map(async (doc) => {
                    const data = doc.data();

                    // Buscar o nome do utilizador na coleção "Utilizadores"
                    const utilizadorQuery = query(collection(db, 'Utilizadores'), where('Ref_autenticacao', '==', data.ID_utilizador));
                    const utilizadorSnapshot = await getDocs(utilizadorQuery);
                    let nomeUtilizador = 'Desconhecido';

                    if (!utilizadorSnapshot.empty) {
                        nomeUtilizador = utilizadorSnapshot.docs[0].data().Nome;
                    }

                    // Buscar a imagem e nome do espaço na coleção "Espacos"
                    const espacoQuery = query(collection(db, 'Espacos'), where('ID_espaco', '==', data.ID_espaco));
                    const espacoSnapshot = await getDocs(espacoQuery);
                    let imagemURL = null;
                    let nomeEspaco = 'Espaço Desconhecido';

                    if (!espacoSnapshot.empty) {
                        const espacoData = espacoSnapshot.docs[0].data();
                        imagemURL = espacoData.imagemURL;
                        nomeEspaco = espacoData.nome;

                        // Se a URL da imagem estiver no storage, obter o download URL
                        if (imagemURL) {
                            const storage = getStorage();
                            const storageRef = ref(storage, imagemURL);
                            imagemURL = await getDownloadURL(storageRef);
                        }
                    }

                    return {
                        id: doc.id,
                        ...data,
                        nomeEspaco,
                        nomeUtilizador,
                        imagemURL,
                    };
                }));

                setReservas(reservasData);
                
            } catch (error) {
                console.error("Erro ao buscar as reservas:", error);
                toast.error('Erro ao carregar as reservas.', {
                    toastStyle: { backgroundColor: '#ff9c0c', color: 'white' },
                });
            } finally {
                setLoading(false); 
            }
        };

        if (userPerfil) {
            fetchReservas();
        }
    }, [userPerfil]);

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

                {userPerfil ==="Admin" ? (
                    <h1 style={{marginTop:"45px"}}>Lista de Reservas</h1>
                ) : (
                    <h1 style={{marginTop:"45px"}}>As minhas Reservas</h1>
                )}
                
                <div className="reservas-container">
                    {loading ? (
                        <p>Carregando...</p> 
                    ) : reservas.length > 0 ? (
                        reservas.map((reserva) => (
                            <div key={reserva.id} className="reserva-card">
                                {reserva.imagemURL && (
                                    <img src={reserva.imagemURL} alt="Espaço Reservado" className="reserva-imagem" />
                                )}
                                <p style={{fontSize:"20px"}}><strong>{reserva.nomeEspaco}</strong></p>
                                <p><FaUser /> {reserva.nomeUtilizador}</p> 
                                <p><FaRegCalendarAlt /> {new Date(reserva.Data_criacao.seconds * 1000).toLocaleDateString()}</p>
                                <p><strong>Desde: </strong> {new Date(reserva.Data_inicio).toLocaleDateString()}</p>
                                <p><strong>Até: </strong> {new Date(reserva.Data_fim).toLocaleDateString()}</p>
                            </div>
                        ))
                    ) : (
                        <p>Nenhuma reserva encontrada.</p> 
                    )}
                </div>
            </div>
        </div>
    );
};

export default Reservas;
