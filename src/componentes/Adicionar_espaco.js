import React, { useState } from 'react';
import { collection, doc, setDoc } from 'firebase/firestore'; // Adicionado doc e setDoc
import { db } from '../config/firebaseconfig'; 
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getStorage } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import '../css/Adicionar_espaco.css'
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdicionarEspaco = () => {
    const [nome, setNome] = useState('');
    const [capacidade, setCapacidade] = useState('');
    const [descricao, setDescricao] = useState('');
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');
    const [localizacao, setLocalizacao] = useState('');
    const [status, setStatus] = useState('');
    const [tipo, setTipo] = useState('');
    const [imagem, setImagem] = useState(null);
    const navigate = useNavigate();
    const storage = getStorage(); // Inicializa o Firebase Storage

    const handleFileChange = (event) => {
        if (event.target.files.length > 0) {
            setImagem(event.target.files[0]);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!nome || !capacidade || !descricao || !dataInicio || !dataFim || !localizacao || !status || !tipo || !imagem) {
            toast.error('Todos os campos são obrigatórios!', {
                toastStyle: { backgroundColor: '#ff9c0c', color: 'white' },
            });
            return;
        }

        try {
            const docRef = doc(collection(db, 'Espacos'));
            const ID_espaco = docRef.id;

            const storageRef = ref(storage, `espacos-images/${imagem.name}`);
            await uploadBytes(storageRef, imagem);
            const imageUrl = await getDownloadURL(storageRef);

            await setDoc(docRef, {
                ID_espaco,
                nome,
                capacidade,
                descricao,
                dataInicio,
                dataFim,
                localizacao,
                status,
                tipo,
                imagemURL: imageUrl
            });

            toast.success('Espaço adicionado com sucesso!', {
                toastStyle: { backgroundColor: '#1e90ff', color: 'white' },
            });

            navigate('/espacos');
        } catch (error) {
            console.error('Erro ao adicionar o espaço:', error);
            toast.error('Erro ao adicionar o espaço.', {
                toastStyle: { backgroundColor: '#ff9c0c', color: 'white' },
            });
        }
    };

    return (
        <div className="adicionar-espaco-container">
            <h1>Adicionar Novo Espaço</h1>
            <form onSubmit={handleSubmit} className="form">
                <input 
                    type="text" 
                    placeholder="Nome" 
                    value={nome} 
                    onChange={(e) => setNome(e.target.value)} 
                    required 
                />
                <input 
                    type="number" 
                    placeholder="Capacidade"
                    value={capacidade} 
                    onChange={(e) => setCapacidade(e.target.value)} 
                    required 
                />
                <textarea 
                    placeholder="Descrição" 
                    value={descricao} 
                    onChange={(e) => setDescricao(e.target.value)} 
                    required 
                />
                <input 
                    type="date" 
                    placeholder="Data de Início" 
                    value={dataInicio} 
                    onChange={(e) => setDataInicio(e.target.value)} 
                    required 
                />
                <input 
                    type="date" 
                    placeholder="Data de Fim" 
                    value={dataFim} 
                    onChange={(e) => setDataFim(e.target.value)} 
                    required 
                />
                <input 
                    type="text" 
                    placeholder="Localização"
         
                    value={localizacao} 
                    onChange={(e) => setLocalizacao(e.target.value)} 
                    required 
                />
                <select 
                    onChange={(e) => setStatus(e.target.value)}
                    value={status}
                    required
                >
                    <option value="">Selecione um status</option>
                    <option value="Disponível">Disponível</option>
                    <option value="Ocupado">Ocupado</option>
                    <option value="Manutenção">Manutenção</option>
                    <option value="Fechado">Fechado</option>
                </select>
                <input 
                    type="text" 
                    placeholder="Tipo" 
                    value={tipo} 
                    onChange={(e) => setTipo(e.target.value)} 
                    required 
                />
                <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    required 
                />
                <button type="submit" className="btn">Adicionar Espaço</button>
            </form>
            <ToastContainer position="top-center" />
        </div>
    );
};

export default AdicionarEspaco;
