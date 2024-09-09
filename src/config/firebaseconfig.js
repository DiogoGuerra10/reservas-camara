
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

//Import para autenticação(email/pass)
import { getAuth } from "firebase/auth";

//Import banco de dados
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBwlaJ8oNIJuHJUZsxG6_cEzq__39mYvZg",
  authDomain: "reservas-camara.firebaseapp.com",
  projectId: "reservas-camara",
  storageBucket: "reservas-camara.appspot.com",
  messagingSenderId: "666531273867",
  appId: "1:666531273867:web:8f002a24c0f5fb79ed088e",
  measurementId: "G-ELTRC9PLN6"
};


//Inicialização do firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const storage = getStorage(app)

//Export de autenticação 
export const auth = getAuth(app);

//Export de banco de dados
export const db = getFirestore(app);