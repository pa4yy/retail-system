import React, { useEffect, useState } from 'react';

function ConfirmProductModal({ isOpen, onClose, products = [] }) {
    if (!isOpen) return null;
  
    const totalItems = products.length;
    const totalPrice = products.reduce((sum, item) => sum + (Number(item.Product_Price) || 0), 0);
    console.log("Products:", products);

  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
        <div className="bg-white w-[900px] rounded-lg shadow-lg p-6 max-h-[90vh] overflow-y-auto border border-[#0073ac]">
  
          <div className="mb-4 text-center text-xl font-bold">รายละเอียดสินค้า</div>
  
          <div className="mb-2">รหัสพนักงานที่สั่งซื้อ : 00001</div>
  
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
                    <tr key={p.Product_Id} className={index % 2 === 0 ? 'bg-white' : 'bg-[#f0f8ff]'}>
                      <td className="py-2 px-3">{p.Product_Id}</td>
                      <td className="py-2 px-3">{p.Product_Name}</td>
                      <td className="py-2 px-3 text-right">{p.Product_Amount}</td>
                      <td className="py-2 px-3 text-right">{Number(p.Product_Price).toLocaleString()} บาท</td>
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
                    onClick={() => { alert("ดำเนินการสั่งซื้อเรียบร้อย"); onClose(); }}
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
            </>
          )}
        </div>
      </div>
    );
  }
  
  

export default ConfirmProductModal;
