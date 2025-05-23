import React, { useState } from 'react';
import ConfirmModal from '../../ui/ConfirmModal';
import StatusModal from '../../ui/StatusModal';
import axios from 'axios';

function ConfirmProductModal({ isOpen, onClose, products = [], user, selectedSupplierId, onResult }) {
  const totalItems = products.length;
  const totalPrice = products.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusTitle, setStatusTitle] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('success');

  if (!isOpen) return null;

  console.log("Products:", products);
  console.log("User in modal:", user);
  const handleConfirmPurchase = async () => {
    setConfirmModalOpen(true);
  };

  const handleConfirmSubmit = async () => {
    setConfirmModalOpen(false);
    setStatusTitle('กำลังสั่งซื้อ...');
    setStatusMessage('กรุณารอสักครู่');
    setStatusType('loading');
    setStatusModalOpen(true);

    const payload = {
      Purchase_Date: new Date().toISOString().split('T')[0],
      Purchase_Status: "P",
      Total_Purchase_Price: Number(totalPrice) || 0,
      Supplier_Id: Number(selectedSupplierId) || 0,
      Emp_Id: Number(user?.Emp_Id) || 0,
      Products: products.map(p => ({
        Product_Id: Number(p.productId) || 0,
        Product_Amount: Number(p.quantity) || 0,
        Purchase_Price: Number(p.price) || 0
      }))
    };

    try {
      await axios.post('http://localhost:5000/api/purchase', payload);
      
      setStatusTitle('สั่งซื้อสำเร็จ');
      setStatusMessage('ระบบได้ทำการบันทึกการสั่งซื้อแล้ว');
      setStatusType('success');
      
      setTimeout(() => {
        setStatusModalOpen(false);
        onClose();
        console.log('Calling onResult with success');
        onResult?.({
          status: 'success',
          products: products,
          supplier: selectedSupplierId,
          User: {
            Employee_Id: user?.Emp_Id,
            Employee_Name: `${user?.Fname || ''} ${user?.Lname || ''}`.trim()
          }
        });
      }, 1500);

    } catch (error) {
      setStatusTitle('สั่งซื้อไม่สำเร็จ');
      setStatusMessage('เกิดข้อผิดพลาดในการทำรายการ กรุณาลองใหม่อีกครั้ง');
      setStatusType('error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white w-[800px] rounded-lg shadow-lg p-4 max-h-[85vh] overflow-y-auto border border-[#0073ac]">
        <div className="mb-3 text-center text-lg font-bold">รายละเอียดสินค้า</div>
        <div className="mb-2 text-sm">รหัสพนักงานที่สั่งซื้อ : {user?.Emp_Id || '-'}</div>

        {products.length === 0 ? (
          <div className="text-center text-gray-500 my-8">ไม่มีข้อมูลสินค้า</div>
        ) : (
          <>
            <table className="min-w-full border border-gray-300 mb-3">
              <thead className="bg-[#0073ac] text-white">
                <tr>
                  <th className="py-2 px-2 text-left text-sm">รหัสสินค้า</th>
                  <th className="py-2 px-2 text-left text-sm">ชื่อสินค้า</th>
                  <th className="py-2 px-2 text-right text-sm">จำนวน</th>
                  <th className="py-2 px-2 text-right text-sm">ราคา</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, index) => (
                  <tr key={`${p.id}-${index}`} className={index % 2 === 0 ? 'bg-white' : 'bg-[#f0f8ff]'}>
                    <td className="py-2 px-2 text-sm">{p.productId}</td>
                    <td className="py-2 px-2 text-sm">{p.name}</td>
                    <td className="py-2 px-2 text-right text-sm">{Number(p.quantity)}</td>
                    <td className="py-2 px-2 text-right text-sm">
                      {(Number(p.price) || 0).toFixed(2).toLocaleString()} บาท
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-between items-center border-t pt-3">
              <div className="text-sm">
                <p>สินค้าทั้งหมด <strong>{totalItems}</strong> รายการ</p>
                <p>ราคาต้นทุนรวม <strong>{totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong> บาท</p>
              </div>
              <div className="flex gap-2">
                <button
                  className="bg-[#0073ac] text-white px-4 py-1.5 rounded hover:bg-[#005f8f] text-sm"
                  onClick={handleConfirmPurchase}
                >
                  ยืนยันการสั่งซื้อ
                </button>
                <button
                  className="bg-[#dc3546] text-white px-4 py-1.5 rounded hover:bg-[#b02a37] text-sm"
                  onClick={onClose}
                >
                  ปิด
                </button>
              </div>
            </div>

            <ConfirmModal
              isOpen={confirmModalOpen}
              title="ยืนยันการสั่งซื้อ"
              message="คุณต้องการยืนยันการสั่งซื้อสินค้าหรือไม่?"
              onConfirm={handleConfirmSubmit}
              onCancel={() => setConfirmModalOpen(false)}
            />

            <StatusModal
              isOpen={statusModalOpen}
              title={statusTitle}
              message={statusMessage}
              type={statusType}
              onClose={() => setStatusModalOpen(false)}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default ConfirmProductModal;