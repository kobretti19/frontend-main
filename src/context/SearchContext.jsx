import React, { createContext, useState, useContext } from 'react';

const SearchContext = createContext(null);

export const SearchProvider = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const clearSearch = () => {
    setSearchTerm('');
  };

  const value = {
    searchTerm,
    setSearchTerm,
    clearSearch,
    isSearchOpen,
    setIsSearchOpen,
  };

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within SearchProvider');
  }
  return context;
};
