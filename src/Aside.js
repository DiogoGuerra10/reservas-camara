import React from 'react';
import './Aside.css'; 
import { useNavigate } from 'react-router-dom';
import logoMobile from '../src/imagens/moncaodeixamarca.png'; 
import { Link } from 'react-router-dom';
import { PiChartLineUpBold } from "react-icons/pi";
import { FaRegCalendarCheck } from 'react-icons/fa';
import { TbLogout2 } from "react-icons/tb";
import { RiMapPinAddFill } from "react-icons/ri";
import { MdPeople } from "react-icons/md";
import { signOut } from "firebase/auth";
import { auth } from './config/firebaseconfig'; 
import 'bootstrap/dist/css/bootstrap.min.css';

const Aside = () => {
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await signOut(auth);
      navigate("/Auth");
    } catch (error) {
      console.error('Logout error:', error);
      alert("Erro ao fazer logout. Verifique o console para mais detalhes.");
    }
  };

  return (
    <div className="aside">
      <div className="logo-container">
        <Link to="/">
          <img src={logoMobile} alt="Logo" className="logo" />
        </Link>
      </div>
      
      <div className="menu-items">
        <Link to="/" className="menu-item">
          <PiChartLineUpBold size="25px" className="icon" />
          <p className="text">Dashboard</p>
        </Link>

        <Link to="/Utilizadores" className="menu-item">
          <MdPeople size="25px" className="icon" />
          <p className="text">Utilizadores</p>
        </Link>

        <Link to="/Reservas" className="menu-item">
          <FaRegCalendarCheck size="25px" className="icon" />
          <p className="text">Reservas</p>
        </Link>

        <Link to="/Espacos" className="menu-item">
          <RiMapPinAddFill size="25px" className="icon" />
          <p className="text">Espaços</p>
        </Link>
      </div>
      
      <div className="logout">
        <div className="menu-item" onClick={logout}>
          <TbLogout2 size="25px" className="icon" />
          <p className="text">Log Out</p>
        </div>
      </div>
    </div>
  );
};

export default Aside;
