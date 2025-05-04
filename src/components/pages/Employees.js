import React, { useState, useEffect } from 'react';
import MainLayout from '../layout/MainLayout';
import { useLocation } from 'react-router-dom';
import './Employees.css';

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
    <div className="modal-overlay-custom">
      <div className="modal-content-custom">
        <h2 className="modal-title">{type === 'edit' ? 'แก้ไขข้อมูลพนักงาน' : 'เพิ่มข้อมูลพนักงาน'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="modal-row-custom">
            <div className="modal-col-custom">
              <label>User</label>
              <input name="Emp_user" value={form.Emp_user} onChange={handleChange} required />
            </div>
            <div className="modal-col-custom">
              <label>Password</label>
              <input name="Password" value={form.Password} onChange={handleChange} required />
            </div>
          </div>
          <div className="modal-row-custom">
            <div className="modal-col-custom">
              <label>ชื่อพนักงาน</label>
              <input name="Fname" value={form.Fname} onChange={handleChange} required />
            </div>
            <div className="modal-col-custom">
              <label>นามสกุลพนักงาน</label>
              <input name="Lname" value={form.Lname} onChange={handleChange} required />
            </div>
          </div>
          <div className="modal-row-custom">
            <div className="modal-col-custom">
              <label>เบอร์โทร</label>
              <input name="Emp_Tel" value={form.Emp_Tel} onChange={handleChange} required />
            </div>
            <div className="modal-col-custom">
              <label>ตำแหน่ง</label>
              <select name="Role" value={form.Role} onChange={handleChange}>
                <option value="พนักงาน">พนักงาน</option>
                <option value="ผู้จัดการ">ผู้จัดการ</option>
              </select>
            </div>
          </div>
          <div className="modal-row-custom">
            <div className="modal-col-custom">
              <label>สถานะ</label>
              <select name="Emp_Status" value={form.Emp_Status} onChange={handleChange}>
                <option value="Working">Working</option>
                <option value="Farewell">Farewell</option>
              </select>
            </div>
          </div>
          <div className="modal-row-custom">
            <div className="modal-col-custom" style={{ width: '100%' }}>
              <label>ที่อยู่</label>
              <textarea name="Emp_Address" value={form.Emp_Address} onChange={handleChange} className="modal-address" />
            </div>
          </div>
          <div className="modal-actions-custom">
            <button type="submit" className="modal-btn-custom save-btn-custom">{type === 'edit' ? 'บันทึก' : 'เพิ่ม'}</button>
            <button type="button" className="modal-btn-custom cancel-btn-custom" onClick={onClose}>ยกเลิก</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Employees(props) {
  const location = useLocation();
  const user = props.user || location.state?.user || JSON.parse(localStorage.getItem('user'));
  const [search, setSearch] = useState('');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' or 'edit'
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/employees');
        if (!response.ok) {
          throw new Error('ไม่สามารถดึงข้อมูลพนักงานได้');
        }
        const data = await response.json();
        setEmployees(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const filteredEmployees = employees.filter(emp =>
    (String(emp.Emp_Id) || '').includes(search) ||
    (emp.Emp_user || '').toLowerCase().includes(search.toLowerCase()) ||
    (emp.Fname || '').toLowerCase().includes(search.toLowerCase()) ||
    (emp.Lname || '').toLowerCase().includes(search.toLowerCase()) ||
    (emp.Emp_Tel || '').includes(search) ||
    (emp.Emp_Address || '').toLowerCase().includes(search.toLowerCase()) ||
    (emp.Role || '').toLowerCase().includes(search.toLowerCase()) ||
    (emp.Emp_Status || '').toLowerCase().includes(search.toLowerCase())
  );

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
      if (modalType === 'add') {
        await fetch('http://localhost:5000/api/employees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else if (modalType === 'edit' && selectedEmployee && selectedEmployee.Emp_Id) {
        await fetch(`http://localhost:5000/api/employees/${selectedEmployee.Emp_Id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      setShowModal(false);
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/employees');
      const data = await response.json();
      setEmployees(data);
      setLoading(false);
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
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
          <button className="employees-btn add-btn" onClick={handleAdd}>เพิ่มข้อมูล</button>
        </div>
        <div className="employees-table-wrapper">
          <table className="employees-table">
            <thead>
              <tr>
                <th>รหัสพนักงาน</th>
                <th>User</th>
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
                <tr key={emp.Emp_Id}>
                  <td>{emp.Emp_Id}</td>
                  <td>{emp.Emp_user}</td>
                  <td>{emp.Fname}</td>
                  <td>{emp.Lname}</td>
                  <td>{emp.Emp_Tel}</td>
                  <td className="address-cell" title={emp.Emp_Address}>{emp.Emp_Address}</td>
                  <td>{emp.Role === 'M' ? 'ผู้จัดการ' : 'พนักงาน'}</td>
                  <td>{emp.Emp_Status === 'W' ? 'ทำงาน' : 'ลาออก'}</td>
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