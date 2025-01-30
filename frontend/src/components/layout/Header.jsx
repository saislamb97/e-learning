import React from 'react';
import { FiLogOut } from 'react-icons/fi';
import { Notifications, Dashboard, Receipt, PlayCircle, Message, History } from '@mui/icons-material';
import { Link, NavLink } from 'react-router-dom';

const Header = () => {
  const navLinks = [
    { name: 'Overview', path: '/learning/overview', icon: <Dashboard /> },
    { name: 'Requests', path: '/learning/requests', icon: <Receipt /> },
    { name: 'LIVE Courses', path: '/learning/live-courses', icon: <PlayCircle /> },
    { name: 'Messages', path: '/learning/messages', icon: <Message /> },
    { name: 'Transaction History', path: '/learning/transaction-history', icon: <History /> },
  ];

  return (
    <>
      <header className="bg-white shadow-md border-b border-gray-200 text-blue-700 md:ml-80">
        {/* Top Bar */}
        <div className="flex justify-between items-center p-4 md:p-8">
          <h1 className="text-xl md:text-2xl font-bold">Dashboard</h1>
          <div className="flex items-center space-x-4 md:space-x-6">
            <Notifications className="text-blue-700 hover:text-blue-800 cursor-pointer text-xl md:text-2xl" />
            <Link
              to="/learning/logout"
              className="flex items-center space-x-1 md:space-x-2 text-red-700 hover:text-red-800 font-medium"
            >
              <FiLogOut className="text-lg md:text-xl" />
              <span className="text-sm md:text-base">Logout</span>
            </Link>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex flex-wrap items-center space-x-2 md:space-x-6 p-4 md:p-6 border-t border-gray-200 text-gray-700 text-sm md:text-base">
          {navLinks.map((link, index) => (
            <NavLink
              key={index}
              to={link.path}
              className={({ isActive }) =>
                `relative flex items-center space-x-1 md:space-x-2 py-2 font-medium transition-colors ${
                  isActive ? 'text-blue-700 border-b-2 border-blue-700' : 'hover:text-blue-700'
                }`
              }
            >
              <span className="text-lg">{link.icon}</span>
              <span>{link.name}</span>
            </NavLink>
          ))}
        </nav>
      </header>
    </>
  );
};

export default Header;
