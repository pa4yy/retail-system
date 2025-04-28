import React from 'react';
import MainLayout from '../layout/MainLayout';

function ProductsPage({ user }) {
  return (
    <MainLayout user={user} title="ข้อมูลสินค้า">
      <div>หน้าข้อมูลสินค้า</div>
    </MainLayout>
  );
}

export default ProductsPage; 