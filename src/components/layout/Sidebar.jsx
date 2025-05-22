import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../data/AuthContext';
import axios from 'axios';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [criticalStockCount, setCriticalStockCount] = useState(0);

  // ฟังก์ชันสำหรับดึงข้อมูลจำนวนสินค้าที่ถึงจุดสั่งซื้อ
  const fetchCriticalStock = async () => {
    try {
      // ดึงข้อมูลสินค้าทั้งหมด
      const productsRes = await axios.get('http://localhost:5000/api/products');
      const products = productsRes.data;
      
      // ดึงข้อมูลสินค้าที่สั่งซื้อแล้ว
      const pendingRes = await axios.get('http://localhost:5000/api/pending-purchase-products');
      const pendingIds = pendingRes.data;

      // นับจำนวนสินค้าที่ถึงจุดสั่งซื้อและยังไม่ได้สั่งซื้อ
      const count = products.filter(p => 
        p.Product_Amount <= p.Product_Minimum && 
        !pendingIds.includes(p.Product_Id)
      ).length;

      setCriticalStockCount(count);
    } catch (error) {
      console.error('Error fetching critical stock:', error);
    }
  };

  // ดึงข้อมูลครั้งแรกและตั้ง interval
  useEffect(() => {
    fetchCriticalStock();
    const interval = setInterval(fetchCriticalStock, 60000);
    return () => clearInterval(interval);
  }, []);

  // เพิ่ม event listener สำหรับการขายและสั่งซื้อสินค้า
  useEffect(() => {
    const handleSale = () => {
      fetchCriticalStock();
    };

    const handlePurchase = () => {
      fetchCriticalStock();
    };

    // เพิ่ม event listener
    window.addEventListener('sale-completed', handleSale);
    window.addEventListener('purchase-completed', handlePurchase);

    // ลบ event listener เมื่อ component unmount
    return () => {
      window.removeEventListener('sale-completed', handleSale);
      window.removeEventListener('purchase-completed', handlePurchase);
    };
  }, []);

  // เมนูสำหรับ Manager
  const managerMenuGroups = [
    {
      group: 'รายงาน',
      items: [
        { path: '/sales-report', label: 'รายงานการขาย' },
        { 
          path: '/stock-report', 
          label: 'สินค้าคงเหลือ',
          badge: criticalStockCount > 0 ? criticalStockCount : null 
        },
        { path: '/purchase-report', label: 'การสั่งซื้อสินค้า' },
        { path: '/sales-history', label: 'ประวัติการขาย' }
      ]
    },
    {
      group: 'ข้อมูลพื้นฐาน',
      items: [
        { path: '/products', label: 'สินค้า' },
        { path: '/employees', label: 'พนักงาน' },
        { path: '/suppliers', label: 'Supplier' }
      ]
    }
  ];

  // เมนูหลักที่ไม่อยู่ในกลุ่ม (Manager)
  const managerMainLinks = [
    { path: '/sale', label: 'ขายสินค้า' },
    { path: '/purchase', label: 'สั่งซื้อสินค้า' }
  ];

  // เมนูสำหรับ Employee
  const employeeMenuGroups = [
    {
      group: 'รายงาน',
      items: [
        { path: '/sales-report', label: 'รายงานการขาย' },
        { path: '/stock-report', label: 'สินค้าคงเหลือ' },
        { path: '/purchase-report', label: 'การสั่งซื้อสินค้า' },
        { path: '/sales-history', label: 'ประวัติการขาย' }
      ]
    }
  ];

  // เมนูหลักที่ไม่อยู่ในกลุ่ม (Employee)
  const employeeMainLinks = [
    { path: '/sale', label: 'ขายสินค้า' },
    { path: '/products', label: 'ข้อมูลสินค้า' },
    { path: '/purchase', label: 'สั่งซื้อสินค้า' }
  ];

  // เลือกเมนูตาม role
  const menuGroups = user?.Role === 'manager' ? managerMenuGroups : employeeMenuGroups;
  const mainLinks = user?.Role === 'manager' ? managerMainLinks : employeeMainLinks;

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div className="w-[200px] bg-gray-900 text-white min-h-screen flex flex-col">
      <div
        className="text-2xl p-5 font-bold cursor-pointer"
        onClick={() => handleNavigate('/sale')}
      >
        Shop Ease
      </div>
      
      <div className="flex-1">
        {menuGroups.map((group) => (
          <div key={group.group} className="mb-2">
            <div className="text-lg font-bold px-5 py-3">{group.group}</div>
            <ul>
              {group.items.map((item) => (
                <li key={item.path}>
                  <button
                    onClick={() => navigate(item.path)}
                    className={`w-full px-4 py-2 text-left hover:bg-gray-700 ${
                      location.pathname === item.path ? 'bg-gray-700' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {mainLinks.map(link => (
          <div
            key={link.path}
            className={`px-5 py-3 text-lg font-bold cursor-pointer hover:bg-gray-700 ${
              location.pathname === link.path ? 'bg-blue-600' : ''
            }`}
            onClick={() => handleNavigate(link.path)}
          >
            {link.label}
          </div>
        ))}
      </div>

      <div className="mt-auto bg-gray-800 p-5">
        <div className="mb-4 pb-4 border-b border-gray-700">
          <div className="text-white text-sm mb-1">
            {user ? `${user.Fname} ${user.Lname}` : 'User'}
          </div>
          <div className="text-blue-400 text-xs">
            {user?.Role === 'manager' ? 'ผู้จัดการ' : 'พนักงาน'}
          </div>
        </div>
        <button
          className="w-full text-left text-sm hover:text-red-500 transition-colors"
          onClick={logout}
        >
          ออกจากระบบ
        </button>
      </div>
    </div>
  );
}

export default Sidebar;