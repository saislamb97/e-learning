import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="h-screen flex flex-col md:flex-row">
      {/* Sidebar (hidden on small, shown on md) */}
      <Sidebar />
      {/* Main Content Wrapper */}
      <div className="flex flex-col flex-grow bg-gray-50">
        {/* Header (shifted by md:ml-80 only on medium screens and above) */}
        <Header />
        {/* Main Content (also offset only on md) */}
        <main className="flex-grow p-4 md:p-6 overflow-auto md:ml-80">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
