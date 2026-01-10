import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Brands from './pages/Brands';
import Categories from './pages/Categories';
import Colors from './pages/Colors';
import Parts from './pages/Parts';
import PartsColors from './pages/PartsColors';
import PartsCategories from './pages/PartsCategories';
import Equipment from './pages/Equipment';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import StockMovements from './pages/StockMovements';
import { SearchProvider } from './context/SearchContext';
import EquipmentTemplates from './pages/EquipmentTemplates';

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <SearchProvider>
          <Router>
            <Routes>
              {/* Public Route - Login */}
              <Route path='/login' element={<Login />} />

              {/* Protected Routes - Wrapped in Layout */}
              <Route
                path='/'
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path='brands' element={<Brands />} />
                <Route path='categories' element={<Categories />} />
                <Route path='colors' element={<Colors />} />
                <Route path='parts' element={<Parts />} />
                <Route path='parts-colors' element={<PartsColors />} />
                <Route path='parts-categories' element={<PartsCategories />} />
                <Route path='equipment' element={<Equipment />} />
                <Route path='inventory' element={<Inventory />} />
                <Route path='orders' element={<Orders />} />
                <Route path='stock-movements' element={<StockMovements />} />
                <Route
                  path='equipment-templates'
                  element={<EquipmentTemplates />}
                />
              </Route>

              {/* Catch all - redirect to home */}
              <Route path='*' element={<Navigate to='/' replace />} />
            </Routes>
          </Router>
        </SearchProvider>
      </AuthProvider>
    </Provider>
  );
}

export default App;
