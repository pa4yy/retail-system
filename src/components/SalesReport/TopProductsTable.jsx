import React from "react";
import { formatNumber } from "../../utils/format";

const TopProductsTable = ({ products }) => (
  <div className="overflow-hidden border border-gray-200 rounded-lg">
    <table className="min-w-full">
      <thead className="sticky top-0 bg-blue-700 text-white">
        <tr>
          <th className="py-2 px-3">ลำดับ</th>
          <th className="py-2 px-3">ชื่อสินค้า</th>
          <th className="py-2 px-3">ประเภทสินค้า</th>
          <th className="py-2 px-3">ราคาขาย (บาท)</th>
          <th className="py-2 px-3">ต้นทุนต่อชิ้น (บาท)</th>
          <th className="py-2 px-3">จำนวนที่ขายได้ (ชิ้น)</th>
        </tr>
      </thead>
      <tbody>
        {products.map((item, idx) => (
          <tr key={item.name} className={idx % 2 === 0 ? "bg-blue-50" : "bg-white"}>
            <td className="text-center py-2 px-3">{idx + 1}</td>
            <td className="py-2 px-3">{item.name}</td>
            <td className="py-2 px-3">{item.type}</td>
            <td className="text-right py-2 px-3">{formatNumber(item.price)}</td>
            <td className="text-right py-2 px-3">{formatNumber(item.totalCost / item.amount)}</td>
            <td className="text-right py-2 px-3">{Math.floor(item.amount)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default TopProductsTable; 