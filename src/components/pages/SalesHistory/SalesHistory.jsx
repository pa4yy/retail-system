import React, { useEffect, useState } from 'react';
import MainLayout from '../../layout/MainLayout';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import SaleDetailModal from './SaleDetailModal';

function SalesHistory(props) {
  const [sales, setSales] = useState([]);
  const location = useLocation();
  const user = props.user || location.state?.user || JSON.parse(localStorage.getItem('user'));
  const [selectedSale, setSelectedSale] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [salesDetail, setSalesDetail] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [search, setSearch] = useState('');
  const [employees, setEmployees] = useState([]);

  const fetchData = async () => {
    await axios.get('http://localhost:5000/api/sales')
    .then((response) => {
      console.log('data form backend', response.data);
      setSales(response.data);
    })
    .catch((error) => {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูลการขาย:', error);
    });
  }

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
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setEndDate(lastDay.toISOString().slice(0, 10));
    fetchData();
    fetchEmployees();
  }, []);

  const handleStartDateChange = (e) => {
    const newStart = e.target.value;
    setStartDate(newStart);
    if (endDate && newStart > endDate) {
      setEndDate(newStart);
    }
  };

  const handleEndDateChange = (e) => {
    const newEnd = e.target.value;
    if (newEnd < startDate) {
      setEndDate(startDate);
    } else {
      setEndDate(newEnd);
    }
  };

  const filterSales = () => {
    return sales.filter((sale) => {
      const saleDate = sale.Sale_Date ? sale.Sale_Date.slice(0, 10) : '';
      const dateMatch =
        (!startDate || saleDate >= startDate) &&
        (!endDate || saleDate <= endDate);
      const searchMatch = sale.Sale_Id?.toString().includes(search);
      return dateMatch && searchMatch;
    });
  }

  const getEmpName = (empId) => {
    const emp = employees.find(e => e.Emp_Id === empId);
    return emp ? `${emp.Fname} ${emp.Lname}` : empId || "-";
  };

  return (
    <MainLayout user={user} title="ประวัติการขาย">
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6">ประวัติการขาย</h2>
        <div className="flex flex-wrap justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <label className="font-medium">วันที่</label>
            <input
              type="date"
              className="border px-3 py-2 rounded"
              value={startDate}
              onChange={handleStartDateChange}
              max={endDate}
            />
            <span>ถึง</span>
            <input
              type="date"
              className="border px-3 py-2 rounded"
              value={endDate}
              onChange={handleEndDateChange}
              min={startDate}
            />
          </div>

          {/* ค้นหา */}
          <div className="flex items-center gap-2 mt-4 sm:mt-0">
            <input
              type="text"
              className="border px-3 py-2 rounded w-[220px]"
              placeholder="ค้นหาหมายเลขการขาย"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              ค้นหา
            </button>
          </div>
        </div>
        {/* Table */}
        <div style={{ maxHeight: 620, minHeight: 620, overflowY: "auto" }} className="w-full overflow-x-auto">
          <table className="min-w-[900px] w-full table-fixed">
            <colgroup>
              <col style={{ width: "100px" }} />
              <col style={{ width: "160px" }} />
              <col style={{ width: "120px" }} />
              <col style={{ width: "120px" }} />
              <col style={{ width: "120px" }} />
              <col style={{ width: "100px" }} />
            </colgroup>
            <thead className="bg-blue-800 text-white sticky top-0">
              <tr>
                <th className="py-3 text-sm">หมายเลขการขาย</th>
                <th className="py-3 text-sm">วันที่ขาย</th>
                <th className="py-3 text-sm">พนักงานขาย</th>
                <th className="py-3 text-sm">ราคารวม</th>
                <th className="py-3 text-sm">วิธีการชำระเงิน</th>
                <th className="py-3 text-sm">รายละเอียด</th>
              </tr>
            </thead>
            <tbody>
              {filterSales().length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-gray-500">ไม่พบข้อมูล</td>
                </tr>
              ) : (
                filterSales().map((p, index) => (
                  <tr
                    key={p.Sale_Id}
                    className={`${index % 2 === 0 ? "bg-white" : "bg-blue-50"} hover:bg-blue-100 transition`}
                  >
                    <td className="py-2 text-center">{p.Sale_Id}</td>
                    <td className="py-2 text-center">
                      {new Date(p.Sale_Date).toLocaleString('th-TH', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false
                      })}
                    </td>
                    <td className="py-2 text-center">{getEmpName(p.Emp_Id)}</td>
                    <td className="py-2 text-center">{parseFloat(p.Total_Sale_Price).toFixed(2)}</td>
                    <td className="py-2 text-center">
                      {p.Payment_medthods === 0
                        ? "Cash"
                        : p.Payment_medthods === 1
                        ? "Credit Card"
                        : "-"}
                    </td>
                    <td className="py-2 text-center">
                      <button
                        className="text-blue-600 hover:underline"
                        onClick={() => {
                          setSelectedSale(p);
                          setSalesDetail(p.Sale_Detail || []);
                          setShowDetail(true);
                        }}
                      >
                        รายละเอียด
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <SaleDetailModal
        open={showDetail}
        onClose={() => setShowDetail(false)}
        sale={selectedSale}
        saleDetail={salesDetail}
      />
    </MainLayout>
  );
}

export default SalesHistory;