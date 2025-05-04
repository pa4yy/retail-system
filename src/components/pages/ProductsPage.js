import React, { useState } from 'react';
import MainLayout from '../layout/MainLayout';

const mockProducts = [
  { id: 1, name: 'เลย์ ออริจินัล 14 กรัม', category: 'ขนมขบเคี้ยว', price: 5.00, cost: 4.00, stock: 10 },
  { id: 2, name: 'เลย์ ออริจินัล 29 กรัม', category: 'ขนมขบเคี้ยว', price: 10.00, cost: 8.00, stock: 9 },
  { id: 3, name: 'เลย์ ออริจินัล 57 กรัม', category: 'ขนมขบเคี้ยว', price: 20.00, cost: 17.00, stock: 8 },
  { id: 4, name: 'เลย์ ออริจินัล 80 กรัม', category: 'ขนมขบเคี้ยว', price: 30.00, cost: 29.00, stock: 7 },
  { id: 5, name: 'เลย์ ออริจินัล 150 กรัม', category: 'ขนมขบเคี้ยว', price: 45.00, cost: 40.00, stock: 6 },
  { id: 6, name: 'เลย์ สำหรับ 14 กรัม', category: 'ขนมขบเคี้ยว', price: 5.00, cost: 4.00, stock: 10 },
];

function ProductsPage({ user }) {
  const [search, setSearch] = useState('');
  const filteredProducts = mockProducts.filter(p =>
    p.name.includes(search) || p.category.includes(search)
  );

  return (
    <MainLayout user={user} title="ข้อมูลสินค้า">
      <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontWeight: 'bold', fontSize: 24 }}>ข้อมูลสินค้า</div>
          <div>
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc', marginRight: 8 }}
            />
            <button style={{ padding: '6px 16px', background: '#0074D9', color: '#fff', border: 'none', borderRadius: 4 }}>ค้นหา</button>
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
          <thead>
            <tr style={{ background: '#0074D9', color: '#fff' }}>
              <th style={{ padding: 8 }}>ลำดับ</th>
              <th style={{ padding: 8 }}>ชื่อสินค้า</th>
              <th style={{ padding: 8 }}>ประเภท</th>
              <th style={{ padding: 8 }}>ราคาขาย(บาท)</th>
              <th style={{ padding: 8 }}>ราคาซื้อ(บาท)</th>
              <th style={{ padding: 8 }}>จำนวนที่เหลือ</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((p, idx) => (
              <tr key={p.id} style={{ background: idx % 2 === 0 ? '#f4faff' : '#fff' }}>
                <td style={{ padding: 8, textAlign: 'center' }}>{idx + 1}</td>
                <td style={{ padding: 8 }}>{p.name}</td>
                <td style={{ padding: 8 }}>{p.category}</td>
                <td style={{ padding: 8, textAlign: 'right' }}>{p.price.toFixed(2)}</td>
                <td style={{ padding: 8, textAlign: 'right' }}>{p.cost.toFixed(2)}</td>
                <td style={{ padding: 8, textAlign: 'right' }}>{p.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button style={{ background: '#0074D9', color: '#fff', padding: '10px 24px', border: 'none', borderRadius: 4 }}>เพิ่มข้อมูลสินค้า</button>
          <button style={{ background: '#00A6A6', color: '#fff', padding: '10px 24px', border: 'none', borderRadius: 4 }}>แก้ไขข้อมูลสินค้า</button>
          <button style={{ background: '#E53935', color: '#fff', padding: '10px 24px', border: 'none', borderRadius: 4 }}>ลบสินค้า</button>
        </div>
      </div>
    </MainLayout>
  );
}

export default ProductsPage;
