import React from 'react';

const ReceiptModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose}  // คลิกนอก modal ปิด modal
    >
      <div
        className="p-6 bg-white rounded-2xl shadow-xl w-full max-w-3xl mx-auto relative"
        onClick={e => e.stopPropagation()} // ป้องกันคลิกใน modal ปิด modal
      >
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
          onClick={onClose}
        >
          X
        </button>
        {/* เนื้อหาใบเสร็จตามเดิม */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Shop Ease</h1>
          <p><span className="font-semibold">รหัสพนักงานที่สั่งซื้อ:</span> </p>
          <h2 className="text-xl font-semibold mt-4">ใบกำกับภาษี/ใบเสร็จรับเงิน</h2>
        </div>

        <div className="grid grid-cols-2 gap-4 border border-gray-300 p-4 rounded-lg">
          <div>
            <p><span className="font-semibold">ชื่อบริษัทคู่ค้า:</span> </p>
            <p><span className="font-semibold">ที่อยู่:</span> </p>
            <p><span className="font-semibold">เบอร์โทร:</span> </p>
          </div>
          <div>
            <p><span className="font-semibold">วันที่:</span> </p>
            <p><span className="font-semibold">ผู้รับผิดชอบ:</span> </p>
          </div>
        </div>

        <table className="w-full mt-6 border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1">ลำดับ</th>
              <th className="border px-2 py-1">รหัสสินค้า</th>
              <th className="border px-2 py-1">รายการสินค้า/บริการ</th>
              <th className="border px-2 py-1">จำนวน</th>
              <th className="border px-2 py-1">หน่วย</th>
              <th className="border px-2 py-1">ราคาต่อหน่วย</th>
              <th className="border px-2 py-1">จำนวนเงิน</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-2 py-1 text-center">1</td>
              <td className="border px-2 py-1 text-center">A0001</td>
              <td className="border px-2 py-1">เครื่องซักผ้า</td>
              <td className="border px-2 py-1 text-center">1</td>
              <td className="border px-2 py-1 text-center">EA</td>
              <td className="border px-2 py-1 text-right">17,000.00</td>
              <td className="border px-2 py-1 text-right">17,000.00</td>
            </tr>
          </tbody>
        </table>

        <div className="mt-6 text-right space-y-1">
          <p><span className="font-semibold">รวมเงิน:</span> </p>
          <p className="text-lg font-bold">จำนวนเงินทั้งสิ้น: </p>
          <p className="text-sm italic">()</p>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
