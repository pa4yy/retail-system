import React from 'react';
import Sidebar from './Sidebar';

export default function MainLayout({ user, children, title }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar user={user} />
      <div className="flex-1 p-5 bg-gray-100">
        {children}
      </div>
    </div>
  );
}