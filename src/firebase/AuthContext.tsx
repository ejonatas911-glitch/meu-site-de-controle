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
  dismissAuthError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  isFirestoreConnected: false,
  signInWithGoogle: async () => {},
  logout: async () => {},
  authError: null,
  dismissAuthError: () => {},
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
      if (err?.code === 'auth/popup-closed-by-user') {
        // User closed the popup, not a system failure
        return;
      }
      if (err?.code === 'auth/popup-blocked') {
        setAuthError('O navegador bloqueou a janela de login. Por favor, autorize popups para este site.');
        return;
      }
      console.warn('Erro ao conectar com Google:', err);
      setAuthError(err?.message || 'Falha ao autenticar com Google. Seus dados continuam salvos no aparelho.');
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err: any) {
      console.error('Erro ao desconectar:', err);
    }
  };

  const dismissAuthError = () => setAuthError(null);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        isFirestoreConnected,
        signInWithGoogle,
        logout,
        authError,
        dismissAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
