import React, { useState, useEffect } from "react";
import ConfirmModal from "../../ui/ConfirmModal";
import StatusModal from "../../ui/StatusModal";

function PaymentModal({
  isOpen,
  total,
  onCancel,
  onConfirm,
  onPrint,
  paymentType,
  setPaymentType,
}) {
  const [cash, setCash] = useState("");
  const [change, setChange] = useState("0.00");
  const [printReceipt, setPrintReceipt] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [statusModal, setStatusModal] = useState({
    open: false,
    message: "",
  });

  useEffect(() => {
    const cashNum = parseFloat(cash) || 0;
    const changeAmount =
      cashNum > total ? (cashNum - total).toFixed(2) : "0.00";
    setChange(changeAmount);
  }, [cash, total]);

  useEffect(() => {
    if (isOpen) {
      setCash(total.toString());
      setChange("0.00");
      setPrintReceipt(false);
    }
  }, [isOpen, total]);

  const handleCashChange = (e) => {
    const value = e.target.value;
    setCash(value);
  };

  const handleConfirm = () => {
    const cashNum = parseFloat(cash) || 0;
    if (cashNum < total) {
      setStatusModal({
        open: true,
        message: "จำนวนเงินที่รับต้องไม่น้อยกว่ายอดรวม",
      });
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmAccept = () => {
    setShowConfirm(false);
    onConfirm({ cash, change, printReceipt });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-gray-100 rounded-lg p-6 w-full max-w-sm border-2 border-blue-400">
        <div className="flex items-center mb-2">
          <span className="font-bold text-lg mr-2">คิดเงิน</span>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={paymentType}
            onChange={(e) => setPaymentType(e.target.value)}
          >
            <option value="0">เงินสด</option>
            <option value="1">บัตรเครดิต</option>
          </select>
          <label className="ml-4 flex items-center gap-2">
            <input
              type="checkbox"
              checked={printReceipt}
              onChange={(e) => setPrintReceipt(e.target.checked)}
            />
            พิมพ์ใบเสร็จรับเงิน
          </label>
        </div>
        <div className="mb-2">
          <label className="block mb-1">ราคารวม</label>
          <input
            className="w-full p-2 rounded bg-gray-200"
            value={total.toLocaleString()}
            readOnly
          />
        </div>
        <div className="mb-2">
          <label className="block mb-1">รับเงิน</label>
          <input
            type="number"
            className={`w-full p-2 rounded border ${
              parseFloat(cash) < total ? "border-red-500" : "border-gray-300"
            }`}
            value={cash}
            onChange={handleCashChange}
            min={total}
            step="0.01"
          />
          {parseFloat(cash) < total && (
            <p className="text-red-500 text-sm mt-1">
              จำนวนเงินที่รับต้องไม่น้อยกว่ายอดรวม
            </p>
          )}
        </div>
        <div className="mb-4">
          <label className="block mb-1">เงินทอน</label>
          <input
            className="w-full p-2 rounded bg-gray-200"
            value={parseFloat(change).toLocaleString()}
            readOnly
          />
        </div>
        <div className="flex justify-end space-x-2">
          <button
            className={`px-4 py-2 rounded ${
              parseFloat(cash) < total
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-700 hover:bg-blue-800"
            } text-white`}
            onClick={handleConfirm}
            disabled={parseFloat(cash) < total}
          >
            คิดเงิน
          </button>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            onClick={onCancel}
          >
            ยกเลิก
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        title="ยืนยันการชำระเงิน"
        message={`รับเงิน ${parseFloat(cash).toLocaleString()} บาท ทอน ${parseFloat(change).toLocaleString()} บาท\nต้องการบันทึกข้อมูลการขายใช่หรือไม่?`}
        onConfirm={handleConfirmAccept}
        onCancel={() => setShowConfirm(false)}
      />

      <StatusModal
        isOpen={statusModal.open}
        message={statusModal.message}
        onClose={() => setStatusModal({ open: false, message: "" })}
      />
    </div>
  );
}

export default PaymentModal;
