import React, { useState } from 'react';
import MainLayout from '../layout/MainLayout';
import { useLocation } from 'react-router-dom';
import './Employees.css';

const employees = [
  {
    id: '00001',
    user: 'user',
    password: '45678',
    firstName: 'Thanakorn',
    lastName: 'LongLastName',
    phone: '062-123-1456',
    address: '123 บางนา-ตราด แขวงบางนา เขตบางนา กรุงเทพมหานคร 10260',
    position: 'พนักงาน',
    status: 'Working'
  },
  {
    id: '00003',
    user: 'admin',
    password: '12345',
    firstName: 'Sitthinan',
    lastName: 'LongLastName1',
    phone: '092-123-1456',
    address: '124 บางบัวทอง อำเภอบางบัวทอง นนทบุรี 11110',
    position: 'ผู้จัดการ',
    status: 'Working'
  },
  {
    id: '00002',
    user: 'user2',
    password: '9874',
    firstName: 'Phanuttaporn',
    lastName: 'LongLastName2',
    phone: '092-123-1457',
    address: '123 บางนา-ตราด แขวงบางนา เขตบางนา กรุงเทพมหานคร 10260',
    position: 'พนักงาน',
    status: 'Farewell'
  },
];

function Employees(props) {
  const location = useLocation();
  const user = props.user || location.state?.user || JSON.parse(localStorage.getItem('user'));
  const [search, setSearch] = useState('');

  const filteredEmployees = employees.filter(emp =>
    emp.id.includes(search) ||
    emp.user.toLowerCase().includes(search.toLowerCase()) ||
    emp.password.includes(search) ||
    emp.firstName.toLowerCase().includes(search.toLowerCase()) ||
    emp.lastName.toLowerCase().includes(search.toLowerCase()) ||
    emp.phone.includes(search) ||
    emp.address.toLowerCase().includes(search.toLowerCase()) ||
    emp.position.toLowerCase().includes(search.toLowerCase()) ||
    emp.status.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (emp) => {
    alert(`แก้ไขข้อมูลพนักงาน: ${emp.firstName} ${emp.lastName}`);
  };

  return (
    <MainLayout user={user} title="พนักงาน">
      <div className="employees-container">
        <h1 className="employees-title">ข้อมูลพนักงาน</h1>
        <div className="employees-actions">
          <input
            className="employees-search"
            type="text"
            placeholder="ค้นหาพนักงาน"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button className="employees-btn search-btn">ค้นหา</button>
          <button className="employees-btn add-btn">เพิ่มข้อมูล</button>
        </div>
        <div className="employees-table-wrapper">
          <table className="employees-table">
            <thead>
              <tr>
                <th>รหัสพนักงาน</th>
                <th>User</th>
                <th>Password</th>
                <th>ชื่อพนักงาน</th>
                <th>นามสกุล</th>
                <th>เบอร์โทร</th>
                <th>ที่อยู่</th>
                <th>ตำแหน่ง</th>
                <th>สถานะ</th>
                <th>แก้ไขข้อมูล</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map(emp => (
                <tr key={emp.id}>
                  <td>{emp.id}</td>
                  <td>{emp.user}</td>
                  <td>{emp.password}</td>
                  <td>{emp.firstName}</td>
                  <td>{emp.lastName}</td>
                  <td>{emp.phone}</td>
                  <td className="address-cell" title={emp.address}>{emp.address}</td>
                  <td>{emp.position}</td>
                  <td>{emp.status}</td>
                  <td>
                    <button className="edit-link" onClick={() => handleEdit(emp)}>
                      แก้ไข
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}

export default Employees;