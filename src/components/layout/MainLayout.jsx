import React from 'react';
import Sidebar from './Sidebar';

export default function MainLayout({ user, children, title }) {
  return (
    <div className="flex min-h-screen">
      <div className="fixed h-screen">
        <Sidebar user={user} />
      </div>
      <div className="flex-1 ml-[200px] p-5 bg-gray-100">
        {children}
      </div>
    </div>
  );
}