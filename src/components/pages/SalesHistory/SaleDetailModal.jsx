import React from "react";

const paymentMethodText = (method) => {
  if (method === 0) return "Cash";
  if (method === 1) return "Credit Card";
  return "-";
};

function SaleDetailModal({ open, onClose, sale, saleDetail }) {
  if (!open || !sale) return null;

  const uniqueItems = saleDetail ? saleDetail.reduce((acc, currentItem) => {
    const existingItemIndex = acc.findIndex(item => item.Product_Id === currentItem.Product_Id);
    if (existingItemIndex === -1) {
      acc.push(currentItem);
    } else {

    }
    return acc;
  }, []) : [];

  const totalDisplayAmount = sale.Total_Sale_Price ? parseFloat(sale.Total_Sale_Price).toFixed(2) : "0.00";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-8 min-w-[800px]">
        <h2 className="text-xl font-bold mb-4 text-center">รายละเอียดสินค้า</h2>
        <div className="mb-2">
          หมายเลขการขาย: <span className="font-semibold">{sale.Sale_Id}</span>
        </div>
        <div className="mb-2">
          วันที่ขาย: <span>{new Date(sale.Sale_Date).toLocaleString()}</span>
        </div>
        <div className="mb-2">
          ชื่อคนขาย: <span>{sale.Seller_Name || "-"}</span>
        </div>
        <div className="mb-2">
          วิธีชำระเงิน: <span>{paymentMethodText(sale.Payment_medthods)}</span>
        </div>
        <table className="w-full border mt-4 mb-4">
          <thead>
            <tr className="bg-blue-100">
              <th className="py-2 border">รหัสสินค้า</th>
              <th className="py-2 border">ชื่อสินค้า</th>
              <th className="py-2 border">จำนวน</th>
              <th className="py-2 border">ราคาขาย</th>
              <th className="py-2 border">ราคารวมสินค้า</th>
            </tr>
          </thead>
          <tbody>
            {uniqueItems && uniqueItems.length > 0 ? (
              uniqueItems.map((item, idx) => (
                <tr key={`${item.Sale_Id}-${item.Product_Id}-${idx}`}>
                  <td className="py-1 border text-center">{item.Product_Id}</td>
                  <td className="py-1 border">{item.Product_Name || "-"}</td>
                  <td className="py-1 border text-center">
                    {item.Sale_Amount}
                  </td>
                  <td className="py-1 border text-center">
                    {parseFloat(item.Sale_Price).toFixed(2)}
                  </td>
                  <td className="py-1 border text-center">
                    {(item.Sale_Amount * item.Sale_Price).toFixed(2)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-2 text-gray-500">
                  ไม่มีข้อมูลสินค้า
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="flex justify-between items-center mt-4">
          <div>
            ราคารวมทั้งหมด:{" "}
            <span className="font-bold">
              {totalDisplayAmount}
            </span>{" "}
            บาท
          </div>
          <button
            className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
            onClick={onClose}
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}

export default SaleDetailModal;
