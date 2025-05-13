import React, { useEffect, useState } from "react";
import MainLayout from '../../layout/MainLayout';
import ProductSelectModal from './PurchaseAddModal';
import './Purchase.css';


function PurchasePage({ user }) {

  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState(1); // สำหรับกำหนด id สินค้าแต่ละตัว
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelectProducts = (selectedProducts) => {
    const newProducts = selectedProducts.map(p => ({
      id: productId,
      image: p.Product_Image,
      name: p.Product_Name,
      quantity: 1,
      price: p.Product_Price
    }));
    setProducts([...products, ...newProducts]);
    setProductId(productId + selectedProducts.length);
  };

  const handleDelete = (id) => {
    setProducts(products.filter(product => product.id !== id));
  };

  const handleChange = (id, key, value) => {
    setProducts(products.map(product =>
      product.id === id ? { ...product, [key]: value } : product
    ));
  };

  const totalQuantity = products.reduce((sum, p) => sum + Number(p.quantity), 0);
  const totalCost = products.reduce((sum, p) => sum + (Number(p.price) * Number(p.quantity)), 0);

  return (
    <MainLayout user={user} title="สั่งซื้อสินค้า">
      <div className="purchase-container">
        <h2>สั่งซื้อสินค้า</h2>

        <div className="top-bar">
          <label>บริษัทผู้ขาย</label>
          <select>
            <option value="LnwZa007">LnwZa007</option>
          </select>
          <button className="add-btn" onClick={() => setIsModalOpen(true)}>เพิ่มสินค้า</button>
        </div>

        <table>
          <thead>
            <tr>
              <th>รูปภาพสินค้า</th>
              <th>ชื่อสินค้า</th>
              <th>จำนวนสินค้า</th>
              <th>ราคาสั่งซื้อ</th>
              <th>ลบสินค้า</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>
                  {product.image && <img src={product.image} alt={product.name} style={{ width: '50px', height: '50px' }} />}
                </td>
                <td>{product.name}</td>
                <td>
                  <input
                    type="number"
                    min="1"
                    value={product.quantity}
                    onChange={e => handleChange(product.id, 'quantity', e.target.value)}
                    style={{ width: '60px' }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={product.price}
                    onChange={e => handleChange(product.id, 'price', e.target.value)}
                    style={{ width: '80px' }}
                  /> บาท
                </td>
                <td>
                  <button className="delete-btn" onClick={() => handleDelete(product.id)}>ลบ</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="summary">
          <p>สินค้าทั้งหมด {totalQuantity} รายการ</p>
          <p>ราคาต้นทุนรวม {totalCost.toFixed(2)} บาท</p>
        </div>

        <div className="footer-buttons">
          <button className="confirm-btn">ยืนยัน</button>
          <button className="cancel-btn">ยกเลิก</button>
        </div>
      </div>

      <ProductSelectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectProducts={handleSelectProducts}
      />
    </MainLayout>

  );
}

export default PurchasePage; 