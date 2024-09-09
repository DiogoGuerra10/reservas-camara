import React, { useState, useEffect } from "react";
import '../css/Dashboard.css';
import Aside_user from "../Aside_user";
import Navbar_user from "./Navbar_user";
import { db } from '../config/firebaseconfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from "firebase/auth";
import { FaRegCalendarCheck } from 'react-icons/fa'; 
import { RiMapPinAddFill } from "react-icons/ri";
import { Link } from 'react-router-dom';



const Homepage = () => {
    const [userName, setUserName] = useState('');
    const [typingDone, setTypingDone] = useState(false);

    useEffect(() => {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
            const userQuery = query(
                collection(db, 'Utilizadores'),
                where('Email', '==', user.email)
            );

            getDocs(userQuery).then(querySnapshot => {
                if (!querySnapshot.empty) {
                    const userData = querySnapshot.docs[0].data();
                    setUserName(userData.Nome); 
                }
            }).catch(error => {
                console.error("Erro ao buscar utilizador: ", error);
            });
        }

        const timer = setTimeout(() => {
            setTypingDone(true);
        }, 2100); 

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="dashboard-container">
            <Aside_user className="aside" />
            <div className="main-content">
                <Navbar_user className="navbar" />
                <div 
                    className="background-container" 
                >
                    <h1 
                        className={`typing-effect ${typingDone ? 'typing-done' : ''}`}
                        style={{
                            position: 'absolute',
                            top: '65px',
                            left: '20px',
                            margin: '0',
                        }}
                    >
                        Boas-Vindas, {userName}
                    </h1>
                    <div className="ellipse-container">
                        <Link to="/Reservas">
                            <div className="ellipse">
                                <FaRegCalendarCheck className="icon-home" />
                                <p>Reservas</p>
                            </div>
                        </Link>
                        <Link to="/Espacos">
                            <div className="ellipse">
                                <RiMapPinAddFill className="icon-home" />
                                <p>Espaços</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default Homepage;
