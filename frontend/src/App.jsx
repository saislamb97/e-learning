import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/auth/Login';
import OverviewDashboard from './components/dashboard/OverviewDashboard';
import RequestsDashboard from './components/dashboard/RequestsDashboard';
import LiveCoursesDashboard from './components/dashboard/LiveCoursesDashboard';
import MessagesDashboard from './components/dashboard/MessagesDashboard';
import TransactionHistoryDashboard from './components/dashboard/TransactionHistoryDashboard';
import UserProfile from './components/user/UserProfile';
import Layout from './components/layout/Layout';
import Unauthorized from './components/auth/Unauthorized';
import PrivateRoute from './PrivateRoute';

const App = () => {
  return (
    <Routes>
      <Route path="/learning/login" element={<LoginPage />} />
      <Route path="/learning/unauthorized" element={<Unauthorized />} />
      <Route path="/learning" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="/learning/overview" />} />
        <Route path="overview" element={<OverviewDashboard />} />
        <Route path="requests" element={<RequestsDashboard />} />
        <Route path="live-courses" element={<LiveCoursesDashboard />} />
        <Route path="messages" element={<MessagesDashboard />} />
        <Route path="transaction-history" element={<TransactionHistoryDashboard />} />
        <Route path="users/:id" element={<UserProfile />} />
      </Route>
      <Route path="/learning/*" element={<Navigate to="/learning/login" />} />
    </Routes>
  );
};

export default App;
