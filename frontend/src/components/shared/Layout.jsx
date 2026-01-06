import React from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../context/AuthContext';

export function Layout({ children }) {
  const { user } = useAuth();
  const role = user?.user_metadata?.role || 'user';

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar role={role} />
        <main className="flex-1 overflow-auto ml-64 mt-16 bg-gray-100 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
