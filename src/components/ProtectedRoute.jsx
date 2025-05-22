import { useAuth } from '../data/AuthContext';
import { Navigate } from 'react-router-dom';
import React from 'react';


export default function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.Role !== role) return <Navigate to="/sale" replace />;
  // return children;
  return React.cloneElement(children, { user });
}
