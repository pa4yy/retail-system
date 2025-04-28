import React from 'react';
import MainLayout from '../layout/MainLayout';

function SalePage({ user }) {
  return (
    <MainLayout user={user} title="ขายสินค้า">
      <div>หน้าขายสินค้า</div>
    </MainLayout>
  );
}

export default SalePage; 