import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Aside from "../Aside";
import Navbar from "./Navbar";
import { db, storage } from '../config/firebaseconfig';
import { doc, updateDoc } from 'firebase/firestore';
import { uploadBytes, getDownloadURL, ref } from 'firebase/storage';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { IoAddCircle } from "react-icons/io5";
import "../css/Editar_espaco.css";
import { v4 } from "uuid";

const EditarEspaco = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { espaco } = location.state || {};

    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');
    const [localizacao, setLocalizacao] = useState('');
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');
    const [tipo, setTipo] = useState('');
    const [capacidade, setCapacidade] = useState('');
    const [imagens, setImagens] = useState(null);
    const [imageUrl, setImageUrl] = useState(espaco?.imagemURL || '');
    const inputRef = useRef();

    useEffect(() => {
        if (espaco) {
            setNome(espaco.nome || '');
            setDescricao(espaco.descricao || '');
            setLocalizacao(espaco.localizacao || '');
            setDataInicio(espaco.dataInicio || '');
            setDataFim(espaco.dataFim || '');
            setTipo(espaco.tipo || '');
            setCapacidade(espaco.capacidade || '');
        }
    }, [espaco]);

    const handleImageUpload = async () => {
        if (imagens === null) {
            toast.error("Nenhuma imagem selecionada", {
                toastStyle: { backgroundColor: "#09492c", color: "white" },
            });
            return;
        }

        const imageRef = ref(storage, `espacos-images/${imagens.name + v4()}`);

        try {
            await uploadBytes(imageRef, imagens);
            const url = await getDownloadURL(imageRef);
            setImageUrl(url);

            toast.success("Imagem carregada com sucesso!", {
                toastStyle: { backgroundColor: "#1e90ff", color: "white" },
            });
        } catch (error) {
            toast.error("Erro ao carregar a imagem.", {
                toastStyle: { backgroundColor: "#ff9c0c", color: "white" },
            });
            console.error("Erro ao carregar a imagem:", error);
        }
    };

    const handleSave = async () => {
        const updatedEspaco = {
            nome,
            descricao,
            localizacao,
            dataInicio,
            dataFim,
            tipo,
            capacidade,
            imagemURL: imageUrl,
        };

        try {
            const docRef = doc(db, 'Espacos', espaco.id);
            await updateDoc(docRef, updatedEspaco);

            toast.success('Espaço atualizado com sucesso!', {
                toastStyle: { backgroundColor: '#1e90ff', color: 'white' },
            });

            navigate('/espacos');
        } catch (error) {
            console.error('Erro ao salvar as alterações:', error);
            toast.error('Erro ao salvar as alterações. Por favor, tente novamente.', {
                toastStyle: { backgroundColor: "#ff9c0c", color: "white" },
            });
        }
    };

    return (
        <div className="utilizadores-container">
        <Aside className="aside" />
        <div className="main-content">
            <Navbar className="navbar" />
            <h1 style={{ textAlign: "center", marginTop: "3em", marginBottom: "2em" }}>Editar Espaço</h1>
            <div className="container">
                <div className="espaco-img-container">
                    <img src={imageUrl} alt={nome} className="espaco-img" />
                    <IoAddCircle 
                        onClick={() => inputRef.current.click()} 
                        size={40} 
                        className="icon-upload2" 
                    />
                    <input 
                        type="file" 
                        accept="image/*" 
                        ref={inputRef} 
                        style={{ display: 'none' }} 
                        onChange={(event) => setImagens(event.target.files[0])}
                    />
                    <button onClick={handleImageUpload} className='btn-upload-image2'>Upload</button>
                </div>
                <div className="espaco-info2">
                    <p><strong>Nome:</strong></p>
                    <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} />
                    <p><strong>Descrição:</strong></p>
                    <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} />
                    <p><strong>Localização:</strong></p>
                    <input type="text" value={localizacao} onChange={(e) => setLocalizacao(e.target.value)} />
                    <p><strong>Desde:</strong></p>
                    <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
                    <p><strong>Até:</strong></p>
                    <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
                    <p><strong>Tipo:</strong></p>
                    <input type="text" value={tipo} onChange={(e) => setTipo(e.target.value)} />
                    <p><strong>Capacidade:</strong></p>
                    <input type="number" value={capacidade} onChange={(e) => setCapacidade(e.target.value)} />
                    
                    <div className="save-button-container2">
                        <button onClick={handleSave} className="save-button2">Salvar</button>
                    </div>
                </div>
            </div>
            <ToastContainer position="top-center" />
        </div>
    </div>
    );
};

export default EditarEspaco;
