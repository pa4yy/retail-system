import React from 'react';
import MainLayout from '../layout/MainLayout';
import { useLocation } from 'react-router-dom';

function StockReport(props) {

  const location = useLocation();
  const user = props.user || location.state?.user || JSON.parse(localStorage.getItem('user'));

  return (
    <MainLayout user={user} title="สินค้าคงเหลือ">
      <h1>สินค้าคงเหลือ</h1>
    </MainLayout>
  );
}

export default StockReport;