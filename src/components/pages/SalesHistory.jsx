import React from 'react';
import MainLayout from '../layout/MainLayout';
import { useAuth } from '../../data/useAuth';

function SalesHistory() {
  const { user } = useAuth();

  return (
    <MainLayout user={user} title="ประวัติการขาย">
      <h1>ประวัติการขาย</h1>
    </MainLayout>
  );
}

export default SalesHistory;