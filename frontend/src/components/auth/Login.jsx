import React, { useState, useContext, useEffect } from 'react';
import axios from '../../axiosConfig';
import { AuthContext } from '../../AuthContext';
import logo from '../../assets/logo.png'; // Replace with the path to your logo image

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { login } = useContext(AuthContext);

  // Clear sessionStorage when the component is mounted
  useEffect(() => {
    sessionStorage.clear();
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('/auths/login', { email, password });
      setMessage(response.data.message);
      login(response.data); // Call login from AuthContext
    } catch (error) {
      if (error.response) {
        setError(error.response.data.message);
      } else {
        setError('An error occurred. Please try again later.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r">
      <div className="max-w-md w-full bg-white border-solid p-8 rounded-lg shadow-xl transform transition duration-500 hover:scale-105">
        <div className="flex justify-center mb-6 p-4 bg-blue-500 rounded-full shadow-md">
          <img src={logo} alt="Logo" className="h-16" />
        </div>
        <h2 className="text-4xl font-extrabold mb-6 text-center text-gray-800">Welcome Back!</h2>
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-md shadow-md">
            {error}
          </div>
        )}
        {message && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded-md shadow-md">
            {message}
          </div>
        )}
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-lg font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-lg font-medium text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r bg-blue-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
