import React from 'react';
import MainLayout from '../layout/MainLayout';
import { useAuth } from '../../data/useAuth';

function StockReport() {
  const { user } = useAuth();

  return (
    <MainLayout user={user} title="สินค้าคงเหลือ">
      <h1>สินค้าคงเหลือ</h1>
    </MainLayout>
  );
}

export default StockReport;