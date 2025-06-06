import React, { useEffect, useState } from 'react';
import MainLayout from '../layout/MainLayout';
import axios from 'axios';
import { useAuth } from '../../data/AuthContext';

function UserLoginHistory() {
  const { user } = useAuth();
  const [loginHistory, setLoginHistory] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [search, setSearch] = useState('');

  // ดึงข้อมูล Login_History
  const fetchLoginHistory = async () => {
    await axios.get('http://localhost:5000/api/login-history')
      .then((response) => {
        setLoginHistory(response.data);
      })
      .catch((error) => {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลประวัติการเข้าใช้งาน:', error);
      });
  };

  // ดึงข้อมูล Employee
  const fetchEmployees = async () => {
    await axios.get('http://localhost:5000/api/employees')
      .then((response) => {
        setEmployees(response.data);
      })
      .catch((error) => {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลพนักงาน:', error);
      });
  };

  useEffect(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    setStartDate(firstDay.toISOString().slice(0, 10));
    setEndDate(now.toISOString().slice(0, 10));
    fetchLoginHistory();
    fetchEmployees();
  }, []);

  // หา Emp Name จาก Emp_Id
  const getEmpName = (empId) => {
    const emp = employees.find(e => e.Emp_Id === empId);
    return emp ? `${emp.Fname} ${emp.Lname}` : empId || "-";
  };

  // หา Role จาก Emp_Id
  const getEmpRole = (empId) => {
    const emp = employees.find(e => e.Emp_Id === empId);
    if (!emp) return "-";
    return emp.Role === 'M' ? 'ผู้จัดการ' : 'พนักงาน';
  };

  // คำนวณรวมระยะเวลา (ชั่วโมง:นาที ชม.)
  const getDuration = (login, logout) => {
    if (!login || !logout) return "-";
    const start = new Date(login);
    const end = new Date(logout);
    const diff = Math.max(0, end - start);
    const hours = diff / (1000 * 60 * 60);
    return `${hours.toFixed(2)} ชม.`;
  };

  // ฟิลเตอร์ข้อมูล
  const filterLoginHistory = () => {
    return loginHistory.filter((item) => {
      const loginDate = item.Login_Time ? item.Login_Time.slice(0, 10) : '';
      const dateMatch =
        (!startDate || loginDate >= startDate) &&
        (!endDate || loginDate <= endDate);
      const empName = (getEmpName(item.Emp_Id) || "").toLowerCase();
      const searchLower = search.toLowerCase();
      const searchMatch =
        item.Emp_Id?.toString().includes(search) ||
        empName.includes(searchLower);
      return dateMatch && searchMatch;
    });
  };

  return (
    <MainLayout user={user} title="ประวัติการเข้าใช้งาน">
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6">ประวัติการเข้าใช้งาน</h2>
        <div className="flex flex-wrap justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <label className="font-medium">วันที่เข้าใช้งาน</label>
            <input
              type="date"
              className="border px-3 py-2 rounded"
              value={startDate}
              onChange={e => {
                const newStart = e.target.value;
                setStartDate(newStart);
                if (endDate && newStart > endDate) {
                  setEndDate(newStart);
                }
              }}
              max={endDate}
            />
            <span>ถึง</span>
            <input
              type="date"
              className="border px-3 py-2 rounded"
              value={endDate}
              onChange={e => {
                const newEnd = e.target.value;
                if (newEnd < startDate) {
                  setEndDate(startDate);
                } else {
                  setEndDate(newEnd);
                }
              }}
              min={startDate}
            />
          </div>
          <div className="flex items-center gap-2 mt-4 sm:mt-0">
            <input
              type="text"
              className="border px-3 py-2 rounded w-[320px]"
              placeholder="ค้นหารหัสพนักงาน / ชื่อพนักงาน"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div style={{ maxHeight: 620, minHeight: 620, overflowY: "auto" }} className="w-full overflow-x-auto">
          <table className="min-w-[900px] w-full table-fixed">
            <colgroup>
              <col style={{ width: "100px" }} />
              <col style={{ width: "220px" }} />
              <col style={{ width: "120px" }} />
              <col style={{ width: "120px" }} />
              <col style={{ width: "120px" }} />
              <col style={{ width: "120px" }} />
            </colgroup>
            <thead className="bg-blue-800 text-white sticky top-0">
              <tr>
                <th className="py-3 text-sm">รหัสพนักงาน</th>
                <th className="py-3 text-sm">ชื่อ-นามสกุล</th>
                <th className="py-3 text-sm">ตำแหน่ง</th>
                <th className="py-3 text-sm">เวลาเข้าใช้งาน</th>
                <th className="py-3 text-sm">เวลาออกจากระบบ</th>
                <th className="py-3 text-sm">รวมระยะเวลา</th>
              </tr>
            </thead>
            <tbody>
              {filterLoginHistory().length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-gray-500">ไม่พบข้อมูล</td>
                </tr>
              ) : (
                filterLoginHistory().map((item, index) => (
                  <tr
                    key={item.Emp_Id + '-' + item.Login_Time}
                    className={`${index % 2 === 0 ? "bg-white" : "bg-blue-50"} hover:bg-blue-100 transition`}
                  >
                    <td className="py-2 text-center">{item.Emp_Id}</td>
                    <td className="py-2 text-center">{getEmpName(item.Emp_Id)}</td>
                    <td className="py-2 text-center">{getEmpRole(item.Emp_Id)}</td>
                    <td className="py-2 text-center">
                      {item.Login_Time ? new Date(item.Login_Time).toLocaleString('th-TH', {
                        year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
                      }) : '-'}
                    </td>
                    <td className="py-2 text-center">
                      {item.LogOut_Time ? new Date(item.LogOut_Time).toLocaleString('th-TH', {
                        year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
                      }) : '-'}
                    </td>
                    <td className="py-2 text-center">{getDuration(item.Login_Time, item.LogOut_Time)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}

export default UserLoginHistory;