import React from 'react';
import MainLayout from '../layout/MainLayout';
import { useAuth } from '../../data/useAuth';

function SalesReport() {
  const { user } = useAuth();

  return (
    <MainLayout user={user} title="รายงานการขาย">
      <div>รายงานการขาย</div>
    </MainLayout>
  );
}

export default SalesReport;