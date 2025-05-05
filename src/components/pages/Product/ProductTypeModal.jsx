import React, { useState } from "react";
import axios from "axios";
import ConfirmModal from "./ConfirmModal";
import StatusModal from "./StatusModal";

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

  const validateName = (name) => {
    if (!name.trim()) {
      setError("กรุณากรอกชื่อประเภทสินค้า");
      return false;
    }
    return true;
  };

  return isOpen ? (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <h2 style={{ marginBottom: 16 }}>ประเภทสินค้า</h2>
        {error && <div style={errorStyle}>{error}</div>}
        <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
          <input
            placeholder="กรอกชื่อประเภทสินค้าที่ต้องการเพิ่ม"
            value={typeName}
            onChange={(e) => setTypeName(e.target.value)}
            style={{
              ...inputStyle(typeName.trim() === "" && error),
              width: "250px",
            }}
          />
          <button style={addButton} onClick={handleAdd}>
            เพิ่ม
          </button>
        </div>

        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>รหัส</th>
              <th style={thStyle}>ชื่อประเภท</th>
              <th style={thStyle}>การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {productTypes.map((t, index) => (
              <tr key={t.PType_Id} style={rowStyle(index)}>
                <td style={{ ...tdStyle, textAlign: "center" }}>
                  {t.PType_Id}
                </td>
                <td style={{ ...tdStyle, width: "250px" }}>
                  {editId === t.PType_Id ? (
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      style={{
                        ...inputStyle(editName.trim() === "" && error),
                        width: "100%",
                      }}
                    />
                  ) : (
                    t.PType_Name
                  )}
                </td>
                <td style={{ ...tdStyle, textAlign: "center" }}>
                  {editId === t.PType_Id ? (
                    <>
                      <button
                        style={saveButton}
                        onClick={() => {
                          if (editName === t.PType_Name) {
                            handleEdit(t.PType_Id);
                          } else {
                            confirmAction(
                              "ยืนยันการบันทึก",
                              `คุณต้องการเปลี่ยนชื่อประเภทสินค้า "${t.PType_Name}" เป็น "${editName}" หรือไม่?`,
                              () => handleEdit(t.PType_Id)
                            );
                          }
                        }}
                      >
                        บันทึก
                      </button>

                      <button
                        style={cancelButton}
                        onClick={() => {
                          setEditId(null);
                          setEditName("");
                          setError("");
                        }}
                      >
                        ยกเลิก
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        style={editButton}
                        onClick={() => {
                          setEditId(t.PType_Id);
                          setEditName(t.PType_Name);
                        }}
                      >
                        แก้ไข
                      </button>
                      <button
                        style={deleteButton}
                        onClick={() => handleDelete(t.PType_Id)}
                      >
                        ลบ
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={closeButton}>
            ปิด
          </button>
        </div>
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
  ) : null;
}

// 🎨 Styles
const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.3)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1100,
};

const modalContentStyle = {
  background: "#fff",
  padding: 24,
  borderRadius: 12,
  width: "90%",
  maxWidth: "700px",
  boxShadow: "0 0 10px rgba(0,0,0,0.2)",
  overflowX: "auto",
  position: "relative",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: 20,
  tableLayout: "fixed",
};

const thStyle = {
  backgroundColor: "#007bff",
  color: "#fff",
  padding: "12px 10px",
};

const tdStyle = {
  padding: "10px",
};

const rowStyle = (index) => ({
  backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#ffffff",
});

const inputStyle = (hasError) => ({
  padding: "6px 10px",
  border: `1px solid ${hasError ? "red" : "#ccc"}`,
  borderRadius: 6,
  outline: "none",
  width: "100%",
});

const errorStyle = {
  color: "red",
  marginTop: 10,
};

const baseButton = {
  padding: "6px 12px",
  marginRight: 6,
  border: "none",
  borderRadius: 4,
  fontWeight: "bold",
  cursor: "pointer",
};

const addButton = {
  ...baseButton,
  backgroundColor: "#007bff",
  color: "#fff",
};

const saveButton = {
  ...baseButton,
  backgroundColor: "#2196F3",
  color: "white",
};

const cancelButton = {
  ...baseButton,
  backgroundColor: "#9E9E9E",
  color: "white",
};

const editButton = {
  ...baseButton,
  backgroundColor: "#17a2b8",
  color: "#fff",
};

const deleteButton = {
  ...baseButton,
  backgroundColor: "#dc3545",
  color: "#fff",
};

const closeButton = {
  ...baseButton,
  backgroundColor: "#555",
  color: "white",
  marginTop: 20,
};

const thTdStyle = {
  padding: 10,
  border: "1px solid #ccc",
};

export default ProductTypeModal;
