import React, { useState, useEffect } from "react";
import axios from "axios";
import MainLayout from "../../layout/MainLayout";
import ProductModal from "./ProductModal";
import ProductTypeModal from "./ProductTypeModal";
import { useAuth } from '../../../data/AuthContext';

function ProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
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

  const fetchData = async () => {
    //ดึงข้อมูลสินค้า
    await axios
      .get("http://localhost:5000/api/products")
      .then((response) => {
        console.log("data form backend", response.data);
        setProducts(response.data);
      })
      .catch((error) =>
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า:", error)
      );

    //ดึงข้อมูลประเภทสินค้า
    await axios
      .get("http://localhost:5000/api/product_types")
      .then((response) => {
        console.log("data form backend", response.data);
        setProductTypes(response.data);
      })
      .catch((error) =>
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูลประเภทสินค้า:", error)
      );
  };

  useEffect(() => {
    fetchData();
  }, []);

  const closeEditModal = () => {
    setEditModalOpen(false);
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
      await axios.put(
        `http://localhost:5000/api/products/${editedProduct.Product_Id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

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
      await fetchData();
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
      await fetchData();
    } catch (err) {
      console.error("Error adding product:", err);
    }
  };
  //   try {
  //     await axios.delete(
  //       `http://localhost:5000/api/products/${selectedProduct.Product_Id}`
  //     );
  //     setProducts((prev) =>
  //       prev.filter((p) => p.Product_Id !== selectedProduct.Product_Id)
  //     );
  //     setDeleteModalOpen(false);
  //     setSuccessMessage("ลบข้อมูลสินค้าเรียบร้อยแล้ว");
  //     setShowSuccessModal(true);
  //     fetchData();
  //   } catch (err) {
  //     console.error("Error deleting product:", err);
  //   }
  // };

  return (
    <MainLayout user={user}>
      <div className="bg-white p-6 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <div className="font-bold text-2xl">ข้อมูลสินค้า</div>
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-2 rounded border border-gray-300"
          />
        </div>

        <div className="h-[700px] overflow-auto mb-4">
          <div className="bg-white rounded-lg shadow-md">
            <table className="w-full border-collapse">
              <thead className="sticky top-0">
                <tr className="bg-blue-700 text-white">
                  <th className="py-3 px-4 text-left font-semibold first:rounded-tl-lg">ลำดับ</th>
                  <th className="py-3 px-4 text-left font-semibold">ชื่อสินค้า</th>
                  <th className="py-3 px-4 text-left font-semibold">ประเภท</th>
                  <th className="py-3 px-4 text-right font-semibold">ราคาขาย(บาท)</th>
                  <th className="py-3 px-4 text-right font-semibold">ราคาซื้อ(บาท)</th>
                  <th className="py-3 px-4 text-right font-semibold">จำนวนที่เหลือ (ชิ้น)</th>
                  <th className="py-3 px-4 text-center font-semibold last:rounded-tr-lg">แก้ไขข้อมูลสินค้า</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p, idx) => (
                  <tr
                    key={p.Product_Id}
                    className={`hover:bg-gray-50 transition-colors ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } ${idx === filteredProducts.length - 1 ? 'last-row' : ''}`}
                  >
                    <td className="py-3 px-4 border-b border-gray-200 first:pl-6">{idx + 1}</td>
                    <td className="py-3 px-4 border-b border-gray-200 font-medium">{p.Product_Name}</td>
                    <td className="py-3 px-4 border-b border-gray-200">
                      {productTypes.find((t) => t.PType_Id === p.PType_Id)?.PType_Name}
                    </td>
                    <td className="py-3 px-4 border-b border-gray-200 text-right">
                      {parseFloat(p.Product_Price).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 border-b border-gray-200 text-right">0</td>
                    <td className="py-3 px-4 border-b border-gray-200 text-right">
                      {parseInt(p.Product_Amount).toLocaleString('th-TH')}
                    </td>
                    <td className="py-3 px-4 border-b border-gray-200 text-center last:pr-6">
                      <button
                        onClick={() => {
                          setSelectedProduct(p);
                          setEditedProduct(p);
                          setEditModalOpen(true);
                        }}
                        className="bg-cyan-600 text-white px-4 py-1.5 rounded-md hover:bg-cyan-700 transition-colors"
                      >
                        แก้ไข
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={() => setTypeModalOpen(true)}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            ประเภทสินค้า
          </button>
          <button
            onClick={openAddModal}
            className="bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-800"
          >
            เพิ่มข้อมูลสินค้า
          </button>
        </div>

        {/* Modals */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <ProductModal
              isOpen={isEditModalOpen}
              mode="edit"
              selectedProduct={selectedProduct}
              editedProduct={editedProduct}
              setEditedProduct={setEditedProduct}
              onClose={closeEditModal}
              onSubmit={handleEditSubmit}
              productTypes={productTypes}
            />
          </div>
        )}

        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[1100]">
            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
              <p className="text-lg text-green-600 mb-4">✔ {successMessage}</p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="bg-blue-700 text-white px-5 py-2 rounded hover:bg-blue-800"
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

        {/* <style jsx>{`
          .last-row td:first-child {
            border-bottom-left-radius: 0.5rem;
          }
          .last-row td:last-child {
            border-bottom-right-radius: 0.5rem;
          }
        `}</style> */}
      </div>
    </MainLayout>
  );
}

export default ProductsPage;
