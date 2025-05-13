import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './PurchaseAddModal.css';

function ProductSelectModal({ isOpen, onClose, onSelectProducts }) {
  const [products, setProducts] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState('');
  const [productTypes, setProductTypes] = useState([]);

  useEffect(() => {
    if (isOpen) {
      axios.get('http://localhost:5000/api/products') 
        .then(res => {
          const productsData = res.data;
  
          axios.get('http://localhost:5000/api/product_types')
            .then(res2 => {
              const productTypesData = res2.data;
  
              // ผูกประเภทสินค้ากับสินค้า
              const productsWithType = productsData.map(product => {
                const type = productTypesData.find(t => t.PType_Id === product.PType_Id);
                return {
                  ...product,
                  PType_Name: type ? type.PType_Name : 'ไม่ทราบประเภท'
                };
              });
  
              setProducts(productsWithType);
            })
            .catch(err => console.error(err));
  
        })
        .catch(err => console.error(err));
    }
  }, [isOpen]);
  

  const handleCheckboxChange = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleAdd = () => {
    const selectedProducts = products.filter(p => selectedIds.includes(p.Product_Id));
    onSelectProducts(selectedProducts);
    onClose();
  };

  const filteredProducts = products.filter(p =>
    p.Product_Name.toLowerCase().includes(search.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">

        <div className="modal-header">
          <h3>เลือกสินค้า</h3>
        </div>

        <div className="search-bar">
          <input
            type="text"
            placeholder="ค้นหาสินค้า..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button>ค้นหา</button>
        </div>

        <table>
          <thead>
            <tr>
              <th></th>
              <th>ลำดับ</th>
              <th>ชื่อสินค้า</th>
              <th>ประเภท</th>
              <th>จำนวน</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((p, index) => (
              <tr key={p.Product_Id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(p.Product_Id)}
                    onChange={() => handleCheckboxChange(p.Product_Id)}
                  />
                </td>
                <td>{index + 1}</td>
                <td>{p.Product_Name}</td>
                <td>{p.PType_Name}</td>
                <td>{p.Product_Amount}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="modal-footer">
          <button className="confirm-btn" onClick={handleAdd}>เพิ่ม</button>
          <button className="cancel-btn" onClick={onClose}>ยกเลิก</button>
        </div>

      </div>
    </div>
  );
}

export default ProductSelectModal;
