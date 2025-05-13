import React, { useRef, useEffect, useState } from "react";
import ConfirmModal from "../../ui/ConfirmModal";
import StatusModal from "../../ui/StatusModal";

function ProductModal({
  isOpen,
  mode = "edit",
  selectedProduct,
  editedProduct,
  setEditedProduct,
  onClose,
  onSubmit,
  productTypes,
}) {
  const [statusOpen, setStatusOpen] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => {
    if (isOpen) {
      if (selectedProduct) {
        setEditedProduct({
          ...selectedProduct,
          Product_Minimum: selectedProduct.Product_Minimum || 0,
          Product_Image: selectedProduct.Product_Image || "",
        });
      } else if (mode === "add") {
        setEditedProduct({
          Product_Name: "",
          Product_Detail: "",
          Product_Amount: 0,
          Product_Price: 0,
          Product_Minimum: 0,
          PType_Id: "",
          Product_Image: "",
        });
      }
    }
  }, [isOpen, selectedProduct, setEditedProduct, mode]);

  const validate = () => {
    if (
      !editedProduct.Product_Name ||
      editedProduct.Product_Name.trim() === ""
    ) {
      setStatusMsg("กรุณากรอกชื่อสินค้า");
      setStatusOpen(true);
      return false;
    }
    if (!editedProduct.PType_Id || editedProduct.PType_Id === "") {
      setStatusMsg("กรุณาเลือกประเภทสินค้า");
      setStatusOpen(true);
      return false;
    }
    if (Number(editedProduct.Product_Amount) < 0) {
      setStatusMsg("จำนวนสินค้าห้ามน้อยกว่า 0");
      setStatusOpen(true);
      return false;
    }
    if (Number(editedProduct.Product_Price) < 0) {
      setStatusMsg("ราคาสินค้าห้ามน้อยกว่า 0");
      setStatusOpen(true);
      return false;
    }
    if (Number(editedProduct.Product_Minimum) < 0) {
      setStatusMsg("จุดสั่งซื้อขั้นต่ำห้ามน้อยกว่า 0");
      setStatusOpen(true);
      return false;
    }
    if (
      !editedProduct.Product_Detail ||
      editedProduct.Product_Detail.trim() === ""
    ) {
      setStatusMsg("กรุณากรอกรายละเอียดสินค้า");
      setStatusOpen(true);
      return false;
    }
    return true;
  };

  const handleConfirm = () => {
    if (validate()) {
      setConfirmOpen(true);
    }
  };

  const handleChange = (field, value) => {
    if (editedProduct) {
      setEditedProduct((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setEditedProduct((prev) => ({
        ...prev,
        Product_Image: imageUrl,
        Product_file: file,
      }));
    }
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit();
    setStatusMsg(
      mode === "edit" ? "แก้ไขสินค้าเสร็จสิ้น" : "เพิ่มสินค้าสำเร็จ"
    );
    setStatusOpen(true);
    setConfirmOpen(false);
    onClose();
  };

  return (
    <div style={modalContentStyle}>
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>
        {mode === "edit" ? "แก้ไขข้อมูลสินค้า" : "เพิ่มข้อมูลสินค้า"}
      </h2>
      <div style={{ display: "flex", gap: 20 }}>
        {/* Left form */}
        <div style={{ flex: 1 }}>
          <label>ชื่อสินค้า</label>
          <input
            type="text"
            value={editedProduct.Product_Name || ""}
            onChange={(e) => handleChange("Product_Name", e.target.value)}
            style={inputStyle}
          />

          <label>ประเภทสินค้า</label>
          <select
            value={editedProduct.PType_Id || ""}
            onChange={(e) => handleChange("PType_Id", e.target.value)}
            style={inputStyle}
          >
            <option value="">-- เลือกประเภทสินค้า --</option>
            {productTypes.map((type) => (
              <option key={type.PType_Id} value={type.PType_Id}>
                {type.PType_Name}
              </option>
            ))}
          </select>

          <label>จำนวน</label>
          <input
            type="number"
            value={editedProduct.Product_Amount || "0"}
            onChange={(e) => handleChange("Product_Amount", e.target.value)}
            style={inputStyle}
          />

          <label>ราคา</label>
          <input
            type="number"
            step="0.01"
            value={editedProduct.Product_Price || "0"}
            onChange={(e) => handleChange("Product_Price", e.target.value)}
            style={inputStyle}
          />

          <label>จุดสั่งซื้อขั้นต่ำ</label>
          <input
            type="number"
            value={editedProduct.Product_Minimum || "0"}
            onChange={(e) => handleChange("Product_Minimum", e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Right image */}
        <div style={{ width: 300, textAlign: "center" }}>
          <div
            style={{
              width: 300,
              height: 300,
              border: "1px solid #ccc",
              borderRadius: 8,
              padding: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f0f0f0",
              cursor: "pointer",
            }}
            onClick={handleImageClick}
          >
            <img
              src={(() => {
                const img = editedProduct.Product_Image;
                if (img?.startsWith("blob:")) {
                  return img;
                } else if (img) {
                  const p = img.startsWith("/uploads/")
                    ? img
                    : `/uploads/${img.replace(/^\\+|\\+$/g, "")}`;
                  return `http://localhost:5000${p}`;
                } else {
                  return "/noimage.jpg";
                }
              })()}
              alt="Product"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/noimage.jpg";
              }}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: 8,
              }}
            />
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: "none" }}
          />
          <small>คลิกเพื่อเลือกรูปภาพ</small>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <label>รายละเอียดสินค้า</label>
        <textarea
          value={editedProduct?.Product_Detail || ""}
          onChange={(e) => handleChange("Product_Detail", e.target.value)}
          style={{ ...inputStyle, height: 80, backgroundColor: "#eaf5ff" }}
        />
      </div>

      {/* Buttons */}
      <div
        style={{
          marginTop: 20,
          display: "flex",
          justifyContent: "center",
          gap: 20,
        }}
      >
        <button
          onClick={handleConfirm}
          style={{
            backgroundColor: "#0074D9",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: 4,
          }}
        >
          {mode === "edit" ? "แก้ไข" : "เพิ่ม"}
        </button>
        <button
          onClick={onClose}
          style={{
            backgroundColor: "#E53935",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: 4,
          }}
        >
          ยกเลิก
        </button>
      </div>

      <ConfirmModal
        isOpen={confirmOpen}
        title="ยืนยันการดำเนินการ"
        message={
          mode === "edit"
            ? "คุณต้องการแก้ไขข้อมูลสินค้านี้ใช่หรือไม่?"
            : "คุณต้องการเพิ่มสินค้านี้ใช่หรือไม่?"
        }
        onConfirm={handleSubmit}
        onCancel={() => setConfirmOpen(false)}
      />

      <StatusModal
        isOpen={statusOpen}
        message={statusMsg}
        onClose={() => setStatusOpen(false)}
      />
    </div>
  );
}

const modalContentStyle = {
  backgroundColor: "white",
  padding: 24,
  borderRadius: 8,
  width: "800px",
  maxWidth: "95%",
  border: "1px solid #333",
  boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
};

const inputStyle = {
  width: "100%",
  padding: "8px",
  marginBottom: "10px",
  borderRadius: "4px",
  border: "1px solid #ccc",
  fontSize: "14px",
};

export default ProductModal;
