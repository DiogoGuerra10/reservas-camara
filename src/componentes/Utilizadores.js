import React from "react";
import Tabela_Utilizadores from "./Tabela_utilizadores";
import Aside from "../Aside";
import Navbar from "./Navbar";
import "../css/Utilizadores.css";

const Utilizadores = () => {
    return (
        <div className="utilizadores-container">
            <Aside className="aside" />
            <div className="main-content">
                <Navbar className="navbar" />
                <h1 style={{textAlign:"center", marginTop:"3em", marginBottom:"2em"}}>Utilizadores</h1>
                <Tabela_Utilizadores />
            </div>
        </div>
    );
}

export default Utilizadores;
