import React, { useState, useEffect } from 'react';
import { Layout } from '../components/shared/Layout';
import { reportsAPI } from '../services/api';

export function ReportsPage() {
  const [reports, setReports] = useState(null);
  const [reportType, setReportType] = useState('daily');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, [reportType]);

  const loadReports = async () => {
    setLoading(true);
    try {
      let response;
      switch (reportType) {
        case 'daily':
          response = await reportsAPI.getDailyReport();
          break;
        case 'weekly':
          response = await reportsAPI.getWeeklyReport();
          break;
        case 'monthly':
          response = await reportsAPI.getMonthlyReport();
          break;
        case 'yearly':
          response = await reportsAPI.getYearlyReport();
          break;
        default:
          response = await reportsAPI.getDailyReport();
      }
      setReports(response.data);
    } catch (error) {
      console.error('Hisobotlarni yuklash xatosi:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Hisobotlar</h1>

        <div className="flex gap-4">
          <button
            onClick={() => setReportType('daily')}
            className={`px-4 py-2 rounded-md ${reportType === 'daily' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Kunlik
          </button>
          <button
            onClick={() => setReportType('weekly')}
            className={`px-4 py-2 rounded-md ${reportType === 'weekly' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Haftalik
          </button>
          <button
            onClick={() => setReportType('monthly')}
            className={`px-4 py-2 rounded-md ${reportType === 'monthly' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Oylik
          </button>
          <button
            onClick={() => setReportType('yearly')}
            className={`px-4 py-2 rounded-md ${reportType === 'yearly' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Yillik
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Ma'lumotlar yuklanmoqda...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Jami Sotuvlar</h3>
              <p className="text-3xl font-bold text-blue-600">{reports?.totalSales || 0} so'm</p>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Sotuvlar Soni</h3>
              <p className="text-3xl font-bold text-green-600">{reports?.transactionCount || 0}</p>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">O'rtacha Sotuv</h3>
              <p className="text-3xl font-bold text-purple-600">
                {reports?.averageSale ? Math.round(reports.averageSale) : 0} so'm
              </p>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Naqd To'lovlar</h3>
              <p className="text-3xl font-bold text-green-600">{reports?.cashPayments || 0} so'm</p>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Terminal To'lovlar</h3>
              <p className="text-3xl font-bold text-blue-600">{reports?.terminalPayments || 0} so'm</p>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Click To'lovlar</h3>
              <p className="text-3xl font-bold text-blue-500">{reports?.clickPayments || 0} so'm</p>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Qarz Miqdori</h3>
              <p className="text-3xl font-bold text-red-600">{reports?.debtAmount || 0} so'm</p>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Sotuv Qilingan Mahsulotlar</h3>
              <p className="text-3xl font-bold text-purple-500">{reports?.productsCount || 0}</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
