import React, { useState, useEffect } from 'react';
import axios from '../../axiosConfig';

const TransactionHistoryDashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('/transactions'); // Update the endpoint if needed
      setTransactions(response.data);
      setLoading(false);
    } catch (error) {
      setError('Failed to load transactions');
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-6 text-blue-700">Loading transactions...</div>;
  }

  if (error) {
    return <div className="text-center py-6 text-red-600">{error}</div>;
  }

  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Transaction History</h2>
      <ul className="space-y-4">
        {transactions.map((transaction, index) => (
          <li key={index} className="p-4 bg-gray-100 border rounded-lg hover:bg-gray-200">
            <h3 className="font-semibold text-blue-700">{transaction.courseTitle}</h3>
            <p className="text-gray-600">Amount: RM {transaction.amount}</p>
            <p className="text-xs text-gray-400 mt-1">{new Date(transaction.date).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TransactionHistoryDashboard;
