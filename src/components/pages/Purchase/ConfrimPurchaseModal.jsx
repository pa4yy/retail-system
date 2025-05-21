import React, { useState } from 'react';
import ConfirmModal from '../../ui/ConfirmModal';
import axios from 'axios';


function ConfirmProductModal({ isOpen, onClose, products = [], user, selectedSupplierId, onResult }) {


  const totalItems = products.length;
  const totalPrice = products.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');



  if (!isOpen) return null;

  console.log("Products:", products);
  console.log("User in modal:", user);
  const handleConfirmPurchase = async () => {
    setModalTitle('กำลังสั่งซื้อ...');
    setModalMessage('กรุณารอสักครู่');
    setModalOpen(true);
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
    console.log("Payload:", payload);


    try {
      console.log("Payload:", payload);
      await axios.post('http://localhost:5000/api/purchase', payload);


      setModalTitle('สั่งซื้อสำเร็จ');
      setModalMessage('ระบบได้ทำการบันทึกการสั่งซื้อแล้ว');
      setTimeout(() => {
        setModalOpen(false);
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

      setModalTitle('สั่งซื้อไม่สำเร็จ');
      setModalMessage('เกิดข้อผิดพลาดในการทำรายการ กรุณาลองใหม่อีกครั้ง');
    }
  };





  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white w-[900px] rounded-lg shadow-lg p-6 max-h-[90vh] overflow-y-auto border border-[#0073ac]">

        <div className="mb-4 text-center text-xl font-bold">รายละเอียดสินค้า</div>

        <div className="mb-2">รหัสพนักงานที่สั่งซื้อ : {user?.Emp_Id || '-'}</div>


        {products.length === 0 ? (
          <div className="text-center text-gray-500 my-10">ไม่มีข้อมูลสินค้า</div>
        ) : (
          <>
            <table className="min-w-full border border-gray-300 mb-4">
              <thead className="bg-[#0073ac] text-white">
                <tr>
                  <th className="py-2 px-3 text-left">รหัสสินค้า</th>
                  <th className="py-2 px-3 text-left">ชื่อสินค้า</th>
                  <th className="py-2 px-3 text-right">จำนวน</th>
                  <th className="py-2 px-3 text-right">ราคา</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, index) => (
                  <tr key={`${p.id}-${index}`} className={index % 2 === 0 ? 'bg-white' : 'bg-[#f0f8ff]'}>
                    <td className="py-2 px-3">{p.productId}</td>
                    <td className="py-2 px-3">{p.name}</td>
                    <td className="py-2 px-3 text-right">{Number(p.quantity)}</td>
                    <td className="py-2 px-3 text-right">
                      {(Number(p.price) || 0).toFixed(2).toLocaleString()} บาท
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-between items-center border-t pt-4">
              <div>
                <p>สินค้าทั้งหมด <strong>{totalItems}</strong> รายการ</p>
                <p>ราคาต้นทุนรวม <strong>{totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong> บาท</p>
              </div>
              <div className="flex gap-3">
                <button
                  className="bg-[#0073ac] text-white px-6 py-2 rounded hover:bg-[#005f8f]"
                  onClick={handleConfirmPurchase}
                >
                  ยืนยันการสั่งซื้อ
                </button>
                <button
                  className="bg-[#dc3546] text-white px-6 py-2 rounded hover:bg-[#b02a37]"
                  onClick={onClose}
                >
                  ปิด
                </button>
              </div>
            </div>
            <ConfirmModal
              isOpen={modalOpen}
              title={modalTitle}
              message={modalMessage}
              onConfirm={() => setModalOpen(false)}
              onCancel={() => setModalOpen(false)}
            />


          </>
        )}
      </div>
    </div>
  );
}
export default ConfirmProductModal;