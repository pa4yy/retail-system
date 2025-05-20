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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg w-full max-w-2xl shadow-lg">
        <h2 className="text-center text-2xl font-bold mb-6">
          {mode === "edit" ? "แก้ไขข้อมูลสินค้า" : "เพิ่มข้อมูลสินค้า"}
        </h2>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left form */}
          <div className="flex-1">
            <label className="block mb-1">ชื่อสินค้า</label>
            <input
              type="text"
              value={editedProduct.Product_Name || ""}
              onChange={(e) => handleChange("Product_Name", e.target.value)}
              className="w-full p-2 mb-3 border border-gray-300 rounded"
            />

            <label className="block mb-1">ประเภทสินค้า</label>
            <select
              value={editedProduct.PType_Id || ""}
              onChange={(e) => handleChange("PType_Id", e.target.value)}
              className="w-full p-2 mb-3 border border-gray-300 rounded"
            >
              <option value="">-- เลือกประเภทสินค้า --</option>
              {productTypes.map((type) => (
                <option key={type.PType_Id} value={type.PType_Id}>
                  {type.PType_Name}
                </option>
              ))}
            </select>

            <label className="block mb-1">จำนวน (ชิ้น)</label>
            <input
              type="number"
              value={editedProduct.Product_Amount || "0"}
              onChange={(e) => handleChange("Product_Amount", e.target.value)}
              className="w-full p-2 mb-3 border border-gray-300 rounded"
            />

            <label className="block mb-1">ราคาขาย (บาท)</label>
            <input
              type="number"
              step="0.01"
              value={editedProduct.Product_Price || "0"}
              onChange={(e) => handleChange("Product_Price", e.target.value)}
              className="w-full p-2 mb-3 border border-gray-300 rounded"
            />

            <label className="block mb-1">จุดสั่งซื้อขั้นต่ำ (ชิ้น)</label>
            <input
              type="number"
              value={editedProduct.Product_Minimum || "0"}
              onChange={(e) => handleChange("Product_Minimum", e.target.value)}
              className="w-full p-2 mb-3 border border-gray-300 rounded"
            />
          </div>

          {/* Right image */}
          <div className="w-full md:w-72 flex flex-col items-center">
            <div
              className="w-72 h-72 border border-gray-300 rounded-lg bg-gray-100 flex items-center justify-center cursor-pointer mb-2"
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
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <small className="text-gray-500">คลิกเพื่อเลือกรูปภาพ</small>
          </div>
        </div>

        <div className="mt-4">
          <label className="block mb-1">รายละเอียดสินค้า</label>
          <textarea
            value={editedProduct?.Product_Detail || ""}
            onChange={(e) => handleChange("Product_Detail", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded bg-blue-50"
            rows={4}
          />
        </div>

        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={handleConfirm}
            className="bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-800"
          >
            {mode === "edit" ? "แก้ไข" : "เพิ่ม"}
          </button>
          <button
            onClick={onClose}
            className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
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
    </div>
  );
}

export default ProductModal;
