import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/equipment', label: 'Equipment', icon: '🔧' },
    { path: '/orders', label: 'Orders', icon: '🛒' },
    { path: '/parts', label: 'Parts', icon: '⚙️' },
    { path: '/parts-categories', label: 'Parts Categories', icon: '📑' },
    { path: '/parts-colors', label: 'Add Quantity', icon: '🔩' },
    { path: '/stock-movements', label: 'Stock Movements', icon: '📈' },
    { path: '/inventory', label: 'Inventory', icon: '📦' },
    { path: '/brands', label: 'Brands', icon: '🏷️' },
    { path: '/categories', label: 'Categories', icon: '📂' },
    { path: '/colors', label: 'Colors', icon: '🖌️' },
    { path: '/equipment-templates', label: 'Templates', icon: '📋' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {isOpen && (
        <div
          className='fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden'
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className='h-full overflow-y-auto py-6'>
          <nav className='space-y-1 px-3'>
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive(item.path)
                    ? 'bg-[#F0F0F0] text-[#361826]'
                    : 'text-[#787878] hover:bg-gray-100'
                }`}
              >
                <span className='text-xl'>{item.icon}</span>
                <span className='font-medium'>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
