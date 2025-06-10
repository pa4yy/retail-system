import React, { useEffect, useState } from 'react';
import MainLayout from '../layout/MainLayout';
import axios from 'axios';
import { useAuth } from '../../data/AuthContext';
import { useNavigate } from 'react-router-dom';

function StockReport() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [showCritical, setShowCritical] = useState(false);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [types, setTypes] = useState([]);
  const [checked, setChecked] = useState({});
  const [pendingProductIds, setPendingProductIds] = useState([]);

  // ดึงข้อมูลสินค้า
  useEffect(() => {
    axios.get('http://localhost:5000/api/products').then(res => {
      const mapped = res.data.map(p => ({
        id: p.Product_Id,
        name: p.Product_Name,
        type: p.PType_Name,
        min: p.Product_Minimum,
        stock: p.Product_Amount,
        Product_Price: p.Product_Price,
        Product_Image: p.Product_Image || '/noimage.jpg',
      }));
      setProducts(mapped);
      setTypes([...new Set(mapped.map(p => p.type))]);
    });

    // ดึงข้อมูลสินค้าที่ pending purchase
    axios.get('http://localhost:5000/api/pending-purchase-products').then(res => {
      setPendingProductIds(res.data);
    });
  }, []);

  // ฟังก์ชันเช็คสถานะสินค้า
  const getProductStatus = (product) => {
    if (product.stock > product.min) return 'ยังไม่ถึงจุดสั่งซื้อ';
    if (pendingProductIds.includes(product.id)) return 'สั่งซื้อแล้ว';
    return 'ถึงจุดสั่งซื้อ';
  };

  // ฟิลเตอร์และเรียงลำดับ
  const filteredProducts = products
    .filter(p => (type ? p.type === type : true))
    .filter(p => p.name.includes(search))
    .filter(p => !showCritical || p.stock <= p.min)
    .sort((a, b) => (a.stock - a.min) - (b.stock - b.min));

  // handle checkbox
  const handleCheck = (id) => {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // handle purchase
  const handlePurchase = () => {
    const selectedProducts = products.filter(p => checked[p.id]);
    if (selectedProducts.length === 0) {
      alert('กรุณาเลือกสินค้าที่ต้องการสั่งซื้อ');
      return;
    }
    const productsWithPrice = selectedProducts.map(p => ({
      ...p,
      sellPrice: p.Product_Price || 0,
      image: p.image || '/noimage.jpg' || '',
    }));
    navigate('/purchase', { state: { selectedProducts: productsWithPrice } });
  };

  return (
    <MainLayout user={user} title="สินค้าคงเหลือ">
      <div style={{ padding: 24, background: '#fff', borderRadius: 4, height: 'calc(100vh - 100px)' }}>
        <h1 style={{ fontWeight: 'bold', fontSize: 32, marginBottom: 0 }}>สินค้าคงเหลือ</h1>
        <div style={{ fontSize: 20, fontWeight: 'bold', margin: '12px 0 8px 0' }}>ข้อมูลสินค้า</div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ marginRight: 8, fontSize: 18 }}>ประเภท</span>
          <select value={type} onChange={e => setType(e.target.value)} style={{ marginRight: 24, fontSize: 16, padding: 4 }}>
            <option value="">ทั้งหมด</option>
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <label style={{ marginRight: 24, fontSize: 18 }}>
            <input
              type="checkbox"
              checked={showCritical}
              onChange={e => setShowCritical(e.target.checked)}
              style={{ marginRight: 8 }}
            />
            สินค้าที่ถึงจุดสั่งซื้อ
          </label>
          <div style={{ display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
            <input
              type="text"
              placeholder=""
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                fontSize: 16,
                padding: '4px 12px',
                border: '1px solid #aaa',
                borderRadius: 4,
                width: 200,
                marginRight: 8
              }}
            />
            <button style={{
              background: '#009fe3',
              color: '#fff',
              fontSize: 18,
              padding: '4px 24px',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer'
            }}>ค้นหา</button>
          </div>
        </div>
        <div style={{
          borderRadius: 4,
          overflow: 'hidden',
          background: '#f7f7f7',
          height: 'calc(100vh - 280px)',
          overflowY: "auto" 
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 16 }}>
            <thead className='sticky top-0' style={{ background: '#0072AC', color: '#fff' }}>
              <tr>
                <th style={{ padding: 8, width: 50 }}></th>
                <th style={{ padding: 8, width: 60 }}>ลำดับ</th>
                <th style={{ padding: 8 }}>ชื่อสินค้า</th>
                <th style={{ padding: 8 }}>ประเภท</th>
                <th style={{ padding: 8 }}>จำนวนขั้นต่ำ</th>
                <th style={{ padding: 8 }}>สินค้าคงเหลือ</th>
                <th style={{ padding: 8 }}>สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p, idx) => {
                const status = getProductStatus(p);
                // ไฮไลต์แถวสีแดงถ้า "ถึงจุดสั่งซื้อ" และยังไม่ได้สั่งซื้อ
                const highlight = status === 'ถึงจุดสั่งซื้อ';
                return (
                  <tr
                    key={p.id}
                    className={`hover:bg-gray-50 transition-colors ${highlight ? 'bg-red-100' : (idx % 2 === 0 ? 'bg-white' : 'bg-gray-50')}`}
                  >
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={!!checked[p.id]}
                        onChange={() => handleCheck(p.id)}
                        disabled={status === 'สั่งซื้อแล้ว'} // ไม่ให้เลือกถ้าสั่งซื้อแล้ว
                      />
                    </td>
                    <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                    <td>{p.name}</td>
                    <td>{p.type}</td>
                    <td style={{ textAlign: 'center' }}>{p.min}</td>
                    <td style={{ textAlign: 'center' }}>{p.stock}</td>
                    <td style={{ textAlign: 'center' }}>{status}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ textAlign: 'right', marginTop: 16 }}>
          <button 
            onClick={handlePurchase}
            style={{
              background: '#009fe3',
              color: '#fff',
              fontSize: 18,
              padding: '8px 32px',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer'
            }}>สั่งซื้อสินค้า</button>
        </div>
      </div>
    </MainLayout>
  );
}

export default StockReport;