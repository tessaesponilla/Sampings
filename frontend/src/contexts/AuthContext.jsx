import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthChange, getCurrentUserData } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      setLoading(true);
      if (user) {
        try {
          const result = await getCurrentUserData(user.uid);
          if (result.success) {
            setCurrentUser(user);
            setUserData(result.data);
          } else {
            setCurrentUser(user);
            setUserData(null);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setCurrentUser(user);
          setUserData(null);
        }
      } else {
        setCurrentUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userData,
    isCustomer: userData?.role === 'customer',
    isStaff: userData?.role === 'staff',
    isOwner: userData?.role === 'owner',
    loading,
    setUserData 
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};