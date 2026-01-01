
import React, { useState, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Spinner from './Spinner';
import Notification from './Notification';
import { DataContext } from '../context/DataContext';


const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const context = useContext(DataContext);

  return (
    <div className="flex h-screen bg-gray-900">
      <Spinner />
      <Notification />
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-800">
          <div className="container mx-auto px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;