import React from "react";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

function ReceiptModal({ isOpen, onClose ,saleData}) {
  if (!isOpen) return null;

  const { products, total, cash, change, date } = saleData;

  const handleDownloadPDF = async () => {
    const element = document.querySelector('.bg-white.rounded-lg.p-6.w-full.max-w-sm.border-2.border-black');
    if (!element) return;

    // ซ่อนปุ่มดาวน์โหลดก่อน capture
    const btns = element.querySelectorAll('.download-hide');
    btns.forEach(btn => btn.style.display = 'none');

    try {
      const canvas = await html2canvas(element, {
        scale: 1,
        useCORS: true,
        backgroundColor: '#fff'
      });

      btns.forEach(btn => btn.style.display = '');

      const imgData = canvas.toDataURL('image/png');
      // กำหนดขอบ (เช่น 24px)
      const padding = 24;
      const pdfWidth = element.offsetWidth + padding * 2;
      const pdfHeight = element.offsetHeight + padding * 2;

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [pdfWidth, pdfHeight]
      });

      // วางใบเสร็จตรงกลาง มีขอบขาวรอบๆ
      pdf.addImage(imgData, 'PNG', padding, padding, element.offsetWidth, element.offsetHeight);
      pdf.save(`ใบเสร็จ_${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (error) {
      console.error('Error creating PDF:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm border-2 border-black">
        <div className="text-center font-bold text-xl mb-1">Shop Ease</div>
        <div className="text-center mb-1">ใบเสร็จรับเงิน</div>
        <div className="text-center text-xs mb-1">TAX ID: 0000000000  VAT  Include</div>
        <div className="text-center text-xs mb-2">โทร 081-234-5678</div>
        <hr className="mb-2" />
        <div className="flex font-bold text-sm mb-1">
          <div className="flex-1 text-left">รายการ</div>
          <div className="w-10 text-center">จำนวน</div>
          <div className="w-16 text-right">ราคา</div>
          <div className="w-16 text-right">รวม</div>
        </div>
        {products.map((p, idx) => (
          <div className="flex text-sm" key={idx}>
            <div className="flex-1 text-left">{p.Product_Name}</div>
            <div className="w-10 text-center">{p.quantity}</div>
            <div className="w-16 text-right">{parseFloat(p.Product_Price).toLocaleString()}</div>
            <div className="w-16 text-right">{(p.quantity * parseFloat(p.Product_Price)).toLocaleString()}</div>
          </div>
        ))}
        <hr className="my-2" />
        <div className="flex text-sm">
          <div className="flex-1 text-left font-bold">ยอดสุทธิ</div>
          <div className="w-10 text-center font-bold">{products.reduce((sum, p) => sum + p.quantity, 0)} ชิ้น</div>
          <div className="w-16"></div>
          <div className="w-16 text-right font-bold">{total.toLocaleString()}</div>
        </div>
        <div className="flex text-sm">
          <div className="flex-1 text-left">เงินสด / เงินทอน</div>
          <div className="w-10"></div>
          <div className="w-16 text-right">{cash ? parseFloat(cash).toLocaleString() : "-"}</div>
          <div className="w-16 text-right">{change ? parseFloat(change).toLocaleString() : "-"}</div>
        </div>
        <div className="flex text-sm">
          <div className="flex-1 text-left">วันที่ออกใบเสร็จ</div>
          <div className="w-10"></div>
          <div className="w-16 text-right">{date?.toLocaleDateString?.() || "-"}</div>
          <div className="w-16 text-right">{date?.toLocaleTimeString?.() || "-"}</div>
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <button
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded download-hide"
            onClick={onClose}
          >
            ปิด
          </button>
          <button
            className="bg-blue-700 text-white px-8 py-2 rounded hover:bg-blue-800 download-hide"
            onClick={handleDownloadPDF}
          >
            ดาวน์โหลด
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReceiptModal;
