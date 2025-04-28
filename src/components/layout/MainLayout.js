import React from 'react';
import Sidebar from './Sidebar';
import './MainLayout.css';

function MainLayout({ user, children, title }) {
  return (
    <div className="layout-container">
      <Sidebar user={user} />
      <div className="main-content">
        <div className="content-header">
          <div className="page-title">{title}</div>
        </div>
        {children}
      </div>
    </div>
  );
}

export default MainLayout; 