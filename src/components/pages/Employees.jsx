import React, { useState, useEffect } from 'react';
import MainLayout from '../layout/MainLayout';
import axios from 'axios';
import ConfirmModal from '../ui/ConfirmModal';
import StatusModal from '../ui/StatusModal';
import { useAuth } from '../../data/AuthContext';

function EmployeeModal({ show, type, employee, onClose, onSave }) {
  const [form, setForm] = useState({
    Emp_user: '',
    Password: '',
    Fname: '',
    Lname: '',
    Emp_Tel: '',
    Role: 'พนักงาน',
    Emp_Status: 'Working',
    Emp_Address: ''
  });

  useEffect(() => {
    if (type === 'edit' && employee) {
      setForm({
        Emp_user: employee.Emp_user || '',
        Password: employee.Password || '',
        Fname: employee.Fname || '',
        Lname: employee.Lname || '',
        Emp_Tel: employee.Emp_Tel || '',
        Role: employee.Role === 'M' ? 'ผู้จัดการ' : 'พนักงาน',
        Emp_Status: employee.Emp_Status === 'W' ? 'Working' : 'Farewell',
        Emp_Address: employee.Emp_Address || ''
      });
    } else if (type === 'add') {
      setForm({
        Emp_user: '', Password: '', Fname: '', Lname: '', Emp_Tel: '', Role: 'พนักงาน', Emp_Status: 'Working', Emp_Address: ''
      });
    }
  }, [type, employee, show]);

  if (!show) return null;

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg w-full max-w-2xl shadow-lg">
        <h2 className="text-xl font-bold text-center mb-6">
          {type === 'edit' ? 'แก้ไขข้อมูลพนักงาน' : 'เพิ่มข้อมูลพนักงาน'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block mb-1">User</label>
              <input
                name="Emp_user"
                value={form.Emp_user}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block mb-1">Password</label>
              <input
                name="Password"
                value={form.Password}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block mb-1">ชื่อพนักงาน</label>
              <input
                name="Fname"
                value={form.Fname}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block mb-1">นามสกุลพนักงาน</label>
              <input
                name="Lname"
                value={form.Lname}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block mb-1">เบอร์โทร</label>
              <input
                name="Emp_Tel"
                value={form.Emp_Tel}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block mb-1">ตำแหน่ง</label>
              <select
                name="Role"
                value={form.Role}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="พนักงาน">พนักงาน</option>
                <option value="ผู้จัดการ">ผู้จัดการ</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block mb-1">สถานะ</label>
            <select
              name="Emp_Status"
              value={form.Emp_Status}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="Working">Working</option>
              <option value="Farewell">Farewell</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-1">ที่อยู่</label>
            <textarea
              name="Emp_Address"
              value={form.Emp_Address}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded bg-blue-50 min-h-[60px]"
            />
          </div>

          <div className="flex justify-center gap-8 mt-6">
            <button
              type="submit"
              className="bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-800"
            >
              {type === 'edit' ? 'บันทึก' : 'เพิ่ม'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
            >
              ยกเลิก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Employees() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showWorking, setShowWorking] = useState(true);
  const [showFarewell, setShowFarewell] = useState(true);

  // เพิ่ม state สำหรับ ConfirmModal และ StatusModal
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    title: '',
    message: '',
    onConfirm: null
  });

  const [statusModal, setStatusModal] = useState({
    open: false,
    message: ''
  });

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/employees');
        setEmployees(response.data);
        setLoading(false);
      } catch (err) {
        setError('ไม่สามารถดึงข้อมูลพนักงานได้');
        setLoading(false);
        setStatusModal({
          open: true,
          message: 'เกิดข้อผิดพลาดในการดึงข้อมูลพนักงาน'
        });
      }
    };

    fetchEmployees();
  }, []);

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = (String(emp.Emp_Id) || '').includes(search) ||
      (emp.Emp_user || '').toLowerCase().includes(search.toLowerCase()) ||
      (emp.Fname || '').toLowerCase().includes(search.toLowerCase()) ||
      (emp.Lname || '').toLowerCase().includes(search.toLowerCase()) ||
      (emp.Emp_Tel || '').includes(search) ||
      (emp.Emp_Address || '').toLowerCase().includes(search.toLowerCase()) ||
      (emp.Role || '').toLowerCase().includes(search.toLowerCase()) ||
      (emp.Emp_Status || '').toLowerCase().includes(search.toLowerCase());

    const matchesStatus = (emp.Emp_Status === 'W' && showWorking) || 
                         (emp.Emp_Status === 'F' && showFarewell);

    return matchesSearch && matchesStatus;
  });

  const handleEdit = (emp) => {
    setModalType('edit');
    setSelectedEmployee(emp);
    setShowModal(true);
  };

  const handleAdd = () => {
    setModalType('add');
    setSelectedEmployee(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSave = async (form) => {
    try {
      // แปลงค่าก่อนส่ง
      const payload = {
        ...form,
        Role: form.Role === 'ผู้จัดการ' ? 'M' : 'E',
        Emp_Status: form.Emp_Status === 'Working' ? 'W' : 'F'
      };

      setConfirmModal({
        open: true,
        title: modalType === 'add' ? 'ยืนยันการเพิ่มข้อมูล' : 'ยืนยันการแก้ไขข้อมูล',
        message: modalType === 'add' 
          ? `คุณต้องการเพิ่มข้อมูลพนักงาน "${form.Fname} ${form.Lname}" ใช่หรือไม่?`
          : `คุณต้องการแก้ไขข้อมูลพนักงาน "${form.Fname} ${form.Lname}" ใช่หรือไม่?`,
        onConfirm: async () => {
          try {
            if (modalType === 'add') {
              await axios.post('http://localhost:5000/api/employees', payload);
              setStatusModal({
                open: true,
                message: 'เพิ่มข้อมูลพนักงานเรียบร้อยแล้ว'
              });
            } else if (modalType === 'edit' && selectedEmployee && selectedEmployee.Emp_Id) {
              await axios.put(`http://localhost:5000/api/employees/${selectedEmployee.Emp_Id}`, payload);
              setStatusModal({
                open: true,
                message: 'แก้ไขข้อมูลพนักงานเรียบร้อยแล้ว'
              });
            }
            setShowModal(false);
            setLoading(true);
            const response = await axios.get('http://localhost:5000/api/employees');
            setEmployees(response.data);
            setLoading(false);
          } catch (err) {
            setStatusModal({
              open: true,
              message: err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูลพนักงาน'
            });
          }
          setConfirmModal({ ...confirmModal, open: false });
        }
      });
    } catch (err) {
      setStatusModal({
        open: true,
        message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูลพนักงาน'
      });
    }
  };

  if (loading) return <div>กำลังโหลดข้อมูล...</div>;
  if (error) return <div>เกิดข้อผิดพลาด: {error}</div>;

  return (
    <MainLayout user={user} title="พนักงาน">
      <EmployeeModal
        show={showModal}
        type={modalType}
        employee={selectedEmployee}
        onClose={handleCloseModal}
        onSave={handleSave}
      />
      <div className="h-full min-h-0 overflow-hidden p-8 bg-white flex flex-col">
        <h1 className="text-2xl font-bold mb-4">ข้อมูลพนักงาน</h1>
        
        <div className="flex items-center gap-3 mb-4">
          <input
            className="p-2 border border-gray-300 rounded w-56"
            type="text"
            placeholder="ค้นหาพนักงาน"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button className="bg-blue-700 text-white px-5 py-2 rounded hover:bg-blue-800">
            ค้นหา
          </button>
          <button
            onClick={handleAdd}
            className="bg-blue-700 text-white px-5 py-2 rounded hover:bg-blue-800"
          >
            เพิ่มข้อมูล
          </button>
          
          <div className="flex gap-5 ml-5 items-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showWorking}
                onChange={e => setShowWorking(e.target.checked)}
                className="w-4 h-4"
              />
              Working
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showFarewell}
                onChange={e => setShowFarewell(e.target.checked)}
                className="w-4 h-4"
              />
              Farewell
            </label>
          </div>
        </div>

        <div className="bg-gray-200 p-3 rounded-lg flex-1 overflow-auto">
          <table className="w-full border-collapse bg-white">
            <thead className="sticky top-0">
              <tr className="bg-gray-200">
                <th className="p-3 text-left">รหัสพนักงาน</th>
                <th className="p-3 text-left">User</th>
                <th className="p-3 text-left">ชื่อพนักงาน</th>
                <th className="p-3 text-left">นามสกุล</th>
                <th className="p-3 text-left">เบอร์โทร</th>
                <th className="p-3 text-left">ที่อยู่</th>
                <th className="p-3 text-left">ตำแหน่ง</th>
                <th className="p-3 text-left">สถานะ</th>
                <th className="p-3 text-left">แก้ไขข้อมูล</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map(emp => (
                <tr key={emp.Emp_Id} className="border-b border-gray-200">
                  <td className="p-3">{emp.Emp_Id}</td>
                  <td className="p-3">{emp.Emp_user}</td>
                  <td className="p-3">{emp.Fname}</td>
                  <td className="p-3">{emp.Lname}</td>
                  <td className="p-3">{emp.Emp_Tel}</td>
                  <td className="p-3 max-w-[120px] truncate" title={emp.Emp_Address}>
                    {emp.Emp_Address}
                  </td>
                  <td className="p-3">{emp.Role === 'M' ? 'ผู้จัดการ' : 'พนักงาน'}</td>
                  <td className="p-3">{emp.Emp_Status === 'W' ? 'ทำงาน' : 'ลาออก'}</td>
                  <td className="p-3">
                    <button
                      onClick={() => handleEdit(emp)}
                      className="text-red-500 font-bold hover:underline"
                    >
                      แก้ไข
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* เพิ่ม ConfirmModal และ StatusModal */}
      <ConfirmModal
        isOpen={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ ...confirmModal, open: false })}
      />

      <StatusModal
        isOpen={statusModal.open}
        message={statusModal.message}
        onClose={() => setStatusModal({ open: false, message: '' })}
      />
    </MainLayout>
  );
}

export default Employees;