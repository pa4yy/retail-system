import React from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const ReceiptModal = ({ isOpen, onClose, receiptData }) => {
  if (!isOpen) return null;

  const { products, employeeName, supplier, totalCost, date } = receiptData;

  // const handleDownload = async () => {
  //   const element = document.getElementById('receipt-a4');
  //   if (!element) return;
  //   const canvas = await html2canvas(element, {
  //     scale: 2,
  //     useCORS: true,
  //     backgroundColor: '#fff',
  //     width: 794,
  //     height: 1123,
  //     windowWidth: 794,
  //     windowHeight: 1123,
  //   });
  //   const link = document.createElement('a');
  //   link.download = `ใบสั่งซื้อ_${date}.png`;
  //   link.href = canvas.toDataURL('image/png');
  //   link.click();
  // };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('receipt-a4');
    if (!element) return;
    // ซ่อนปุ่มดาวน์โหลดก่อน capture
    const btns = element.querySelectorAll('.download-hide');
    btns.forEach(btn => btn.style.display = 'none');
    // แปลงเป็น canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#fff',
      width: 794,
      height: 1123,
      windowWidth: 794,
      windowHeight: 1123,
    });
    // แสดงปุ่มกลับ
    btns.forEach(btn => btn.style.display = '');
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
    });
    pdf.addImage(imgData, 'PNG', 0, 0, 595.28, 841.89); // ขนาด A4 pt
    pdf.save(`ใบสั่งซื้อ_${date}.pdf`);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-auto"
      onClick={onClose}
    >
      <div
        id="receipt-a4"
        className="bg-white rounded-xl shadow-xl w-[794px] h-[1123px] p-8 relative text-sm overflow-auto"
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
          {/* <p><span className="font-semibold">ชื่อพนักงานที่สั่งซื้อ:</span> {employeeName || '-'}</p> */}
          <h2 className="text-xl font-semibold mt-4">ใบสั่งซื้อ</h2>
        </div>


        {/* ข้อมูลบริษัท */}
        <div className="grid grid-cols-2 gap-4 border border-gray-300 p-4 rounded-lg">
          <div>
            <p><span className="font-semibold">ชื่อบริษัทคู่ค้า:</span> {supplier?.Supplier_Name}</p>
            <p><span className="font-semibold">ที่อยู่:</span> {supplier?.Supplier_Address || '-'}</p>
            <p><span className="font-semibold">เบอร์โทร:</span> {supplier?.Supplier_Tel || '-'}</p>
          </div>
          <div>
            <p><span className="font-semibold">วันที่สั่งซื้อ:</span> {date}</p>
            <p><span className="font-semibold">พนักงานที่สั่งซื้อ:</span> {employeeName || '-'}</p>
          </div>
        </div>

        {/* <div className="text-center mb-6 mt-6">
          <p><span className="font-semibold">รายการสินค้าทีสั่งซื้อ</span></p>
        </div> */}

        {/* ตารางสินค้า */}
        <div className="overflow-auto h-[800px]">
          <table className="w-full mt-6 border border-gray-300">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="border px-2 py-1">ลำดับ</th>
                {/* <th className="border px-2 py-1">รหัสสินค้า</th> */}
                <th className="border px-2 py-1">รายการสินค้าที่สั่งซื้อ</th>
                <th className="border px-2 py-1">จำนวนที่สั่งซื้อ</th>
                <th className="border px-2 py-1">ราคาสั่งซื้อ</th>
                <th className="border px-2 py-1">จำนวนเงิน</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(products) && products.length > 0 ? (
                products.map((item, index) => (
                  <tr key={item.productId}>
                    <td className="border px-2 py-1 text-center">{index + 1}</td>
                    {/* <td className="border px-2 py-1 text-center">{item.productId}</td> */}
                    <td className="border px-2 py-1">{item.name}</td>
                    <td className="border px-2 py-1 text-center">{item.quantity}</td>
                    <td className="border px-2 py-1 text-center">{Number(item.price).toFixed(2)}</td>
                    <td className="border px-2 py-1 text-right">{(item.quantity * item.price).toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <div className="text-center mb-6 mt-6">
                    <td colSpan="5" className="text-center py-2 text-gray-500">ไม่มีรายการสินค้า</td>
                  </div>

                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* สรุป */}
        <div className="mt-6 text-right space-y-1">
          <p>
            <span className="font-semibold">รวมเงิน:</span> {(Number(totalCost) || 0).toFixed(2)} บาท
          </p>
          <p className="text-lg font-bold">
            จำนวนเงินทั้งสิ้น: {Number(totalCost || 0).toLocaleString()} บาท
          </p>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded download-hide"
            onClick={onClose}
          >
            ปิด
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded download-hide"
            onClick={handleDownloadPDF}
          >
            ดาวน์โหลด
          </button>
        </div>
      </div>
    </div>
  );
};


export default ReceiptModal;
