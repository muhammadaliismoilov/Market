import React, { useState, useEffect } from 'react';
import { Layout } from '../components/shared/Layout';
import { productsAPI } from '../services/api';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';

export function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', type: 'dona', price: '' });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      setProducts(response.data);
    } catch (error) {
      console.error('Mahsulotlarni yuklash xatosi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await productsAPI.create(formData);
      setFormData({ name: '', type: 'dona', price: '' });
      setShowForm(false);
      loadProducts();
    } catch (error) {
      console.error('Mahsulot qo\'shish xatosi:', error);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Mahsulotni o\'chirishga ishonchingiz komilmi?')) {
      try {
        await productsAPI.delete(id);
        loadProducts();
      } catch (error) {
        console.error('Mahsulotni o\'chirish xatosi:', error);
      }
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Mahsulotlar</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 btn-primary"
          >
            <FiPlus />
            Yangi Mahsulot
          </button>
        </div>

        {showForm && (
          <div className="card">
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Mahsulot nomi"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  required
                />
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="input-field"
                >
                  <option value="dona">Dona</option>
                  <option value="kg">Kg</option>
                </select>
                <input
                  type="number"
                  placeholder="Narxi"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary">Qo'shish</button>
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
                  <th className="px-6 py-3 text-left font-semibold text-gray-800">Nomi</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-800">Turi</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-800">Narxi</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-800">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-800">{product.name}</td>
                    <td className="px-6 py-4 text-gray-800">{product.type === 'dona' ? 'Dona' : 'Kg'}</td>
                    <td className="px-6 py-4 text-gray-800">{product.price} so'm</td>
                    <td className="px-6 py-4 flex gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <FiTrash2 />
                      </button>
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
