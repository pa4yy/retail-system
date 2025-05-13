import React from 'react';
import MainLayout from '../layout/MainLayout';
import { useLocation } from 'react-router-dom';

function PurchaseReport(props) {
  const location = useLocation();
  const user = props.user || location.state?.user || JSON.parse(localStorage.getItem('user'));

  return (
    <MainLayout user={user} title="การสั่งซื้อสินค้า">
      <div>การสั่งซื้อสินค้า</div>
    </MainLayout>
  );
}

export default PurchaseReport;