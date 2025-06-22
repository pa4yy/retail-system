import React from "react";
import { formatNumber } from "../../utils/format";

const SummarySection = ({ summary }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    <div className="bg-blue-500 text-white rounded-lg p-6 flex flex-col items-center">
      <div className="text-lg">ยอดขายรวม</div>
      <div className="text-3xl font-bold">{formatNumber(summary.totalSales)} บาท</div>
    </div>
    <div className="bg-red-500 text-white rounded-lg p-6 flex flex-col items-center">
      <div className="text-lg">ต้นทุนรวม</div>
      <div className="text-3xl font-bold">{formatNumber(summary.totalCost)} บาท</div>
    </div>
    <div className="bg-yellow-400 text-white rounded-lg p-6 flex flex-col items-center">
      <div className="text-lg">กำไรสุทธิ</div>
      <div className="text-3xl font-bold">{formatNumber(summary.totalProfit)} บาท</div>
    </div>
  </div>
);

export default SummarySection; 