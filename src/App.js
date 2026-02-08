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
import { SearchProvider } from './context/SearchContext';
import { DetailDrawer } from './components/UI';
import { EntityDetailsProvider } from './context/EntityDetailsContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Parts from './pages/Parts';
import Equipment from './pages/Equipment';
import Orders from './pages/Orders';
import StockMovements from './pages/StockMovements';
import EquipmentTemplates from './pages/EquipmentTemplates';
import EquipmentReport from './pages/EquipmentReport';

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <SearchProvider>
          <EntityDetailsProvider>
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
                  <Route path='parts' element={<Parts />} />
                  <Route path='equipment' element={<Equipment />} />
                  <Route
                    path='equipment-templates'
                    element={<EquipmentTemplates />}
                  />
                  <Route
                    path='/equipment/report'
                    element={<EquipmentReport />}
                  />
                  <Route path='orders' element={<Orders />} />
                  <Route path='stock-movements' element={<StockMovements />} />
                </Route>

                {/* Catch all - redirect to home */}
                <Route path='*' element={<Navigate to='/' replace />} />
              </Routes>
            </Router>

            {/* Global Detail Drawer - renders outside routes */}
            <DetailDrawer />
          </EntityDetailsProvider>
        </SearchProvider>
      </AuthProvider>
    </Provider>
  );
}

export default App;
