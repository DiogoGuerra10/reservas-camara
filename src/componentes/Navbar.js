import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../UserContext'; 
import '../css/Navbar.css';
import { IoMdPerson } from "react-icons/io";


const Navbar = () => {
  const [userName, setUserName] = useState(null);
  const user = useContext(UserContext);

  useEffect(() => {
    if (user) {
      setUserName(user.Nome);
    } else {
      setUserName(null);
    }
  }, [user]);

  if (!user) {
    return <div className="navbar">Carregando...</div>;
  }

  return (
    <nav className="navbar">
      <h2>Área de Administração</h2>
      <div className="navbar-user">
        {userName && (
          <div className="navbar-user-info">
            <span className="navbar-user-name">
            <IoMdPerson size="25px" color='#083f26' style={{ marginRight: '10px' }} />
            {userName}
            </span>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 
