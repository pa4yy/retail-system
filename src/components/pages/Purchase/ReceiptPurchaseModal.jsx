import React from 'react';

const ReceiptModal = ({ isOpen, onClose, receiptData }) => {
  if (!isOpen) return null;

  const { products, employeeId, employeeName, supplier, totalCost, date } = receiptData;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="p-6 bg-white rounded-2xl shadow-xl w-full max-w-3xl mx-auto relative"
        onClick={e => e.stopPropagation()}
      >
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
          onClick={onClose}
        >
          X
        </button>

        {/* หัวใบเสร็จ */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Shop Ease</h1>
          <p><span className="font-semibold">รหัสพนักงานที่สั่งซื้อ:</span> {employeeId || '-'}</p>
          <h2 className="text-xl font-semibold mt-4">ใบกำกับภาษี/ใบเสร็จรับเงิน</h2>
        </div>

        {/* ข้อมูลบริษัท */}
        <div className="grid grid-cols-2 gap-4 border border-gray-300 p-4 rounded-lg">
          <div>
            <p><span className="font-semibold">ชื่อบริษัทคู่ค้า:</span> {supplier?.Supplier_Name}</p>
            <p><span className="font-semibold">ที่อยู่:</span> {supplier?.Supplier_Address || '-'}</p>
            <p><span className="font-semibold">เบอร์โทร:</span> {supplier?.Supplier_Tel  || '-'}</p>
          </div>
          <div>
            <p><span className="font-semibold">วันที่:</span> {date}</p>
            <p><span className="font-semibold">ผู้รับผิดชอบ:</span> {employeeName || '-'}</p>
          </div>
        </div>

        {/* ตารางสินค้า */}
        <table className="w-full mt-6 border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1">ลำดับ</th>
              <th className="border px-2 py-1">รหัสสินค้า</th>
              <th className="border px-2 py-1">รายการสินค้า/บริการ</th>
              <th className="border px-2 py-1">จำนวน</th>
              <th className="border px-2 py-1">จำนวนเงิน</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(products) && products.length > 0 ? (
              products.map((item, index) => (
                <tr key={item.productId}>
                  <td className="border px-2 py-1 text-center">{index + 1}</td>
                  <td className="border px-2 py-1 text-center">{item.productId}</td>
                  <td className="border px-2 py-1">{item.name}</td>
                  <td className="border px-2 py-1 text-center">{item.quantity}</td>
                  <td className="border px-2 py-1 text-right">{(item.quantity * item.price).toFixed(2)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-2 text-gray-500">ไม่มีรายการสินค้า</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* สรุป */}
        <div className="mt-6 text-right space-y-1">
          <p>
            <span className="font-semibold">รวมเงิน:</span> {(Number(totalCost) || 0).toFixed(2)} บาท
          </p>
          <p className="text-lg font-bold">
            จำนวนเงินทั้งสิ้น: {Number(totalCost || 0).toLocaleString()} บาท
          </p>
        </div>
      </div>
    </div>
  );
};


export default ReceiptModal;
