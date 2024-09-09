import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from './config/firebaseconfig';
import { signInWithEmailAndPassword } from "firebase/auth";
import { db } from './config/firebaseconfig'; 
import { collection, query, where, getDocs } from 'firebase/firestore';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import logocmm from './imagens/moncaodeixamarca.png';
import './Auth.css';

const Auth = () => {
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [loginError, setLoginError] = useState("");
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const navigate = useNavigate();

    const login = async () => {
        try {
            // Autentica o utilizador
            const userCredential = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
            const user = userCredential.user;

            // Consulta na coleção "Utilizadores" com base no UID do utilizador
            const q = query(collection(db, "Utilizadores"), where("Ref_autenticacao", "==", user.uid));
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
                querySnapshot.forEach((doc) => {
                    const userData = doc.data();

                    // Verificar se o Estado do utilizador é 'false'
                    if (userData.Estado === false) {
                        toast.error("⚠️ A sua conta está desativada ", {
                            toastStyle: { backgroundColor: '#ff9c0c', color: 'white' },
                        });
                        auth.signOut(); // Deslogar o utilizador imediatamente
                    } else {
                        // Redirecionar de acordo com o perfil
                        if (userData.Perfil === 'Admin') {
                            navigate('/'); // Redireciona para a página inicial do admin
                        } else if (userData.Perfil === 'User') {
                            navigate('/Homepage'); // Redireciona para a página inicial do utilizador
                        }
                    }
                });
            } else {
                setLoginError("⚠️ Dados do perfil não encontrados ⚠️");
            }
        } catch (error) {
            console.log("email", loginEmail);
            setLoginError("⚠️ Credenciais inválidas ⚠️");
            setLoginEmail("");
            setLoginPassword("");
            setTimeout(() => {
                setLoginError("");
            }, 5000);
            return;
        }
    };

    const handleSignUpRedirect = () => {
        navigate("/register"); // Redireciona para a página de registro
    };

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div>
            <ToastContainer position="top-center" />
            {isMobile ? (
                <div className="Auth row">
                    <div className="col-12 mt-5">
                        <img
                            src={logocmm}
                            alt="logoCâmara"
                            style={{
                                maxWidth: "300px",
                                maxHeight: "350px"
                            }}
                        />
                    </div>

                    <div className="col-12">
                        <input
                            placeholder="Email"
                            onChange={(e) => setLoginEmail(e.target.value)}
                            type="email"
                            className="form-control mb-3 form-control-user forms"
                            aria-describedby="emailHelp"
                        />

                        <input
                            placeholder="Password"
                            type="password"
                            onChange={(e) => setLoginPassword(e.target.value)}
                            className="form-control mb-3 forms"
                        />

                        <p style={{ fontWeight: "500", fontSize: "16px", color: "#FF9C0C" }}>{loginError}</p>

                        <div className="mb-3">
                            <button onClick={login} className="btn btn_login mb-3">Login</button>
                        </div>

                        <div>
                            <span style={{ textAlign: 'center' }}>
                                Ainda não tens conta?{' '}
                                <span 
                                    style={{ cursor: 'pointer', color: '#007bff' }}
                                    onClick={handleSignUpRedirect}
                                >
                                    Regista-te
                                </span>
                            </span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="Auth_desktop row" style={{ height: "100vh" }}>
                    <div className="card_login_desktop">
                        <div style={{ padding: "20px", margin: 'auto' }}>
                            <img
                                src={logocmm}
                                alt="logoCâmara"
                                className="img-fluid"
                                style={{
                                    maxWidth: "24em",
                                    marginLeft: "30%",
                                    marginBottom: "40%"
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', padding: "20px", margin: 'auto' }}>
                            <div style={{ padding: "20px", margin: 'auto' }}>
                                <input
                                    placeholder="Email"
                                    onChange={(e) => setLoginEmail(e.target.value)}
                                    type="email"
                                    className="form-control mb-3 form-control-user forms_desktop"
                                    aria-describedby="emailHelp"
                                    style={{ height: "50px" }}
                                />

                                <input
                                    placeholder="Password"
                                    type="password"
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                    className="form-control mb-3 forms_desktop"
                                    style={{ height: "50px" }}
                                />

                                <div style={{ textAlign: 'center' }}>
                                    <span>
                                        Ainda não tens conta?{' '}
                                        <span 
                                            style={{ cursor: 'pointer', color: '#09492c', fontWeight: 'bold' }}
                                            onClick={handleSignUpRedirect}
                                        >
                                            Regista-te
                                        </span>
                                    </span>
                                </div>

                                <p className='erro_login'>{loginError}</p>

                                <button onClick={login} className="btn btn_login_desktop mt-3">Login</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Auth;
