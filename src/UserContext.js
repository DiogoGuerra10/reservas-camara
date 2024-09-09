// UserContext.js
import React, { createContext, useState, useEffect } from 'react';
import { auth, db } from './config/firebaseconfig'; 
import { doc, getDoc } from 'firebase/firestore';

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
      if (authUser) {
        try {
          const userDocRef = doc(db, 'Utilizadores', authUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUser(userDoc.data());
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error('Erro ao buscar dados do utilizador:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={user}>
      {children}
    </UserContext.Provider>
  );
};
