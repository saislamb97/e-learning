import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const PrivateRoute = ({ children }) => {
  const { auth } = useContext(AuthContext);

  // Check if the user is authenticated
  if (!auth.token) {
    return <Navigate to="/learning/login" />;
  }

  // Allow all routes to all authenticated users
  return children;
};

export default PrivateRoute;
