import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import 'bootstrap/dist/css/bootstrap.min.css';
import "../css/Register.css";
import { auth, db } from "../config/firebaseconfig";

const Register = () => {
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [nome, setNome] = useState("");
  const [idade, setIdade] = useState("");
  const [perfil, setPerfil] = useState("");
  const [sexo, setSexo] = useState("");
  const [telemovel, setTelemovel] = useState("");

  const utilizadoresCollectionRef = collection(db, "Utilizadores");
  const navigate = useNavigate();

  const isValidEmail = (email) => {
    const emailFormato = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailFormato.test(email);
  };

  const SignIn = async () => {
    try {
      if (!isValidEmail(registerEmail)) {
        setPasswordError("Formato de email inválido");
        setTimeout(() => setPasswordError(""), 5000);
        return;
      }

      if (registerPassword.length < 6) {
        setPasswordError("Password deve ter pelo menos 6 caracteres");
        setTimeout(() => setPasswordError(""), 5000);
        return;
      }

      // Criação do utilizador
      const userCredential = await createUserWithEmailAndPassword(auth, registerEmail, registerPassword);
      const user = userCredential.user;

      console.log("Utilizador criado com sucesso:", user);

      // Adicionar dados ao Firestore
      try {
        await addDoc(utilizadoresCollectionRef, {
          Ref_autenticacao: user.uid,
          Email: user.email,
          Nome: nome,
          Idade: idade,
          Perfil: perfil,
          Sexo: sexo,
          Telemovel: telemovel,
        });
        console.log("Dados adicionados com sucesso ao Firestore");
        navigate("/");
      } catch (firestoreError) {
        console.error("Erro ao adicionar dados ao Firestore:", firestoreError);
        setRegisterError(`Erro ao adicionar dados ao Firestore: ${firestoreError.message}`);
      }

    } catch (err) {
      console.error("Erro durante o registo:", err.message); // Exibe mensagem de erro detalhada
      setRegisterError(`Ocorreu um erro no registo: ${err.message}`);
      setPasswordError("");
      setRegisterEmail("");

      setTimeout(() => setRegisterError(""), 5000);
    }
  };

  return (
    <div className="register row justify-content-center p-5">
      <div className="register-content">
        <input
          placeholder="Nome..."
          onChange={(e) => setNome(e.target.value)}
          type="text"
          className="form-control mb-3 form-control-user"
          aria-describedby="nomeHelp"
        />

        <p>Idade</p>
        <input
          placeholder="Idade..."
          onChange={(e) => setIdade(e.target.value)}
          type="text"
          className="form-control mb-3 form-control-user"
          aria-describedby="idadeHelp"
        />

        <p>Perfil</p>
        <select
          onChange={(e) => setPerfil(e.target.value)}
          className="form-control mb-3 form-control-user"
          aria-describedby="perfilHelp"
        >
          <option value="">Selecione um perfil</option>
          <option value="Admin">Administrador</option>
          <option value="User">Utilizador</option>
        </select>

        <p>Sexo</p>
        <select
          onChange={(e) => setSexo(e.target.value)}
          className="form-control mb-3 form-control-user"
          aria-describedby="sexoHelp"
        >
          <option value="">Selecione um sexo</option>
          <option value="Feminino">Feminino</option>
          <option value="Masculino">Masculino</option>
          <option value="Outro">Outro</option>
        </select>

        <p>Telemovel</p>
        <input
          placeholder="Telemovel..."
          onChange={(e) => setTelemovel(e.target.value)}
          type="text"
          className="form-control mb-3 form-control-user"
          aria-describedby="telemovelHelp"
        />

        <input
          placeholder="Email"
          onChange={(e) => setRegisterEmail(e.target.value)}
          type="email"
          className="form-control mb-3 form-control-user"
          aria-describedby="emailHelp"
        />

        <input
          placeholder="Password"
          onChange={(e) => setRegisterPassword(e.target.value)}
          type="password"
          className="form-control mb-3 form-control-user"
        />

        <p className="text-danger text-center">{passwordError}</p>
        <p className="text-danger text-center">{registerError}</p>

        <button className="btn btn-primary" onClick={SignIn}> Registar</button>
      </div>
    </div>
  );
}

export default Register;
