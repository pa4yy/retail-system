import React, { useState, useEffect } from "react";
import MainLayout from '../../layout/MainLayout';
import ProductSelectModal from './PurchaseAddModal';
import ConfirmProductModal from './ConfrimPurchaseModal'
import axios from "axios";

function PurchasePage({ user }) {
  const [products, setProducts] = useState([]);
  // const [productId, setProductId] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [supplierList, setSupplierList] = useState([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);


  const handleSelectProducts = (selectedProducts) => {
    const newProducts = selectedProducts.map(p => ({
      id: `${p.Product_Id}-${Date.now()}-${Math.random()}`,
      productId: p.Product_Id,
      image: p.Product_Image,
      name: p.Product_Name,
      quantity: 1,
      price: p.Product_Price
    }));
    setProducts(prev => [...prev, ...newProducts]);
  };

  const handleDelete = (id) => {
    setProducts(products.filter(product => product.id !== id));
  };

  const handleChange = (id, key, value) => {
    setProducts(products.map(product =>
      product.id === id ? { ...product, [key]: value } : product
    ));
  };

  useEffect(() => {
    axios.get('http://localhost:5000/api/suppliers')
      .then(response => {
        setSupplierList(response.data);
      })
      .catch(err => {
        console.error('Error fetching suppliers:', err);
      });
  }, []);

  // useEffect(() => {
  //   console.log("USER:", user);
  // }, []);

 



  const totalQuantity = products.reduce((sum, p) => sum + Number(p.quantity), 0);
  const totalCost = products.reduce((sum, p) => sum + (Number(p.price) * Number(p.quantity)), 0);

  return (
    <MainLayout user={user} title="สั่งซื้อสินค้า">
      <div className="h-full min-h-0 overflow-hidden p-8 bg-white box-border flex flex-col">

        <h2 className="text-xl font-semibold mb-5">สั่งซื้อสินค้า</h2>

        <div className="flex items-center justify-end gap-2 mb-5">
          <label className="font-medium">เลือกบริษัทคู่ค้า</label>
          <select
            value={selectedSupplierId}
            onChange={(e) => setSelectedSupplierId(e.target.value)}
            className="border px-2 py-1 rounded"
          >
            <option value="">-- กรุณาเลือกคู่ค้า --</option>
            {supplierList.map(supplier => (
              <option key={supplier.Supplier_Id} value={supplier.Supplier_Id}>
                {supplier.Supplier_Name}
              </option>
            ))}
          </select>
          <button
            className="bg-[#0073ac] text-white px-4 py-1.5 rounded hover:bg-[#005f8f]"
            onClick={() => setIsModalOpen(true)}
          >
            เพิ่มสินค้า
          </button>
        </div>

        <div className="overflow-y-auto max-h-[600px] h-[600px] rounded-md bg-[#d9d9d9] p-3">
          <table className="w-full border-separate border-spacing-y-2">
            <thead className="bg-[#d9d9d9] h-[50px] sticky top-0 z-10">
              <tr>
                <th className="py-2 px-4 text-center">รูปภาพสินค้า</th>
                <th className="py-2 px-4 text-center">ชื่อสินค้า</th>
                <th className="py-2 px-4 text-center">จำนวนสินค้า</th>
                <th className="py-2 px-4 text-center">ราคาสั่งซื้อ</th>
                <th className="py-2 px-4 text-center">ลบสินค้า</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id} className="bg-[#f0f0f0]">
                  <td className="py-2 px-4 text-center">
                    {product.image && <img src={product.image} alt={product.name} className="w-[50px] h-[50px]" />}
                  </td>
                  <td className="py-2 px-4 text-center">{product.name}</td>
                  <td className="py-2 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        className="px-2 py-1 bg-gray-300 rounded hover:bg-gray-400"
                        onClick={() =>
                          handleChange(product.id, 'quantity', Math.max(1, Number(product.quantity) - 1))
                        }
                      >
                        –
                      </button>
                      <span className="w-6 text-center">{product.quantity}</span>
                      <button
                        className="px-2 py-1 bg-gray-300 rounded hover:bg-gray-400"
                        onClick={() =>
                          handleChange(product.id, 'quantity', Number(product.quantity) + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="py-2 px-4 text-center">
                    <input
                      type="number"
                      min="0"
                      value={product.price}
                      onChange={e => handleChange(product.id, 'price', e.target.value)}
                      className="w-[80px] text-center border border-gray-300 rounded"
                    /> บาท
                  </td>
                  <td className="py-2 px-4 text-center">
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>

        <div className="text-right mt-3">
          <p>สินค้าทั้งหมด {totalQuantity} รายการ</p>
          <p>ราคาต้นทุนรวม {totalCost.toFixed(2)} บาท</p>
        </div>

        <div className="flex justify-end gap-3 mt-5">
          <button
            className="bg-[#0073ac] text-white px-6 py-2 rounded hover:bg-[#005f8f]"
            onClick={() => {
              if (!selectedSupplierId) {
                alert("กรุณาเลือกคู่ค้าก่อน");
                return;
              }
              setIsConfirmOpen(true);
            }}
          >
            ยืนยัน
          </button>
          <button className="bg-[#dc3546] text-white px-6 py-2 rounded hover:bg-[#b02a37]">ยกเลิก</button>
        </div>
      </div>

      <ProductSelectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectProducts={handleSelectProducts}
      />


      <ConfirmProductModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onSelectProducts={handleSelectProducts}
        products={products}
        user={user} 
      />


    </MainLayout>


  );
}

export default PurchasePage;