import React, { useState, useEffect } from 'react';
import axios from '../../axiosConfig';

const MessagesDashboard = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await axios.get('/messages'); // Update the endpoint if needed
      setMessages(response.data);
      setLoading(false);
    } catch (error) {
      setError('Failed to load messages');
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-6 text-blue-700">Loading messages...</div>;
  }

  if (error) {
    return <div className="text-center py-6 text-red-600">{error}</div>;
  }

  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Messages</h2>
      <ul className="space-y-4">
        {messages.map((message, index) => (
          <li key={index} className="p-4 bg-gray-100 border rounded-lg hover:bg-gray-200">
            <h3 className="font-semibold text-blue-700">{message.title}</h3>
            <p className="text-gray-600">{message.content}</p>
            <p className="text-xs text-gray-400 mt-1">{new Date(message.timestamp).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MessagesDashboard;
