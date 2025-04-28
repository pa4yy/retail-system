import React from 'react';
import MainLayout from '../layout/MainLayout';

function PurchasePage({ user }) {
  return (
    <MainLayout user={user} title="สั่งซื้อสินค้า">
      <div>หน้าสั่งซื้อสินค้า</div>
    </MainLayout>
  );
}

export default PurchasePage; 