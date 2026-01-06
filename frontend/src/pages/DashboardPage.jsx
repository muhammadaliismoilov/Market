import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Layout } from '../components/shared/Layout';
import { reportsAPI } from '../services/api';
import { FiTrendingUp, FiUsers, FiBox, FiShoppingCart } from 'react-icons/fi';

export function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const role = user?.user_metadata?.role || 'user';

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await reportsAPI.getDailyReport();
      setStats(response.data);
    } catch (error) {
      console.error('Dashboard yuklash xatosi:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-2">{value || '0'}</p>
        </div>
        <Icon className={`text-4xl ${color}`} />
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 mt-2">Assalomu alaykum, {user?.email}</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Ma'lumotlar yuklanmoqda...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={FiShoppingCart}
                title="Bugungi Sotuvlar"
                value={`${stats?.totalSales || 0} so'm`}
                color="text-blue-500"
              />
              <StatCard
                icon={FiUsers}
                title="Foydalanuvchilar"
                value={stats?.totalUsers || '0'}
                color="text-green-500"
              />
              <StatCard
                icon={FiBox}
                title="Mahsulotlar"
                value={stats?.totalProducts || '0'}
                color="text-purple-500"
              />
              <StatCard
                icon={FiTrendingUp}
                title="Qarz"
                value={`${stats?.totalDebt || 0} so'm`}
                color="text-red-500"
              />
            </div>

            {role === 'superadmin' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Filiallar Statistikasi</h3>
                  <p className="text-gray-600">Filial ma'lumotlari ko'rsatiladi</p>
                </div>
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Foydalanuvchilar Faoliyati</h3>
                  <p className="text-gray-600">Faoliyat ma'lumotlari ko'rsatiladi</p>
                </div>
              </div>
            )}

            {role === 'cashier' && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Mening Kunlik Sotuvlarim</h3>
                <p className="text-gray-600">Sotuvlar jadvalini ko'rish uchun "Mening Sotuvlarim" sahifasiga o'ting</p>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
