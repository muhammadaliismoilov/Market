import React from 'react';
import { Link } from 'react-router-dom';
import { FiBarChart2, FiUsers, FiBox, FiShoppingCart, FiFileText, FiTrendingUp } from 'react-icons/fi';

export function Sidebar({ role }) {
  const getMenuItems = () => {
    const baseItems = [
      { icon: FiBarChart2, label: 'Dashboard', path: '/dashboard' },
    ];

    const roleItems = {
      superadmin: [
        { icon: FiUsers, label: 'Foydalanuvchilar', path: '/users' },
        { icon: FiBox, label: 'Mahsulotlar', path: '/products' },
        { icon: FiShoppingCart, label: 'Filiallar', path: '/branches' },
        { icon: FiFileText, label: 'Hisobotlar', path: '/reports' },
        { icon: FiTrendingUp, label: 'Statistika', path: '/analytics' },
      ],
      admin: [
        { icon: FiBox, label: 'Mahsulotlar', path: '/products' },
        { icon: FiShoppingCart, label: 'Sotuvlar', path: '/transactions' },
        { icon: FiFileText, label: 'Hisobotlar', path: '/reports' },
      ],
      cashier: [
        { icon: FiShoppingCart, label: 'Sotuvlar', path: '/sales' },
        { icon: FiFileText, label: 'Mening Sotuvlarim', path: '/my-sales' },
      ],
      distributor: [
        { icon: FiBox, label: 'Mahsulotlar', path: '/distributor-products' },
        { icon: FiTrendingUp, label: 'Tarqatish', path: '/distribution' },
      ],
    };

    return [...baseItems, ...(roleItems[role] || [])];
  };

  const menuItems = getMenuItems();

  return (
    <aside className="w-64 bg-gray-800 text-white h-screen fixed left-0 top-16 overflow-y-auto">
      <div className="p-6">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-gray-700 transition"
              >
                <Icon className="text-lg" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
