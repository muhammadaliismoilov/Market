import React, { useState, useEffect } from 'react';
import { Layout } from '../components/shared/Layout';
import { transactionsAPI, paymentsAPI, productsAPI } from '../services/api';
import { FiPlus, FiDollarSign } from 'react-icons/fi';

export function SalesPage() {
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    price: '',
    paymentMethod: 'naqd',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [transactionsRes, productsRes] = await Promise.all([
        transactionsAPI.getAll(),
        productsAPI.getAll(),
      ]);
      setTransactions(transactionsRes.data);
      setProducts(productsRes.data);
    } catch (error) {
      console.error('Ma\'lumot yuklash xatosi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSale = async (e) => {
    e.preventDefault();
    try {
      const saleData = {
        ...formData,
        productId: parseInt(formData.productId),
        quantity: parseFloat(formData.quantity),
        price: parseFloat(formData.price),
      };

      const saleResponse = await transactionsAPI.create(saleData);

      if (saleResponse.data && formData.paymentMethod !== 'naqd') {
        await paymentsAPI.create({
          transactionId: saleResponse.data.id,
          method: formData.paymentMethod,
          amount: parseFloat(formData.price),
        });
      }

      setFormData({ productId: '', quantity: '', price: '', paymentMethod: 'naqd' });
      setShowForm(false);
      loadData();
    } catch (error) {
      console.error('Sotuvni qo\'shish xatosi:', error);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Sotuvlar</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 btn-primary"
          >
            <FiPlus />
            Yangi Sotuv
          </button>
        </div>

        {showForm && (
          <div className="card">
            <form onSubmit={handleAddSale} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Mahsulot tanlang</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Miqdori"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="input-field"
                  required
                />
                <input
                  type="number"
                  placeholder="Narxi"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="input-field"
                  required
                />
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="input-field"
                >
                  <option value="naqd">Naqd</option>
                  <option value="terminal">Terminal</option>
                  <option value="click">Click</option>
                  <option value="qarz">Qarz</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary">Sotuv qilish</button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-secondary"
                >
                  Bekor qilish
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Ma'lumotlar yuklanmoqda...</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-800">Mahsulot</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-800">Miqdori</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-800">Narxi</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-800">To\'lov Usuli</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-800">Sana</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-800">{transaction.productName || 'Noma\'lum'}</td>
                    <td className="px-6 py-4 text-gray-800">{transaction.quantity}</td>
                    <td className="px-6 py-4 text-gray-800">{transaction.price} so\'m</td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {transaction.paymentMethod || 'Naqd'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      {new Date(transaction.createdAt).toLocaleDateString('uz-UZ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
