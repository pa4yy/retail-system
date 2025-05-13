import React from 'react';
import MainLayout from '../layout/MainLayout';
import { useAuth } from '../../data/useAuth';

function PurchaseReport() {
  const { user } = useAuth();

  return (
    <MainLayout user={user} title="การสั่งซื้อสินค้า">
      <div>การสั่งซื้อสินค้า</div>
    </MainLayout>
  );
}

export default PurchaseReport;