import React from 'react';
import MainLayout from '../layout/MainLayout';

function SalePage({ user }) {
  return (
    <MainLayout user={user} title="ขายสินค้า">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">ข้อมูลสินค้า</h2>
          <button className="bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-800">
            เพิ่มสินค้า
          </button>
        </div>
        <div className="bg-gray-200 rounded-lg p-4 mb-6">
          <table className="w-full text-center">
            <thead>
              <tr className="font-bold border-b">
                <th className="py-2">รูปภาพสินค้า</th>
                <th>ชื่อสินค้า</th>
                <th>ราคาสินค้า</th>
                <th>จำนวนสินค้า</th>
                <th>ลบสินค้า</th>
              </tr>
            </thead>
            <tbody>
              {/* แถวว่าง */}
              <tr>
                <td colSpan={5}>
                  <div className="h-56"></div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="flex justify-between items-end">
          <div></div>
          <div className="text-right mb-2">
            <p>สินค้าทั้งหมด <strong>4</strong> รายการ</p>
            <p>ราคารวมทั้งหมด <strong>2,200.00</strong> บาท</p>
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <button className="bg-blue-700 text-white px-8 py-2 rounded hover:bg-blue-800">
            ยืนยัน
          </button>
          <button className="bg-red-600 text-white px-8 py-2 rounded hover:bg-red-700">
            ลบรายการทั้งหมด
          </button>
        </div>
      </div>
    </MainLayout>
  );
}

export default SalePage;