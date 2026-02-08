import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSearch } from '../../context/SearchContext';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const { searchTerm, setSearchTerm, clearSearch } = useSearch();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut for search (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        searchInputRef.current?.blur();
        setIsSearchFocused(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Get initials from username or full name
  const getInitials = () => {
    if (user?.full_name) {
      const names = user.full_name.split(' ');
      return names.length > 1
        ? `${names[0][0]}${names[1][0]}`.toUpperCase()
        : names[0].substring(0, 2).toUpperCase();
    }
    return user?.username?.substring(0, 2).toUpperCase() || 'AD';
  };

  // Get placeholder text based on current page
  const getSearchPlaceholder = () => {
    const path = location.pathname;
    if (path === '/equipment') return 'Search equipment...';
    if (path === '/parts') return 'Search parts...';
    if (path === '/orders') return 'Search orders...';
    if (path === '/stock-movements') return 'Search stock movements...';
    if (path === '/equipment-templates') return 'Search templates...';
    return 'Search... (Ctrl+K)';
  };

  // Check if search is available on current page
  const isSearchAvailable = () => {
    const searchablePages = [
      '/equipment',
      '/parts',
      '/orders',
      '/stock-movements',
      '/equipment-templates',
    ];
    return searchablePages.includes(location.pathname);
  };

  return (
    <nav className='bg-[#F0F0F0] text-[#7E7E7E] shadow-lg sticky top-0 z-40'>
      <div className='px-4 py-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-4'>
            <button
              onClick={toggleSidebar}
              className='lg:hidden p-2 rounded-md hover:bg-gray-300 transition'
            >
              <svg
                className='w-6 h-6'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M4 6h16M4 12h16M4 18h16'
                />
              </svg>
            </button>
            <Link to='/' className='flex flex-col items-start'>
              <img
                src='/assets/logo.png'
                alt='DYNAVOX Logo'
                className='w-100 h-7 object-contain'
              />
              <span className='text-xl font-bold hidden sm:block text-gray-700'>
                Inventory
              </span>
            </Link>
          </div>

          {/* Global Search Bar */}
          {isSearchAvailable() && (
            <div className='flex-1 max-w-xl mx-4 hidden md:block'>
              <div
                className={`relative transition-all duration-200 ${
                  isSearchFocused ? 'scale-105' : ''
                }`}
              >
                <input
                  ref={searchInputRef}
                  type='text'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  placeholder={getSearchPlaceholder()}
                  className={`w-full pl-10 pr-10 py-2 rounded-lg border transition-all duration-200 ${
                    isSearchFocused
                      ? 'border-blue-500 bg-white shadow-lg ring-2 ring-blue-200'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                />
                <svg
                  className={`absolute left-3 top-2.5 h-5 w-5 transition-colors ${
                    isSearchFocused ? 'text-blue-500' : 'text-gray-400'
                  }`}
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                  />
                </svg>
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className='absolute right-3 top-2.5 text-gray-400 hover:text-gray-600'
                  >
                    <svg
                      className='h-5 w-5'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M6 18L18 6M6 6l12 12'
                      />
                    </svg>
                  </button>
                )}
                {!searchTerm && !isSearchFocused && (
                  <span className='absolute right-3 top-2.5 text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded'>
                    Ctrl+K
                  </span>
                )}
              </div>
            </div>
          )}

          <div className='flex items-center space-x-4'>
            {/* Mobile Search Button */}
            {isSearchAvailable() && (
              <button
                onClick={() => searchInputRef.current?.focus()}
                className='md:hidden p-2 rounded-md hover:bg-gray-300 transition'
              >
                <svg
                  className='w-6 h-6'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                  />
                </svg>
              </button>
            )}

            {/* User Dropdown */}
            <div className='relative' ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className='flex items-center space-x-2 hover:bg-gray-200 px-3 py-2 rounded-lg transition'
              >
                <div className='w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-sm'>
                  <span className='text-white font-semibold text-sm'>
                    {getInitials()}
                  </span>
                </div>
                <div className='hidden md:block text-left'>
                  <p className='text-sm font-medium text-gray-700'>
                    {user?.full_name || user?.username || 'Admin'}
                  </p>
                  <p className='text-xs text-gray-500 capitalize'>
                    {user?.role || 'User'}
                  </p>
                </div>
                <svg
                  className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                    showDropdown ? 'rotate-180' : ''
                  }`}
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 9l-7 7-7-7'
                  />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className='absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-2xl py-2 z-50 border border-gray-200'>
                  {/* User Info */}
                  <div className='px-4 py-3 border-b border-gray-100'>
                    <p className='text-sm font-semibold text-gray-800'>
                      {user?.full_name || user?.username}
                    </p>
                    <p className='text-xs text-gray-500 mt-1'>{user?.email}</p>
                    <span className='inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full capitalize'>
                      {user?.role || 'User'}
                    </span>
                  </div>

                  {/* Menu Items */}
                  <div className='py-2'>
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                      }}
                      className='w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition'
                    >
                      <svg
                        className='w-5 h-5 mr-3 text-gray-500'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                        />
                      </svg>
                      Profile Settings
                    </button>

                    <div className='border-t border-gray-100 my-2'></div>

                    <button
                      onClick={handleLogout}
                      className='w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition'
                    >
                      <svg
                        className='w-5 h-5 mr-3'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
                        />
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isSearchAvailable() && (
          <div className='mt-3 md:hidden'>
            <div className='relative'>
              <input
                type='text'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={getSearchPlaceholder()}
                className='w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 bg-white'
              />
              <svg
                className='absolute left-3 top-2.5 h-5 w-5 text-gray-400'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                />
              </svg>
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className='absolute right-3 top-2.5 text-gray-400 hover:text-gray-600'
                >
                  <svg
                    className='h-5 w-5'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M6 18L18 6M6 6l12 12'
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
