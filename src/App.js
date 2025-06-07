import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './data/AuthContext';
import Login from './components/Login';
import SalesReport from './components/pages/SalesReport';
import StockReport from './components/pages/StockReport';
import PurchaseReport from './components/pages/PurchaseReport/PurchaseReport';
import SalesHistory from './components/pages/SalesHistory/SalesHistory';
import SalePage from './components/pages/Sale/SalePage';
import ProductsPage from './components/pages/Product/ProductsPage';
import PurchasePage from './components/pages/Purchase/PurchasePage';
import Employees from './components/pages/Employees';
import Suppliers from './components/pages/Suppliers';
import ProtectedRoute from './components/ProtectedRoute';
import UserLoginHistory from './components/pages/UserHistory';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/sale" element={<ProtectedRoute><SalePage /></ProtectedRoute>} />
          <Route path="/products" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
          <Route path="/employees" element={<ProtectedRoute role="manager"><Employees /></ProtectedRoute>} />
          <Route path="/suppliers" element={<ProtectedRoute role="manager"><Suppliers /></ProtectedRoute>} />
          <Route path="/sales-history" element={<ProtectedRoute><SalesHistory /></ProtectedRoute>} />
          <Route path="/sales-report" element={<ProtectedRoute><SalesReport /></ProtectedRoute>} />
          <Route path="/stock-report" element={<ProtectedRoute><StockReport /></ProtectedRoute>} />
          <Route path="/purchase" element={<ProtectedRoute><PurchasePage /></ProtectedRoute>} />
          <Route path="/purchase-report" element={<ProtectedRoute><PurchaseReport /></ProtectedRoute>} />
          <Route path="/user-history" element={<ProtectedRoute><UserLoginHistory /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/sale" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
