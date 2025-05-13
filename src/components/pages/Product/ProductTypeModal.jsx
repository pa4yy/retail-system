import React, { useState } from "react";
import axios from "axios";
import ConfirmModal from "../../ui/ConfirmModal";
import StatusModal from "../../ui/StatusModal";

function ProductTypeModal({ isOpen, onClose, productTypes, setProductTypes }) {
  const [typeName, setTypeName] = useState("");
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState("");

  const [statusModal, setStatusModal] = useState({
    open: false,
    message: "",
  });

  const [confirmModal, setConfirmModal] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  const confirmAction = (title, message, onConfirm) => {
    setConfirmModal((prev) => ({
      open: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal((prev) => ({ ...prev, open: false }));
      },
    }));
  };

  const isDuplicateName = (name, excludeId = null) => {
    return productTypes.some(
      (t) =>
        t.PType_Name.trim().toLowerCase() === name.trim().toLowerCase() &&
        t.PType_Id !== excludeId
    );
  };

  const handleAdd = () => {
    const trimmedName = typeName.trim();
    if (!trimmedName) {
      return setError("กรุณากรอกชื่อประเภทสินค้า");
    }

    if (trimmedName.length > 50) {
      return setError("ชื่อประเภทสินค้าต้องไม่เกิน 50 ตัวอักษร");
    }

    if (isDuplicateName(trimmedName)) {
      return setError("ชื่อประเภทสินค้านี้มีอยู่แล้ว");
    }

    confirmAction(
      "ยืนยันการเพิ่ม",
      `คุณต้องการเพิ่มประเภทสินค้า "${trimmedName}" ใช่หรือไม่?`,
      async () => {
        try {
          const res = await axios.post(
            "http://localhost:5000/api/product_types",
            {
              PType_Name: trimmedName,
            }
          );
          setProductTypes((prev) => [...prev, res.data]);
          setTypeName("");
          setError("");
          setStatusModal({
            open: true,
            message: "เพิ่มประเภทสินค้าเรียบร้อยแล้ว",
          });
        } catch (err) {
          console.error("เกิดข้อผิดพลาด:", err.response?.data || err.message);
          setError("เกิดข้อผิดพลาด");
        }
      }
    );
  };

  const handleEdit = async (id) => {
    const trimmedName = editName.trim();
    if (!trimmedName) {
      return setError("กรุณากรอกชื่อประเภทสินค้า");
    }

    if (trimmedName.length > 50) {
      return setError("ชื่อประเภทสินค้าต้องไม่เกิน 50 ตัวอักษร");
    }

    if (isDuplicateName(trimmedName, id)) {
      return setError("ชื่อประเภทสินค้านี้มีอยู่แล้ว");
    }

    const original = productTypes.find((t) => t.PType_Id === id);
    if (original && original.PType_Name === trimmedName) {
      setEditId(null);
      setEditName("");
      setError("");
      return;
    }

    try {
      await axios.put(`http://localhost:5000/api/product_types/${id}`, {
        PType_Name: trimmedName,
      });
      setProductTypes((prev) =>
        prev.map((t) =>
          t.PType_Id === id ? { ...t, PType_Name: trimmedName } : t
        )
      );
      setEditId(null);
      setEditName("");
      setError("");
      setStatusModal({ open: true, message: "แก้ไขประเภทสินค้าเรียบร้อยแล้ว" });
    } catch {
      setError("เกิดข้อผิดพลาด");
    }
  };

  const handleDelete = (id) => {
    confirmAction(
      "ยืนยันการลบ",
      "คุณต้องการลบประเภทสินค้านี้ใช่หรือไม่?",
      async () => {
        try {
          await axios.delete(`http://localhost:5000/api/product_types/${id}`);
          setProductTypes((prev) => prev.filter((t) => t.PType_Id !== id));
          setStatusModal({
            open: true,
            message: "ลบประเภทสินค้าเรียบร้อยแล้ว",
          });
        } catch (error) {
          if (
            error.response &&
            error.response.data &&
            error.response.data.message
          ) {
            setStatusModal({
              open: true,
              message: error.response.data.message,
            });
          } else {
            setError("เกิดข้อผิดพลาด");
          }
        }
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[1100]">
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl shadow-lg">
        <h2 className="text-xl font-bold mb-4">ประเภทสินค้า</h2>
        
        {error && <div className="text-red-500 mb-4">{error}</div>}
        
        <div className="flex gap-2 mb-4">
          <input
            placeholder="กรอกชื่อประเภทสินค้าที่ต้องการเพิ่ม"
            value={typeName}
            onChange={(e) => setTypeName(e.target.value)}
            className={`flex-1 p-2 border rounded ${
              typeName.trim() === "" && error ? "border-red-500" : "border-gray-300"
            }`}
          />
          <button
            onClick={handleAdd}
            className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
          >
            เพิ่ม
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-700 text-white">
                <th className="p-2">รหัส</th>
                <th className="p-2">ชื่อประเภท</th>
                <th className="p-2">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {productTypes.map((t, index) => (
                <tr
                  key={t.PType_Id}
                  className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                >
                  <td className="p-2 text-center">{t.PType_Id}</td>
                  <td className="p-2">
                    {editId === t.PType_Id ? (
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className={`w-full p-2 border rounded ${
                          editName.trim() === "" && error
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                    ) : (
                      t.PType_Name
                    )}
                  </td>
                  <td className="p-2 text-center">
                    {editId === t.PType_Id ? (
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(t.PType_Id)}
                          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                        >
                          บันทึก
                        </button>
                        <button
                          onClick={() => {
                            setEditId(null);
                            setEditName("");
                            setError("");
                          }}
                          className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                        >
                          ยกเลิก
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => {
                            setEditId(t.PType_Id);
                            setEditName(t.PType_Name);
                          }}
                          className="bg-cyan-600 text-white px-3 py-1 rounded hover:bg-cyan-700"
                        >
                          แก้ไข
                        </button>
                        <button
                          onClick={() => handleDelete(t.PType_Id)}
                          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                        >
                          ลบ
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
          >
            ปิด
          </button>
        </div>

        <ConfirmModal
          isOpen={confirmModal.open}
          title={confirmModal.title}
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal({ ...confirmModal, open: false })}
        />

        <StatusModal
          isOpen={statusModal.open}
          message={statusModal.message}
          onClose={() => setStatusModal({ open: false, message: "" })}
        />
      </div>
    </div>
  );
}

export default ProductTypeModal;
