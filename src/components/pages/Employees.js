import React from 'react';
import MainLayout from '../layout/MainLayout';
import { useLocation } from 'react-router-dom';

function Employees(props) {
  
  const location = useLocation();
  const user = props.user || location.state?.user || JSON.parse(localStorage.getItem('user'));

  return (
    <MainLayout user={user} title="พนักงาน">
      <div>พนักงาน</div>
    </MainLayout>
  );
}

export default Employees;