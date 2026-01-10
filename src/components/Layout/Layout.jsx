import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <Navbar toggleSidebar={toggleSidebar} />

      <div className='flex'>
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

        <main className='flex-1 p-6 lg:ml-2'>
          <div className='max-w-screen-xl mx-auto'>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
