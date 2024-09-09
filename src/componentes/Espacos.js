import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where, getDoc, getDocs as getMultipleDocs } from 'firebase/firestore';
import { db } from '../config/firebaseconfig'; 
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import Aside from '../Aside';
import Aside_user from '../Aside_user';
import Navbar from './Navbar';
import Navbar_user from './Navbar_user';
import '../css/Espacos.css';
import { useNavigate } from 'react-router-dom';
import { IoAddCircle } from "react-icons/io5";
import { getAuth } from 'firebase/auth';

const Espacos = () => {
    const [espacos, setEspacos] = useState([]);
    const [userPerfil, setUserPerfil] = useState(null); // Estado para armazenar o perfil do utilizador
    const storage = getStorage(); // Inicializa o Firebase Storage
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserPerfil = async () => {
            try {
                const auth = getAuth();
                const user = auth.currentUser;

                if (user) {
                    // Cria uma consulta para buscar o documento do utilizador com base no "Ref_autenticacao"
                    const q = query(collection(db, 'Utilizadores'), where('Ref_autenticacao', '==', user.uid));
                    const querySnapshot = await getMultipleDocs(q);

                    if (!querySnapshot.empty) {
                        const userData = querySnapshot.docs[0].data(); // Acessa o primeiro documento retornado
                        setUserPerfil(userData.Perfil); // Armazena o perfil do utilizador
                    } else {
                        console.error("Utilizador não encontrado na coleção 'Utilizadores'");
                    }
                } else {
                    console.error("Nenhum utilizador autenticado encontrado");
                }
            } catch (error) {
                console.error("Erro ao buscar o perfil do utilizador:", error);
            }
        };

        fetchUserPerfil();

        const fetchEspacos = async () => {
            const querySnapshot = await getDocs(collection(db, 'Espacos'));
            const espacosData = await Promise.all(querySnapshot.docs.map(async (doc) => {
                const data = doc.data();
                let imagemURL = null;
                // Verifica se o campo imagemURL está definido e não é vazio
                if (data.imagemURL) {
                    try {
                        const storageRef = ref(storage, data.imagemURL);
                        imagemURL = await getDownloadURL(storageRef);
                    } catch (error) {
                        console.error('Erro ao obter a URL de download da imagem:', error);
                    }
                }
                // Verifica se todos os campos essenciais estão presentes
                if (data.nome && data.tipo && data.capacidade) {
                    return { id: doc.id, ...data, imagemURL };
                }
                return null; // Retorna null para documentos incompletos
            }));
            // Remove documentos nulos da lista de espaços
            setEspacos(espacosData.filter(espaco => espaco !== null));
        };

        fetchEspacos();
    }, [storage]);

    const handleButtonClick = () => {
        navigate('/adicionar_espacos');
    };

    const espaco_pormenorClick = (espaco) => {
        navigate('/espaco_pormenor', { state: { espaco } });
    };

    return (
        <div className="utilizadores-container">
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
                
                <h1 style={{ textAlign: "center", marginTop: "3em", marginBottom: "2em" }}>Espaços</h1>

                {userPerfil === 'Admin' && (
                    <p style={{ color: "#09492c", textAlign: "right" }}>
                        <span style={{ cursor: "pointer" }} onClick={handleButtonClick} className="add-button">
                            Adicionar Espaço
                            <IoAddCircle size={30} />
                        </span>
                    </p>
                )}

                <div className="espacos-container">
                    {espacos.map((espaco) => (
                        <div key={espaco.id} className="card">
                            {espaco.imagemURL && <img src={espaco.imagemURL} alt={espaco.nome} className="card-img" />}
                            <div className="card-content">
                                <h4 style={{textAlign:"center"}}>{espaco.nome}</h4>
                                <p>{espaco.localizacao}</p>
                                <div className="button-container">
                                    <button className="btn" onClick={() => espaco_pormenorClick(espaco)}>Ver Disponibilidade</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Espacos;
