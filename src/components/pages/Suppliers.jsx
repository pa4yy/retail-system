import React, { useState, useEffect } from 'react';
import MainLayout from '../layout/MainLayout';
import axios from 'axios';
import ConfirmModal from '../ui/ConfirmModal';
import StatusModal from '../ui/StatusModal';
import { useAuth } from '../../data/AuthContext';

function Suppliers() {
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [editSupplierId, setEditSupplierId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editIsActive, setEditIsActive] = useState(true);

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

  const openEditModal = (supplier) => {
    setEditSupplierId(supplier.Supplier_Id);
    setEditName(supplier.Supplier_Name);
    setEditPhone(supplier.Supplier_Tel);
    setEditAddress(supplier.Supplier_Address);
    setEditIsActive(supplier.is_Active);
    setShowEditModal(true);
  };

  const fetchSuppliers = async () => {
    axios.get('http://localhost:5000/api/suppliers')
      .then(response => {
        setSuppliers(response.data);
      })
      .catch(err => {
        console.error('Axios error:', err);
        setStatusModal({
          open: true,
          message: 'เกิดข้อผิดพลาดในการดึงข้อมูลคู่ค้า'
        });
      });
  }

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleAddSupplier = (e) => {
    e.preventDefault();

    // ตรวจสอบข้อมูลก่อนบันทึก
    if (!newName.trim()) {
      setStatusModal({
        open: true,
        message: 'กรุณากรอกชื่อคู่ค้า'
      });
      return;
    }

    if (!newPhone.trim()) {
      setStatusModal({
        open: true,
        message: 'กรุณากรอกเบอร์โทรคู่ค้า'
      });
      return;
    }

    if (newPhone.length < 10) {
      setStatusModal({
        open: true,
        message: 'กรุณากรอกเบอร์โทรให้ครบ 10 หลัก'
      });
      return;
    }

    if (!newAddress.trim()) {
      setStatusModal({
        open: true,
        message: 'กรุณากรอกที่อยู่คู่ค้า'
      });
      return;
    }

    // ตรวจสอบข้อมูลซ้ำ
    const isPhoneError = suppliers.some(supplier => 
      supplier.Supplier_Tel === newPhone && supplier.is_Active === 1
    );
    if (isPhoneError) {
      setStatusModal({
        open: true,
        message: 'เบอร์โทรนี้มีอยู่ในระบบแล้ว'
      });
      return;
    }

    const isAddressError = suppliers.some(supplier => 
      supplier.Supplier_Address === newAddress && supplier.is_Active === 1
    );
    if (isAddressError) {
      setStatusModal({
        open: true,
        message: 'ที่อยู่นี้มีอยู่ในระบบแล้ว'
      });
      return;
    }

    const newSupplier = {
      Supplier_Name: newName,
      Supplier_Tel: newPhone,
      Supplier_Address: newAddress,
      is_Active: true,
    };

    setConfirmModal({
      open: true,
      title: 'ยืนยันการเพิ่มข้อมูล',
      message: `คุณต้องการเพิ่มข้อมูลคู่ค้า "${newName}" ใช่หรือไม่?`,
      onConfirm: async () => {
        try {
          const response = await axios.post('http://localhost:5000/api/suppliers', newSupplier);
          setSuppliers([...suppliers, { ...newSupplier, Supplier_Id: response.data.id }]);
          setShowModal(false);
          setNewName('');
          setNewPhone('');
          setNewAddress('');
          setStatusModal({
            open: true,
            message: 'เพิ่มข้อมูลคู่ค้าเรียบร้อยแล้ว'
          });
        } catch (err) {
          console.error('Error adding supplier:', err);
          setStatusModal({
            open: true,
            message: 'เกิดข้อผิดพลาดในการเพิ่มข้อมูลคู่ค้า'
          });
        }
        setConfirmModal({ ...confirmModal, open: false });
        fetchSuppliers();
      }
    });
  };

  const handleEditSupplier = (e) => {
    e.preventDefault();

    const updatedSupplier = {
      Supplier_Name: editName,
      Supplier_Tel: editPhone,
      Supplier_Address: editAddress,
      is_Active: editIsActive
    };

    setConfirmModal({
      open: true,
      title: 'ยืนยันการแก้ไขข้อมูล',
      message: `คุณต้องการแก้ไขข้อมูลคู่ค้า "${editName}" ใช่หรือไม่?`,
      onConfirm: async () => {
        try {
          await axios.put(`http://localhost:5000/api/suppliers/${editSupplierId}`, updatedSupplier);
          const updatedSuppliers = suppliers.map(s =>
            s.Supplier_Id === editSupplierId
              ? { ...s, ...updatedSupplier }
              : s
          );
          setSuppliers(updatedSuppliers);
          setShowEditModal(false);
          setEditSupplierId(null);
          setEditName('');
          setEditPhone('');
          setEditAddress('');
          setStatusModal({
            open: true,
            message: 'แก้ไขข้อมูลคู่ค้าเรียบร้อยแล้ว'
          });
        } catch (err) {
          console.error('Error updating supplier:', err);
          setStatusModal({
            open: true,
            message: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูลคู่ค้า'
          });
        }
        setConfirmModal({ ...confirmModal, open: false });
      }
    });
  };

  return (
    <MainLayout user={user} title="Supplier">
      <div className="h-full p-8 bg-white flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">ข้อมูลคู่ค้า</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
          >
            เพิ่มข้อมูล
          </button>
        </div>

        <div className="bg-gray-200 rounded-lg p-3 flex-1 overflow-auto">
          <table className="w-full border-collapse bg-white">
            <thead className="sticky top-0">
              <tr className="bg-blue-700 text-white">
                <th className="p-3 w-[180px]">ชื่อคู่ค้า</th>
                <th className="p-3 w-[500px]">ที่อยู่คู่ค้า</th>
                <th className="p-3 w-[200px]">เบอร์โทร</th>
                <th className="p-3 w-[150px]">สถานะ</th>
                <th className="p-3 w-[150px]">แก้ไข</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-3">ไม่มีข้อมูล</td>
                </tr>
              ) : (
                (() => {
                  const active = suppliers.filter(s => s.is_Active === 1);
                  const inactive = suppliers.filter(s => s.is_Active === 0);
                  return [...active, ...inactive].map((supplier, idx) => (
                    <tr key={supplier.Supplier_Id} className={`hover:bg-gray-50 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                      <td className="p-3">{supplier.Supplier_Name}</td>
                      <td className="p-3">{supplier.Supplier_Address}</td>
                      <td className="p-3">{supplier.Supplier_Tel}</td>
                      <td className="p-3 text-center">
                        {supplier.is_Active ? "สั่งซื้อด้วย" : "ไม่สั่งซื้อด้วย"}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => openEditModal(supplier)}
                          className="text-red-500 hover:underline"
                        >
                          แก้ไข
                        </button>
                      </td>
                    </tr>
                  ));
                })()
              )}
            </tbody>
          </table>
        </div>

        {/* Modals */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-15 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg w-full max-w-md">
              <h2 className="text-xl font-bold text-center mb-4">เพิ่มข้อมูลคู่ค้า</h2>
              <form onSubmit={handleAddSupplier}>
                <div className="mb-4">
                  <label className="block mb-1 font-medium">ชื่อคู่ค้า</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    required
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>

                <div className="mb-4">
                  <label className="block mb-1 font-medium">เบอร์โทรคู่ค้า</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={e => {
                      const onlyNums = e.target.value.replace(/\D/g, '');
                      if (onlyNums.length <= 10) {
                        setNewPhone(onlyNums);
                      }
                    }}
                    placeholder="กรอกเบอร์ไม่เกิน 10 ตัว"
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>

                <div className="mb-4">
                  <label className="block mb-1 font-medium">ที่อยู่คู่ค้า</label>
                  <textarea
                    rows={4}
                    value={newAddress}
                    onChange={e => setNewAddress(e.target.value)}
                    required
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>

                <div className="flex justify-center gap-4 mt-6">
                  <button
                    type="submit"
                    className="bg-blue-700 text-white px-8 py-2 rounded hover:bg-blue-800"
                  >
                    เพิ่มข้อมูล
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="bg-red-600 text-white px-8 py-2 rounded hover:bg-red-700"
                  >
                    ยกเลิก
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-15 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg w-full max-w-md">
              <h2 className="text-xl font-bold text-center mb-4">แก้ไขข้อมูลคู่ค้า</h2>
              <form onSubmit={handleEditSupplier}>
                <div className="mb-4">
                  <label className="block mb-1 font-medium">ชื่อคู่ค้า</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    required
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>

                <div className="mb-4">
                  <label className="block mb-1 font-medium">เบอร์โทรคู่ค้า</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={e => {
                      const onlyNums = e.target.value.replace(/\D/g, '');
                      if (onlyNums.length <= 10) {
                        setEditPhone(onlyNums);
                      }
                    }}
                    placeholder="กรอกเบอร์ไม่เกิน 10 ตัว"
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>

                <div className="mb-4">
                  <label className="block mb-1 font-medium">ที่อยู่คู่ค้า</label>
                  <textarea
                    rows={4}
                    value={editAddress}
                    onChange={e => setEditAddress(e.target.value)}
                    required
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>

                <div className="mb-4">
                  <label className="block mb-1 font-medium">สถานะ</label>
                  <select
                    value={editIsActive ? "true" : "false"}
                    onChange={e => setEditIsActive(e.target.value === "true")}
                    className="w-full p-2 border border-gray-300 rounded"
                  >
                    <option value="true">สั่งซื้อด้วย</option>
                    <option value="false">ไม่สั่งซื้อด้วย</option>
                  </select>
                </div>

                <div className="flex justify-center gap-4 mt-6">
                  <button
                    type="submit"
                    className="bg-blue-700 text-white px-8 py-2 rounded hover:bg-blue-800"
                  >
                    บันทึกการแก้ไข
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="bg-red-600 text-white px-8 py-2 rounded hover:bg-red-700"
                  >
                    ยกเลิก
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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
      </div>
    </MainLayout>
  );
}

export default Suppliers;