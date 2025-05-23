import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StatusModal from '../../ui/StatusModal';
import ConfirmModal from '../../ui/ConfirmModal';

function ReceiveProductModal({ isOpen, onClose, purchase, user, onReceiveSuccess }) {
  const [products, setProducts] = useState([]);
  const [purchaseDetail, setPurchaseDetail] = useState(null);
  const [statusModal, setStatusModal] = useState({ isOpen: false, message: '' });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, message: '' });

  useEffect(() => {
    if (isOpen && purchase?.Purchase_Id) {
      axios
        .get(`http://localhost:5000/api/purchase-detail/${purchase.Purchase_Id}`)
        .then((res) => {
          const data = res.data.Items.map((item) => ({
            Product_Id: item.Product_Id,
            Product_Name: item.Product_Name,
            Product_Detail: item.Product_Detail || '',
            Product_Image: item.Product_Image || '',
            Unit: 'ชิ้น',
            Amount: item.Quantity,
            Unit_Cost: parseFloat(item.Unit_Price),
            Total: parseFloat(item.Total_Price),
          }));

          setProducts(data);

          setPurchaseDetail({
            Employee_Id: res.data.Employee_Id,
            Employee_Name: res.data.Employee_Name || '-',
            Purchase_Date: res.data.Purchase_Date,
            Supplier_Name: res.data.Supplier_Name,
            Receiver_Name: res.data.Receiver_Name || '-',
          });
        })
        .catch((err) => {
          console.error("Error fetching purchase detail:", err);
          setStatusModal({
            isOpen: true,
            message: "เกิดข้อผิดพลาดในการดึงข้อมูลรายละเอียดการสั่งซื้อ"
          });
        });
    }
  }, [isOpen, purchase]);

  console.log("Modal Rendered", { isOpen, purchase });

  if (!isOpen || !purchase) return null;

  const handleConfirm = async () => {
    if (!user || !user.Emp_Id) {
      setStatusModal({
        isOpen: true,
        message: "ไม่พบข้อมูลพนักงาน กรุณาเข้าสู่ระบบใหม่"
      });
      return;
    }

    if (!purchase || !purchase.Purchase_Id) {
      setStatusModal({
        isOpen: true,
        message: "ไม่พบข้อมูลคำสั่งซื้อ"
      });
      return;
    }

    setConfirmModal({
      isOpen: true,
      message: "คุณต้องการยืนยันการรับสินค้าหรือไม่?"
    });
  };

  const handleConfirmSubmit = async () => {
    const payload = {
      Purchase_Id: purchase.Purchase_Id,
      Employee_Id: user.Employee_Id || user.Emp_Id,
    };

    try {
      await axios.post("http://localhost:5000/api/receives", payload);
      setStatusModal({
        isOpen: true,
        message: "รับสินค้าเรียบร้อยแล้ว"
      });
      if (onReceiveSuccess) onReceiveSuccess();
      onClose();
    } catch (error) {
      console.error("รับสินค้าไม่สำเร็จ", error);
      setStatusModal({
        isOpen: true,
        message: error.response?.data?.message || "เกิดข้อผิดพลาดในการรับสินค้า"
      });
    }
  };

  console.log('user:', user);

  console.log("purchase.Purchase_Status:", purchase.Purchase_Status);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-[90%] max-w-5xl max-h-[90vh] overflow-y-auto p-6 relative">
        <h2 className="text-2xl font-bold text-center mb-4">รายละเอียดการสั่งซื้อ</h2>

        {/* ข้อมูลคำสั่งซื้อ */}
        <div className="grid grid-cols-2 gap-4 text-sm mb-6">
          <div>
            <p><span className="font-semibold">รหัสคำสั่งซื้อ:</span> {purchase.Purchase_Id}</p>
            <p><span className="font-semibold">ชื่อพนักงานที่สั่งซื้อ:</span> {purchaseDetail?.Employee_Name || "-"}</p>
            <p><span className="font-semibold">ชื่อพนักงานที่รับสินค้า:</span> {purchaseDetail?.Receiver_Name || "-"}</p>
            <p><span className="font-semibold">วันที่สั่งซื้อ:</span> {purchaseDetail?.Purchase_Date ? new Date(purchaseDetail.Purchase_Date).toLocaleString() : "-"}</p>
            <p><span className="font-semibold">คู่ค้า:</span> {purchaseDetail?.Supplier_Name || "-"}</p>
          </div>
        </div>

        {/* ตารางรายการสินค้า */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{ backgroundColor: "#0072AC" }} className="text-white">
              <tr>
                <th className="px-2 py-2 text-left">รหัสสินค้า</th>
                <th className="px-2 py-2 text-left">ชื่อสินค้า</th>
                <th className="px-2 py-2 text-left">หน่วย</th>
                <th className="px-2 py-2 text-right">จำนวน</th>
                <th className="px-2 py-2 text-right">ราคาต่อหน่วย</th>
                <th className="px-2 py-2 text-right">ราคารวม</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.Product_Id}
                  style={{
                    backgroundColor: products.indexOf(product) % 2 === 0 ? "#E3F2FD" : "#FFFFFF",
                  }}
                >
                  <td className="px-2 py-1">{product.Product_Id}</td>
                  <td className="px-2 py-1">{product.Product_Name}</td>
                  <td className="px-2 py-1">{product.Unit}</td>
                  <td className="px-2 py-1 text-right">{product.Amount}</td>
                  <td className="px-2 py-1 text-right">{product.Unit_Cost.toFixed(2)}</td>
                  <td className="px-2 py-1 text-right">{product.Total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-col items-end">
          <div className="mb-2 text-right text-sm">
            <p>จำนวนรายการ: {products.length}</p>
            <p>
              ราคารวม:{" "}
              {products.reduce((sum, p) => sum + parseFloat(p.Total || 0), 0).toFixed(2)}
            </p>
          </div>

          {/* ปุ่ม */}
          <div className="flex gap-2">
            {purchase.Purchase_Status === 'Received' ? null : (
              <button
                onClick={handleConfirm}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                ยืนยัน
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#DC3545] text-white rounded hover:bg-red-700"
            >
              ปิด
            </button>
          </div>
        </div>
      </div>

      {/* Status Modal */}
      <StatusModal
        isOpen={statusModal.isOpen}
        message={statusModal.message}
        onClose={() => setStatusModal({ isOpen: false, message: '' })}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        message={confirmModal.message}
        onConfirm={() => {
          setConfirmModal({ isOpen: false, message: '' });
          handleConfirmSubmit();
        }}
        onCancel={() => setConfirmModal({ isOpen: false, message: '' })}
      />
    </div>
  );
}

export default ReceiveProductModal;