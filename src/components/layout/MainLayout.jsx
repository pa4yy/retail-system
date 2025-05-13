import React from 'react';
import Sidebar from './Sidebar';

export default function MainLayout({ user, children, title }) {
  return (
    <div style={style.layoutcontainer}>
      <Sidebar user={user} />
      <div style={style.maincontent}>
        {children}
      </div>
    </div>
  );
}

const style = {
  layoutcontainer: {
    display: "flex",
    minHeight: '100vh',
  },
  
  maincontent: {
    flex: 1,
    padding: '20px',
    backgroundColor: '#f5f5f5',
  }
};