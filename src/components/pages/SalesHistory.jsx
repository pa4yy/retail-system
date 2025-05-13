import React from 'react';
import MainLayout from '../layout/MainLayout';
import { useLocation } from 'react-router-dom';

function SalesHistory(props) {

  const location = useLocation();
  const user = props.user || location.state?.user || JSON.parse(localStorage.getItem('user'));

  return (
    <MainLayout user={user} title="ประวัติการขาย">
      <h1>ประวัติการขาย</h1>
    </MainLayout>
  );
}

export default SalesHistory;