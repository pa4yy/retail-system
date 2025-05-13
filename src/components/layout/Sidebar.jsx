import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../data/AuthContext';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  // เมนูสำหรับ Manager
  const managerMenuGroups = [
    {
      group: 'รายงาน',
      items: [
        { path: '/sales-report', label: 'รายงานการขาย' },
        { path: '/stock-report', label: 'สินค้าคงเหลือ' },
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
                <li
                  key={item.path}
                  className={`px-8 py-2 cursor-pointer text-base hover:bg-gray-700 ${
                    location.pathname === item.path ? 'bg-blue-600' : ''
                  }`}
                  onClick={() => handleNavigate(item.path)}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-2 bg-red-600 text-white px-2 py-0.5 rounded-full text-xs">
                      {item.badge}
                    </span>
                  )}
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