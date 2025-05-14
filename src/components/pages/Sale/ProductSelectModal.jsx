import React, { useEffect, useState } from "react";
import axios from "axios";

function ProductSelectModal({ isOpen, onClose, onAdd }) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  

  useEffect(() => {
    if (isOpen) {
      axios.get("http://localhost:5000/api/products").then(res => setProducts(res.data));
      setSelected([]);
      setSearch("");
    }
  }, [isOpen]);

  const filtered = products.filter(
    p =>
      p.Product_Name.toLowerCase().includes(search.toLowerCase()) ||
      (p.PType_Name && p.PType_Name.toLowerCase().includes(search.toLowerCase()))
  );

  const toggleSelect = id => {
    setSelected(sel =>
      sel.includes(id) ? sel.filter(i => i !== id) : [...sel, id]
    );
  };

  const handleAdd = () => {
    const uniqueSelected = Array.from(new Set(selected));
    const selectedProducts = uniqueSelected.map(id => products.find(p => p.Product_Id === id));
    onAdd(selectedProducts);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 w-full max-w-xl" style={{ maxHeight: 520 }}>
        <div className="flex items-center mb-4 gap-2">
          <input
            className="border rounded px-3 py-1 flex-1"
            placeholder="ค้นหา..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button className="bg-blue-700 text-white px-4 py-2 rounded">ค้นหา</button>
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: 320, minHeight: 320 }}>
          <table className="w-full border-collapse">
            <thead>
              <tr className="sticky top-0 bg-blue-700 text-white z-10">
                <th className="p-2"></th>
                <th className="p-2">ลำดับ</th>
                <th className="p-2">ชื่อสินค้า</th>
                <th className="p-2">ประเภท</th>
                <th className="p-2">ราคาสินค้า</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-gray-500">ไม่พบข้อมูลสินค้า</td>
                </tr>
              ) : (
                <>
                  {filtered.map((p, idx) => {
                    const isChecked = selected.includes(p.Product_Id);
                    return (
                      <tr
                        key={p.Product_Id}
                        className={`${idx % 2 === 0 ? "bg-gray-100" : ""} cursor-pointer ${isChecked ? "bg-blue-100" : ""}`}
                        onClick={() => toggleSelect(p.Product_Id)}
                      >
                        <td className="p-2 text-center" onClick={e => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleSelect(p.Product_Id)}
                            onClick={e => e.stopPropagation()}
                          />
                        </td>
                        <td className="p-2 text-center">{idx + 1}</td>
                        <td className="p-2">{p.Product_Name}</td>
                        <td className="p-2">{p.PType_Name || "-"}</td>
                        <td className="p-2 text-right">{parseFloat(p.Product_Price).toLocaleString()} บาท</td>
                      </tr>
                    );
                  })}
                  {Array.from({ length: Math.max(0, 10 - filtered.length) }).map((_, i) => (
                    <tr key={`empty-${i}`} className="bg-gray-100">
                      <td className="p-2">&nbsp;</td>
                      <td className="p-2"></td>
                      <td className="p-2"></td>
                      <td className="p-2"></td>
                      <td className="p-2"></td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <button
            className="bg-blue-700 text-white px-8 py-2 rounded hover:bg-blue-800"
            onClick={handleAdd}
            disabled={selected.length === 0}
          >
            เพิ่ม
          </button>
          <button
            className="bg-red-600 text-white px-8 py-2 rounded hover:bg-red-700"
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
