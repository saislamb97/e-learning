import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';

const Unauthorized = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate('/learning/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-red-400 to-orange-500">
      <div className="max-w-lg w-full bg-white p-10 rounded-lg shadow-xl transform transition duration-500 hover:scale-105">
        <div className="flex justify-center mb-8 p-4 bg-red-500 rounded-full shadow-md">
          <img src={logo} alt="Logo" className="h-16" />
        </div>
        <h2 className="text-5xl font-extrabold mb-6 text-center text-gray-800">Access Denied</h2>
        <p className="text-lg text-center text-gray-700 mb-8">
          You do not have permission to view this page. Please contact your administrator if you believe this is an error.
        </p>
        <button
          onClick={handleGoBack}
          className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
        >
          Go Back to Login
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;