import React, { useState } from "react";
import MainLayout from "../../layout/MainLayout";
import ProductSelectModal from "./ProductSelectModal.jsx";
import PaymentModal from "./PaymentModal.jsx";
import ReceiptModal from "./ReceiptModal.jsx";
import StatusModal from "../../ui/StatusModal";
import axios from "axios";
import { useAuth } from '../../../data/AuthContext';

function formatDateTime(date) {
  const pad = (n) => (n < 10 ? "0" + n : n);
  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate()) +
    " " +
    pad(date.getHours()) +
    ":" +
    pad(date.getMinutes()) +
    ":" +
    pad(date.getSeconds())
  );
}

function SalePage() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showPayment, setShowPayment] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [paymentType, setPaymentType] = useState("0");
  const [lastSale, setLastSale] = useState(null);
  const [statusModal, setStatusModal] = useState({
    open: false,
    message: "",
  });

  const handleAddProducts = (products) => {
    setSelectedProducts((prev) => {
      const updated = [...prev];
      products.forEach((newP) => {
        const found = updated.find((p) => p.Product_Id === newP.Product_Id);
        if (found) {
          found.quantity = (found.quantity || 1) + 0.5;
        } else {
          updated.push({ ...newP, quantity: 1 });
        }
      });
      return updated;
    });
  };

  const handleRemoveProduct = (id) => {
    setSelectedProducts((prev) => prev.filter((p) => p.Product_Id !== id));
  };

  const handleChangeQty = (id, qty) => {
    setSelectedProducts((prev) =>
      prev.map((p) => {
        if (p.Product_Id === id) {  
          const inputQty = Number(qty);
          const maxQty = p.Product_Amount || 1;
          if (inputQty > maxQty) {
            setStatusModal({
              open: true,
              message: `สินค้า ${p.Product_Name} ตอนนี้ มีจำนวนอยู่ในคลัง ${maxQty} ชิ้น`,
            });
            return p;
          }
          return { ...p, quantity: Math.max(1, Math.min(inputQty, maxQty)) };
        } else {
          return p;
        }
      })
    );
  };

  const total = selectedProducts.reduce(
    (sum, p) => sum + (p.quantity || 1) * parseFloat(p.Product_Price),
    0
  );

  const sumQuantity = selectedProducts.reduce(
    (sum, p) => sum + (p.quantity || 1),
    0
  );

  const handleSaveSale = async (saleData) => {
    try {
      const response = await axios.post("http://localhost:5000/api/sale", {
        Sale_Date: formatDateTime(saleData.date),
        Emp_Id: user?.Emp_Id || 1,
        Total_Sale_Price: saleData.total,
        Payment_methods: paymentType,
        Products: selectedProducts.map((p) => ({
          Product_Id: p.Product_Id,
          Sale_Amount: p.quantity,
          Sale_Price: p.Product_Price,
        })),
      });

      if (response.status === 200) {
        setShowPayment(false);
        setLastSale({
          products: selectedProducts,
          total: saleData.total,
          cash: saleData.cash,
          change: saleData.change,
          date: saleData.date,
        });
        if (saleData.printReceipt) setShowReceipt(true);
        setSelectedProducts([]);
        setStatusModal({
          open: true,
          message: "บันทึกข้อมูลการขายเรียบร้อยแล้ว",
        });
        window.dispatchEvent(new Event('sale-completed'));
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการบันทึกข้อมูลการขาย:", error);
      setStatusModal({
        open: true,
        message: "เกิดข้อผิดพลาดในการบันทึกข้อมูลการขาย",
      });
    }
  };

  return (
    <MainLayout user={user} title="ขายสินค้า">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">ข้อมูลสินค้า</h2>
          <button
            className="bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-800"
            onClick={() => setShowModal(true)}
          >
            เพิ่มสินค้า
          </button>
        </div>
        <div className="bg-gray-200 rounded-lg p-4 mb-6">
          <div className="overflow-x-auto">
            <div style={{ maxHeight: 580, minHeight: 580, overflowY: "auto" }}>
              <table className="min-w-[800px] w-full table-fixed">
                <colgroup>
                  <col style={{ width: "60px" }} />
                  <col style={{ width: "140px" }} />
                  <col style={{ width: "250px" }} />
                  <col style={{ width: "120px" }} />
                  <col style={{ width: "120px" }} />
                  <col style={{ width: "100px" }} />
                </colgroup>
                <thead>
                  <tr className="bg-blue-700 text-white font-bold border-b">
                    <th className="py-2 text-center">ลำดับ</th>
                    <th className="py-2 text-center">รูปภาพสินค้า</th>
                    <th className="text-left">ชื่อสินค้า</th>
                    <th className="text-right">ราคาสินค้า</th>
                    <th className="text-right">จำนวนสินค้า</th>
                    <th className="text-center">ลบสินค้า</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <div className="h-56 flex items-center justify-center text-gray-400">
                          ยังไม่มีสินค้า
                        </div>
                      </td>
                    </tr>
                  ) : (
                    selectedProducts.map((p, idx) => (
                      <tr
                        key={p.Product_Id}
                        className={`hover:bg-gray-50 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                      >
                        <td className="align-middle text-center font-semibold">
                          {idx + 1}
                        </td>
                        <td className="py-2 text-center align-middle">
                          <img
                            src={
                              p.Product_Image
                                ? p.Product_Image.startsWith("/uploads/")
                                  ? `http://localhost:5000${p.Product_Image}`
                                  : p.Product_Image
                                : "/noimage.jpg"
                            }
                            alt={p.Product_Name}
                            className="w-28 h-28 object-cover rounded mx-auto"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/noimage.jpg";
                            }}
                            style={{ maxWidth: 120, maxHeight: 120 }}
                          />
                        </td>
                        <td className="text-left align-middle px-2">
                          {p.Product_Name}
                        </td>
                        <td className="text-right align-middle px-2">
                          {parseFloat(p.Product_Price).toLocaleString()} บาท
                        </td>
                        <td className="text-right align-middle px-2">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              className="bg-gray-300 text-gray-700 px-2 py-1 rounded hover:bg-gray-400"
                              onClick={() =>
                                handleChangeQty(
                                  p.Product_Id,
                                  (p.quantity || 1) - 1
                                )
                              }
                              disabled={p.quantity <= 1}
                              type="button"
                            >
                              –
                            </button>
                            <input
                              type="number"
                              min={1}
                              value={p.quantity || 1}
                              onChange={(e) =>
                                handleChangeQty(p.Product_Id, e.target.value)
                              }
                              className="w-16 border rounded text-center"
                              style={{ appearance: "textfield" }}
                            />
                            <button
                              className="bg-gray-300 text-gray-700 px-2 py-1 rounded hover:bg-gray-400"
                              onClick={() =>
                                handleChangeQty(
                                  p.Product_Id,
                                  (p.quantity || 1) + 1
                                )
                              }
                              type="button"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="text-center align-middle">
                          <button
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                            onClick={() => handleRemoveProduct(p.Product_Id)}
                          >
                            ลบ
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-end">
          <div></div>
          <div className="text-right mb-2">
            <p>
              สินค้าทั้งหมด <strong>{selectedProducts.length}</strong> รายการ
            </p>
            <p>
              จำนวนสินค้าทั้งหมด <strong>{sumQuantity}</strong> ชิ้น
            </p>
            <p>
              ราคารวมทั้งหมด <strong>{total.toLocaleString()} บาท</strong>
            </p>
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <button
            className="bg-blue-700 text-white px-8 py-2 rounded hover:bg-blue-800"
            onClick={() => setShowPayment(true)}
          >
            ยืนยัน
          </button>
          <button
            className="bg-red-600 text-white px-8 py-2 rounded hover:bg-red-700"
            onClick={() => setSelectedProducts([])}
          >
            ลบรายการทั้งหมด
          </button>
        </div>
        <ProductSelectModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onAdd={handleAddProducts}
        />
        <PaymentModal
          isOpen={showPayment}
          total={total}
          paymentType={paymentType}
          setPaymentType={setPaymentType}
          onCancel={() => setShowPayment(false)}
          onConfirm={async ({ cash, change, printReceipt }) => {
            const saleDate = new Date();
            await handleSaveSale({
              date: saleDate,
              total,
              cash,
              change,
              printReceipt,
            });
          }}
        />
        <ReceiptModal
          isOpen={showReceipt}
          onClose={() => setShowReceipt(false)}
          saleData={lastSale}
        />
        <StatusModal
          isOpen={statusModal.open}
          message={statusModal.message}
          onClose={() => setStatusModal({ open: false, message: "" })}
        />
      </div>
    </MainLayout>
  );
}

export default SalePage;
