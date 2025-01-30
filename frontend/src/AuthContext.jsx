import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

const TOKEN_EXPIRATION_TIME = 20 * 60 * 60 * 1000; // 20 hours in milliseconds

const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const getSessionData = useMemo(() => () => {
    const token = sessionStorage.getItem('token');
    const userRole = sessionStorage.getItem('userRole');
    const timestamp = sessionStorage.getItem('timestamp');
    return { token, userRole, timestamp: timestamp ? parseInt(timestamp) : null };
  }, []);

  const [auth, setAuth] = useState(() => {
    const { token, userRole } = getSessionData();
    return { token, userRole };
  });

  const handleLogout = useCallback(() => {
    sessionStorage.clear(); // Clear all session storage data
    setAuth({ token: null, userRole: null });
    navigate('/learning/login'); // Redirect to the correct login route
  }, [navigate]);

  useEffect(() => {
    const { token, userRole, timestamp } = getSessionData();
    if (token && userRole && timestamp) {
      const currentTime = Date.now();
      if (currentTime - timestamp > TOKEN_EXPIRATION_TIME) {
        handleLogout();
      } else {
        setAuth({ token, userRole });
      }
    }
  }, [getSessionData, handleLogout]);

  useEffect(() => {
    if (auth.token) {
      sessionStorage.setItem('token', auth.token);
      sessionStorage.setItem('userRole', auth.userRole);
      sessionStorage.setItem('timestamp', Date.now().toString());
    }
  }, [auth]);

  const login = useCallback((data) => {
    setAuth({ token: data.token, userRole: data.userRole });
    navigate('/learning'); // Redirect to the correct base path after login
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ auth, login, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
