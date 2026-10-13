import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from './config.ts';
import { testFirestoreConnection } from './service.ts';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  isFirestoreConnected: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  authError: string | null;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  isFirestoreConnected: false,
  signInWithGoogle: async () => {},
  logout: async () => {},
  authError: null,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFirestoreConnected, setIsFirestoreConnected] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Initial connection test as mandated by skill
    testFirestoreConnection().then((connected) => {
      setIsFirestoreConnected(connected);
    });

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Erro ao conectar com Google:', err);
      setAuthError(err?.message || 'Falha ao autenticar com Google.');
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err: any) {
      console.error('Erro ao desconectar:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        isFirestoreConnected,
        signInWithGoogle,
        logout,
        authError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
