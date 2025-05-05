import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './components/Login';
import SalesReport from './components/pages/SalesReport';
import StockReport from './components/pages/StockReport';
import PurchaseReport from './components/pages/PurchaseReport';
import SalesHistory from './components/pages/SalesHistory';
import SalePage from './components/pages/SalePage';
import ProductsPage from './components/pages/Product/ProductsPage';
import PurchasePage from './components/pages/PurchasePage';
import Employees from './components/pages/Employees';
import Suppliers from './components/pages/Suppliers';

function ProtectedRoute({ children }) {
  const location = useLocation();
  const storedUser = localStorage.getItem('user');
  const user = location.state?.user || (storedUser ? JSON.parse(storedUser) : null);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return React.cloneElement(children, { user });
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/sales-report" element={<SalesReport />} />
        <Route path="/stock-report" element={<StockReport />} />
        <Route path="/purchase-report" element={<PurchaseReport />} />
        <Route path="/sales-history" element={<SalesHistory />} />
        <Route path="/sale" element={<ProtectedRoute><SalePage /></ProtectedRoute>} />
        <Route path="/products" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
        <Route path="/purchase" element={<ProtectedRoute><PurchasePage /></ProtectedRoute>} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/" element={<Navigate to="/sale" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
