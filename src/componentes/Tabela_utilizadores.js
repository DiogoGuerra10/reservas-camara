import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebaseconfig';
import { doc, updateDoc } from 'firebase/firestore';

import { useNavigate } from 'react-router-dom';

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import { GoBook } from "react-icons/go";

const Tabela_Utilizadores = () => {
    const navigate = useNavigate();
    const [utilizadores, setUtilizadores] = useState([]);
    const [searchText, setSearchText] = useState('');

    const handleSearch = (event) => {
        setSearchText(event.target.value);
    };

    const filteredRows = utilizadores.filter((utilizador) => {
        return Object.values(utilizador).some((value) =>
            String(value).toLowerCase().includes(searchText.toLowerCase())
        );
    });

    useEffect(() => {
        const q = query(collection(db, 'Utilizadores'), where('Perfil', '==', "User"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const utilizadores = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUtilizadores(utilizadores);
        });

        return () => unsubscribe();
    }, []);

    
    const columns = [
        {
            field: 'Ref_autenticacao',
            headerName: 'ID',
            width: 170
        },
        {
            field: 'Nome',
            headerName: 'Nome',
            width: 150
        },
        {
            field: 'Telemovel',
            headerName: 'Telemóvel',
            width: 150
        },
        {
            field: 'Email',
            headerName: 'Email',
            description: 'This column has a value getter and is not sortable.',
            width: 250,
        },
        {
            field: 'Estado',
            headerName: 'Estado',
            width: 60,
            renderCell: (params) => {
                const handleClick = async () => {
                    try {
                        const userRef = doc(db, 'Utilizadores', params.id);
                        await updateDoc(userRef, { Estado: !params.value });
                        toast.success('Estado alterado com sucesso!', {
                            toastStyle: { backgroundColor: '#1e90ff', color: 'white' },
                        });
                    } catch (error) {
                        toast.error('Ocorreu um erro ao alterar o estado.', {
                            toastStyle: { backgroundColor: '#ff9c0c', color: 'white' },
                        });
                    }
                };

                return (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: "pointer" }}>
                        <div onClick={handleClick}>
                            {params.value ? <ToggleOnIcon size={20} sx={{ color: '#66DD4B' }} /> : <ToggleOffIcon size={20} sx={{ color: '#DF3323' }} />}
                        </div>
                    </div>
                );
            },
        },
        {
            field: 'Sexo',
            headerName: 'Sexo',
            width: 150,
        },
        {
            field: 'Consultar',
            headerName: 'Consultar',
            width: 80,
            renderCell: (params) => (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: "pointer" }}>
                    <div onClick={() => navigate("/utilizador_pormenor", { state: { ref_autenticacao: params.row.Ref_autenticacao } })}>
                        <GoBook size={20} color="#083f26" />
                    </div>
                </div>
            ),
        }
    ];

    return (
        <div className='pacientes-table' style={{ textAlign: 'left' }}>
            <ToastContainer position="top-center" />
            <div>
                <input className='search' type="text" value={searchText} onChange={handleSearch} placeholder="Pesquisar..." />
            </div>

            <DataGrid
                className='tabela'
                rows={filteredRows}
                columns={columns}
                initialState={{
                    pagination: {
                        paginationModel: { page: 0, pageSize: 5 },
                    },
                }}
                pageSizeOptions={[5, 10, 20]}
                checkboxSelection
                onCellClick={(params, event) => event?.stopPropagation()}
            />
        </div>
    );
}

export default Tabela_Utilizadores;
