import React, { useState, useEffect } from "react";
import MainLayout from '../../layout/MainLayout';
import ProductSelectModal from './PurchaseAddModal';
import ConfirmProductModal from './ConfrimPurchaseModal'
import ReceiptPurchaseModal from './ReceiptPurchaseModal'
import StatusModal from '../../ui/StatusModal';
import axios from "axios";
import { useAuth } from '../../../data/AuthContext';
import { useLocation } from 'react-router-dom';

function PurchasePage() {
  const { user } = useAuth();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [supplierList, setSupplierList] = useState([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    message: '',
  });

  const handleSelectProducts = (selectedProducts) => {
    setProducts(prev => {
      // สร้าง map จากสินค้าปัจจุบัน โดยใช้ productId เป็น key
      const productMap = new Map();

      prev.forEach(item => {
        productMap.set(item.productId, { ...item });
      });

      selectedProducts.forEach(p => {
        if (productMap.has(p.Product_Id)) {
          // ถ้ามีอยู่แล้วเพิ่ม quantity
          productMap.get(p.Product_Id).quantity += 1;
        } else {
          // ถ้าไม่มี เพิ่มเข้ามาใหม่
          productMap.set(p.Product_Id, {
            id: `${p.Product_Id}-${Date.now()}-${Math.random()}`,
            productId: p.Product_Id,
            image: p.Product_Image,
            name: p.Product_Name,
            quantity: 1,
            price: 0,
            sellPrice: p.Product_Price,
          });
        }
      });

      // แปลงกลับเป็น array
      return Array.from(productMap.values());
    });
  };

  const handleDelete = (id) => {
    setProducts(products.filter(product => product.id !== id));
  };

  const handleChange = (id, key, value) => {
    setProducts(products.map(product => {
      if (product.id === id) {
        if (key === 'price') {
          if (Number(value) > Number(product.sellPrice)) {
            setStatusModal({
              isOpen: true,
              message: `ราคาสั่งซื้อมากกว่าราคาขาย (${product.sellPrice} บาท) ของสินค้า "${product.name}"`,
            });
          }
        }
        return { ...product, [key]: value };
      }
      return product;
    }));
  };

  const handlePurchaseResult = (status) => {
    if (status === 'success') {
      setIsConfirmOpen(false);
      setShowReceipt(true);
    }
  };

  useEffect(() => {
    // รับข้อมูลสินค้าที่เลือกจากหน้า StockReport
    if (location.state?.selectedProducts) {
      const selectedProducts = location.state.selectedProducts.map(p => ({
        id: `${p.id}-${Date.now()}-${Math.random()}`,
        productId: p.id,
        name: p.name,
        quantity: 1,
        price: 0,
        sellPrice: p.sellPrice || 0,
      }));
      setProducts(selectedProducts);
    }
  }, [location.state]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/suppliers')
      .then(response => {
        setSupplierList(response.data);
      })
      .catch(err => {
        console.error('Error fetching suppliers:', err);
      });
  }, []);

  const totalQuantity = products.reduce((sum, p) => sum + Number(p.quantity), 0);
  const totalCost = products.reduce((sum, p) => sum + (Number(p.price) * Number(p.quantity)), 0);
  console.log('showReceipt:', showReceipt);
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
            {supplierList
              .filter(supplier => supplier.is_Active === 1)
              .map(supplier => (
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

        <div className="overflow-y-auto max-h-[580px] h-[580px] rounded-md bg-[#d9d9d9] p-3">
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
                    <input
                      type="number"
                      min="0"
                      value={product.quantity}
                      onChange={(e) => handleChange(product.id, 'quantity', e.target.value)}
                      className="w-[60px] text-center border border-gray-300 rounded"
                    />

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
                setStatusModal({ isOpen: true, message: 'กรุณาเลือกคู่ค้าก่อน' });
                return;
              }
              if (products.length === 0) {
                setStatusModal({ isOpen: true, message: 'กรุณาเพิ่มสินค้าอย่างน้อย 1 รายการก่อนยืนยัน' });
                return;
              }
              const isValid = products.every(p => Number(p.quantity) > 0 && Number(p.price) > 0);
              if (!isValid) {
                setStatusModal({ isOpen: true, message: 'กรุณากรอกจำนวนและราคาสินค้าอย่างน้อย 1 ทุกรายการ' });
                return;
              }

              setIsConfirmOpen(true);
            }}
          >
            ยืนยัน
          </button>
          <button
            className="bg-[#dc3546] text-white px-6 py-2 rounded hover:bg-[#b02a37]"
            onClick={() => {
              setProducts([]); // เคลียร์สินค้า
              setSelectedSupplierId(''); // เคลียร์คู่ค้า (ถ้าต้องการล้างตรงนี้ด้วย)
            }}
          >
            ลบรายการทั้งหมด
          </button>
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
        selectedSupplierId={selectedSupplierId}
        onResult={(resultData) => {
          console.log("✅ resultData จาก ConfirmProductModal:", resultData);
      
          if (resultData.status === 'success') {
            const total = resultData.products.reduce((sum, p) => {
              const quantity = Number(p.quantity);
              const price = Number(p.price);
              if (isNaN(quantity) || isNaN(price)) {
                console.error("❌ พบข้อมูลไม่ถูกต้องในสินค้า:", p);
              }
              return sum + quantity * price;
            }, 0);

            const supplierObj = supplierList.find(sup => String(sup.Supplier_Id) === String(resultData.supplier));
            console.log('EmployeeId:', user?.Employee_Id);
            console.log('Supplier:', supplierObj);
            console.log('Date:', new Date().toLocaleDateString('th-TH'));
      
            setReceiptData({
              products: resultData.products,
              employeeId: resultData.User.Employee_Id,
              employeeName: resultData.User.Employee_Name,
              supplier:supplierObj,
              totalCost: total,
              date: new Date().toLocaleDateString('th-TH'),
            });
      
            setShowReceipt(true);
          }
        }}

      />
      <ReceiptPurchaseModal
        isOpen={showReceipt}
        onClose={() => {
          setShowReceipt(false);      // ปิด modal ใบเสร็จ
          setProducts([]);            // ล้างรายการสินค้า
          setSelectedSupplierId('');  // ล้างบริษัทคู่ค้า
        }}
        receiptData={receiptData}
        onResult={handlePurchaseResult} 
      />

      <StatusModal
        isOpen={statusModal.isOpen}
        message={statusModal.message}
        onClose={() => setStatusModal({ isOpen: false, message: '' })}
      />
  
    </MainLayout>
    
  );
}

export default PurchasePage;