import React, { useState, useEffect } from 'react';
import { Layout } from '../components/shared/Layout';
import { branchesAPI } from '../services/api';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';

export function BranchesPage() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    phone: '',
  });

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    try {
      const response = await branchesAPI.getAll();
      setBranches(response.data);
    } catch (error) {
      console.error('Filiallarni yuklash xatosi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBranch = async (e) => {
    e.preventDefault();
    try {
      await branchesAPI.create(formData);
      setFormData({ name: '', location: '', phone: '' });
      setShowForm(false);
      loadBranches();
    } catch (error) {
      console.error('Filial qo\'shish xatosi:', error);
    }
  };

  const handleDeleteBranch = async (id) => {
    if (window.confirm('Filialni o\'chirishga ishonchingiz komilmi?')) {
      try {
        await branchesAPI.delete(id);
        loadBranches();
      } catch (error) {
        console.error('Filialni o\'chirish xatosi:', error);
      }
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Filiallar</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 btn-primary"
          >
            <FiPlus />
            Yangi Filial
          </button>
        </div>

        {showForm && (
          <div className="card">
            <form onSubmit={handleAddBranch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Filial nomi"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  required
                />
                <input
                  type="text"
                  placeholder="Joylashuvi"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="input-field"
                  required
                />
                <input
                  type="tel"
                  placeholder="Telefon raqami"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                  <th className="px-6 py-3 text-left font-semibold text-gray-800">Joylashuvi</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-800">Telefon</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-800">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {branches.map((branch) => (
                  <tr key={branch.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-800">{branch.name}</td>
                    <td className="px-6 py-4 text-gray-800">{branch.location}</td>
                    <td className="px-6 py-4 text-gray-800">{branch.phone}</td>
                    <td className="px-6 py-4 flex gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleDeleteBranch(branch.id)}
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
