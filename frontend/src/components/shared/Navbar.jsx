import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiLogOut, FiHome } from 'react-icons/fi';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getRoleDisplay = (email) => {
    const metadata = user?.user_metadata || {};
    return metadata.role || 'User';
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <FiHome className="text-2xl" />
              <span className="font-bold text-xl">Do'kon</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-sm">
              <p className="font-semibold">{user?.email}</p>
              <p className="text-blue-100">{getRoleDisplay(user?.email)}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md transition"
            >
              <FiLogOut />
              Chiqish
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
