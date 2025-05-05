import React, { useState, useEffect } from "react";
import axios from "axios";
import MainLayout from "../../layout/MainLayout";
import ProductModal from "./ProductModal";
import ProductTypeModal from "./ProductTypeModal";

function ProductsPage({ user }) {
  const [products, setProducts] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editedProduct, setEditedProduct] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState("");
  const [isTypeModalOpen, setTypeModalOpen] = useState(false);

  const filteredProducts = products.filter((p) => {
    const type = productTypes.find((t) => t.PType_Id === p.PType_Id);
    return (
      p.Product_Name?.toLowerCase().includes(search.toLowerCase()) ||
      type?.PType_Name?.toLowerCase().includes(search.toLowerCase())
    );
  });

  useEffect(() => {
    //ดึงข้อมูลสินค้า
    axios
      .get("http://localhost:5000/api/products")
      .then((response) => {
        console.log("data form backend", response.data);
        setProducts(response.data);
      })
      .catch((error) =>
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า:", error)
      );

    //ดึงข้อมูลประเภทสินค้า
    axios
      .get("http://localhost:5000/api/product_types")
      .then((response) => {
        console.log("data form backend", response.data);
        setProductTypes(response.data);
      })
      .catch((error) =>
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูลประเภทสินค้า:", error)
      );
  }, []);

  const closeEditModal = () => {
    setEditModalOpen(false);
  };
  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
  };
  const closeAddModal = () => {
    setAddModalOpen(false);
  };

  const openAddModal = () => {
    setEditedProduct({
      Product_Name: "",
      Product_Detail: "",
      Product_Amount: "",
      Product_Price: "",
      Product_Minimum: "",
      PType_Id: "",
      Product_Image: "",
    });
    setAddModalOpen(true);
  };

  const handleEditSubmit = async () => {
    const formData = new FormData();
    formData.append("Product_Name", editedProduct.Product_Name);
    formData.append("Product_Detail", editedProduct.Product_Detail);
    formData.append("Product_Amount", editedProduct.Product_Amount);
    formData.append("Product_Price", editedProduct.Product_Price);
    formData.append("Product_Minimum", editedProduct.Product_Minimum);
    formData.append("PType_Id", editedProduct.PType_Id);
    if (editedProduct.Product_file) {
      formData.append("Product_Image", editedProduct.Product_file);
    }

    try {
      const res = await axios.put(
        `http://localhost:5000/api/products/${editedProduct.Product_Id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      const updated = res.data;
      setProducts((prev) =>
        prev.map((p) =>
          p.Product_Id === editedProduct.Product_Id
            ? { ...p, ...editedProduct }
            : p
        )
      );

      setEditModalOpen(false);
      setSuccessMessage("แก้ไขข้อมูลสินค้าเรียบร้อยแล้ว");
      setShowSuccessModal(true);
    } catch (err) {
      console.error("เกิดข้อผิดพลาดในการอัปเดตสินค้า: ", err);
    }
  };

  const handleAddSubmit = async () => {
    const formData = new FormData();
    formData.append("Product_Name", editedProduct.Product_Name);
    formData.append("Product_Detail", editedProduct.Product_Detail);
    formData.append("Product_Amount", editedProduct.Product_Amount);
    formData.append("Product_Price", editedProduct.Product_Price);
    formData.append("Product_Minimum", editedProduct.Product_Minimum);
    formData.append("PType_Id", editedProduct.PType_Id);
    if (editedProduct.Product_file) {
      formData.append("Product_Image", editedProduct.Product_file);
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/products",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setProducts((prev) => [...prev, res.data]);
      setAddModalOpen(false);
      setSuccessMessage("เพิ่มข้อมูลสินค้าเรียบร้อยแล้ว");
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Error adding product:", err);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(
        `http://localhost:5000/api/products/${selectedProduct.Product_Id}`
      );
      setProducts((prev) =>
        prev.filter((p) => p.Product_Id !== selectedProduct.Product_Id)
      );
      setDeleteModalOpen(false);
      setSuccessMessage("ลบข้อมูลสินค้าเรียบร้อยแล้ว");
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  return (
    <MainLayout user={user} title="ข้อมูลสินค้า">
      <div style={{ background: "#fff", padding: 24, borderRadius: 8 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <div style={{ fontWeight: "bold", fontSize: 24 }}>ข้อมูลสินค้า</div>
          <div>
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                padding: 6,
                borderRadius: 4,
                border: "1px solid #ccc",
                marginRight: 8,
              }}
            />
            <button
              style={{
                padding: "6px 16px",
                background: "#0074D9",
                color: "#fff",
                border: "none",
                borderRadius: 4,
              }}
            >
              ค้นหา
            </button>
          </div>
        </div>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: 16,
          }}
        >
          <thead>
            <tr style={{ background: "#0074D9", color: "#fff" }}>
              <th style={{ padding: 8 }}>ลำดับ</th>
              <th style={{ padding: 8 }}>ชื่อสินค้า</th>
              <th style={{ padding: 8 }}>ประเภท</th>
              <th style={{ padding: 8 }}>ราคาขาย(บาท)</th>
              <th style={{ padding: 8 }}>ราคาซื้อ(บาท)</th>
              <th style={{ padding: 8 }}>จำนวนที่เหลือ</th>
              <th style={{ padding: 8 }}>การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((p, idx) => (
              <tr
                key={p.Product_Id}
                style={{ background: idx % 2 === 0 ? "#f4faff" : "#fff" }}
              >
                <td style={{ padding: 8, textAlign: "center" }}>{idx + 1}</td>
                <td style={{ padding: 8, textAlign: "left" }}>
                  {p.Product_Name}
                </td>
                <td style={{ padding: 8, textAlign: "left" }}>
                  {
                    productTypes.find((t) => t.PType_Id === p.PType_Id)
                      ?.PType_Name
                  }
                </td>
                <td style={{ padding: 8, textAlign: "right" }}>
                  {parseFloat(p.Product_Price).toFixed(2)}
                </td>
                <td style={{ padding: 8, textAlign: "right" }}>0</td>
                <td style={{ padding: 8, textAlign: "right" }}>
                  {p.Product_Amount}
                </td>
                <td style={{ padding: 8, textAlign: "center" }}>
                  <button
                    onClick={() => {
                      setSelectedProduct(p);
                      setEditedProduct(p);
                      setEditModalOpen(true);
                    }}
                    style={{
                      marginRight: 8,
                      background: "#00A6A6",
                      color: "#fff",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: 4,
                    }}
                  >
                    แก้ไข
                  </button>

                  <button
                    onClick={() => {
                      setSelectedProduct(p);
                      setDeleteModalOpen(true);
                    }}
                    style={{
                      background: "#E53935",
                      color: "#fff",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: 4,
                    }}
                  >
                    ลบ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button
            onClick={() => setTypeModalOpen(true)}
            style={{
              background: "#28a745",
              color: "#fff",
              padding: "10px 24px",
              border: "none",
              borderRadius: 4,
            }}
          >
            ประเภทสินค้า
          </button>

          <button
            onClick={openAddModal}
            style={{
              background: "#0074D9",
              color: "#fff",
              padding: "10px 24px",
              border: "none",
              borderRadius: 4,
            }}
          >
            เพิ่มข้อมูลสินค้า
          </button>
        </div>

        {/* Modal สำหรับเพิ่ม/แก้ไขสินค้า/ลบสินค้า */}
        {isAddModalOpen && (
          <div style={modalOverlayStyle}>
            <ProductModal
              isOpen={isAddModalOpen}
              mode="add"
              selectedProduct={null}
              editedProduct={editedProduct}
              setEditedProduct={setEditedProduct}
              onClose={() => setAddModalOpen(false)}
              onSubmit={handleAddSubmit}
              productTypes={productTypes}
            />
          </div>
        )}

        {isEditModalOpen && (
          <div style={modalOverlayStyle}>
            <ProductModal
              isOpen={isEditModalOpen}
              selectedProduct={selectedProduct}
              editedProduct={editedProduct}
              setEditedProduct={setEditedProduct}
              onClose={closeEditModal}
              onSubmit={handleEditSubmit}
              productTypes={productTypes}
            />
          </div>
        )}

        {isDeleteModalOpen && (
          <div style={modalOverlayStyle}>
            <div
              style={{
                ...modalContentStyle,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                padding: "40px 20px",
              }}
            >
              <p
                style={{
                  fontSize: "18px",
                  marginBottom: "24px",
                  textAlign: "center",
                }}
              >
                คุณต้องการลบสินค้านี้ใช่หรือไม่?
              </p>
              <div
                style={{ display: "flex", justifyContent: "center", gap: 16 }}
              >
                <button
                  onClick={handleDelete}
                  style={{
                    background: "#E53935",
                    color: "#fff",
                    padding: "8px 20px",
                    border: "none",
                    borderRadius: 4,
                  }}
                >
                  ลบ
                </button>
                <button
                  onClick={closeDeleteModal}
                  style={{
                    background: "#ccc",
                    color: "#333",
                    padding: "8px 20px",
                    border: "none",
                    borderRadius: 4,
                  }}
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        )}

        {showSuccessModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.3)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1100,
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                padding: "20px 30px",
                borderRadius: "8px",
                boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontSize: "18px",
                  color: "green",
                  marginBottom: "16px",
                }}
              >
                ✔ {successMessage}
              </p>

              <button
                onClick={() => setShowSuccessModal(false)}
                style={{
                  backgroundColor: "#0074D9",
                  color: "#fff",
                  border: "none",
                  padding: "8px 20px",
                  borderRadius: "4px",
                }}
              >
                ปิด
              </button>
            </div>
          </div>
        )}

        {isTypeModalOpen && (
          <ProductTypeModal
            isOpen={isTypeModalOpen}
            onClose={() => setTypeModalOpen(false)}
            productTypes={productTypes}
            setProductTypes={setProductTypes}
          />
        )}
      </div>
    </MainLayout>
  );
}

const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalContentStyle = {
  backgroundColor: "white",
  padding: "20px",
  borderRadius: "8px",
  width: "400px",
  boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)",
};

const closeButtonStyle = {
  position: "absolute",
  top: "10px",
  right: "10px",
  background: "none",
  border: "none",
  fontSize: "20px",
  cursor: "pointer",
};

export default ProductsPage;
