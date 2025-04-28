import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';

function Sidebar({ user }) {
  const navigate = useNavigate();
  const location = useLocation();

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
  const menuGroups = user?.role === 'manager' ? managerMenuGroups : employeeMenuGroups;
  const mainLinks = user?.role === 'manager' ? managerMainLinks : employeeMainLinks;

  const handleNavigate = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <div
        className="sidebar-title"
        style={{ cursor: 'pointer' }}
        onClick={() => handleNavigate('/sale')}
      >
        Shop Ease
      </div>
      <div className="sidebar-menu-group">
        {menuGroups.map((group) => (
          <div key={group.group} className="sidebar-group">
            <div className="sidebar-group-title">{group.group}</div>
            <ul className="sidebar-group-list">
              {group.items.map((item) => (
                <li
                  key={item.path}
                  className={location.pathname === item.path ? 'active' : ''}
                  onClick={() => handleNavigate(item.path)}
                >
                  <span>{item.label}</span>
                  {item.badge && <span className="badge">{item.badge}</span>}
                </li>
              ))}
            </ul>
          </div>
        ))}
        {/* เมนูหลักที่ไม่อยู่ในกลุ่ม */}
        {mainLinks.map(link => (
          <div
            key={link.path}
            className={`sidebar-group-title main-link${location.pathname === link.path ? ' active' : ''}`}
            onClick={() => handleNavigate(link.path)}
            style={{ cursor: 'pointer' }}
          >
            {link.label}
          </div>
        ))}
      </div>
      <div className="user-section">
        <div className="user-info">
          <div className="user-name">{user?.name || 'User'}</div>
          <div className="user-role">
            {user?.role === 'manager' ? 'ผู้จัดการ' : 'พนักงาน'}
          </div>
        </div>
        <button className="logout-button" onClick={handleLogout}>
          ออกจากระบบ
        </button>
      </div>
    </div>
  );
}

export default Sidebar;