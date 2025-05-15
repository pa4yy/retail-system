import React, { useEffect, useState } from 'react';
import axios from 'axios';

function ProductSelectModal({ isOpen, onClose, onSelectProducts }) {
  const [products, setProducts] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (isOpen) {
      axios.get('http://localhost:5000/api/products')
        .then(res => {
          const productsData = res.data;

          axios.get('http://localhost:5000/api/product_types')
            .then(res2 => {
              const productTypesData = res2.data;

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
    setSelectedIds([])
    onClose();
  };

  const filteredProducts = products.filter(p =>
    p.Product_Name.toLowerCase().includes(search.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white w-full max-w-4xl rounded-lg shadow-lg p-6 overflow-auto max-h-[90vh]">

        <div className="mb-4 border-b pb-2">
          <h3 className="text-xl font-semibold text-gray-800">เลือกสินค้า</h3>
        </div>

        <div className="mb-4 flex items-center space-x-2">
          <input
            type="text"
            placeholder="ค้นหาสินค้า..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0073ac]"
          />
          <button className="bg-[#0073ac] text-white px-4 py-2 rounded hover:brightness-110">ค้นหา</button>
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: 320, minHeight: 320 }}>
          <table className="min-w-full border border-gray-300">
            <thead className="bg-[#0073ac] text-white">
              <tr>
                <th className="p-2"></th>
                <th className="p-2 text-left">ลำดับ</th>
                <th className="p-2 text-left">ชื่อสินค้า</th>
                <th className="p-2 text-left">ประเภท</th>
                <th className="p-2 text-left">จำนวน</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p, index) => {
                const isChecked = selectedIds.includes(p.Product_Id); // <-- ตรวจสอบว่าเลือกอยู่ไหม
                return (
                  <tr
                    key={p.Product_Id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-[#e4f2fd]'}
                      hover:bg-gray-100 cursor-pointer ${isChecked ? 'bg-blue-100' : ''}`}
                    onClick={() => handleCheckboxChange(p.Product_Id)} // <-- คลิกที่แถวเพื่อเลือก
                  >
                    <td className="p-2" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleCheckboxChange(p.Product_Id)} // <-- เช็ค/ยกเลิกเช็ค
                      />
                    </td>
                    <td className="p-2">{index + 1}</td>
                    <td className="p-2">{p.Product_Name}</td>
                    <td className="p-2">{p.PType_Name}</td>
                    <td className="p-2">{p.Product_Amount}</td>
                  </tr>
                );
              })}
            </tbody>

          </table>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            className="bg-[#0073ac] text-white px-4 py-2 rounded hover:brightness-110"
            onClick={handleAdd}
          >
            เพิ่ม
          </button>
          <button
            className="bg-[#dc3546] text-white px-4 py-2 rounded hover:brightness-110"
            onClick={onClose}
          >
            ยกเลิก
          </button>
        </div>

      </div>
    </div>
  );
}

export default ProductSelectModal;