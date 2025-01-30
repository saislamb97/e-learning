import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

const axiosInstance = axios.create({
  baseURL: `${apiUrl}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token'); // Changed to sessionStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add X-Timestamp header with the current UTC timestamp
    const utcTimestamp = new Date().toISOString();
    config.headers['X-Timestamp'] = utcTimestamp;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
