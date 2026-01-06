import React, { useState, useEffect } from 'react';
import { Layout } from '../components/shared/Layout';
import { usersAPI } from '../services/api';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';

export function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'cashier',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await usersAPI.getAll();
      setUsers(response.data);
    } catch (error) {
      console.error('Foydalanuvchilarni yuklash xatosi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await usersAPI.create(formData);
      setFormData({ email: '', password: '', role: 'cashier' });
      setShowForm(false);
      loadUsers();
    } catch (error) {
      console.error('Foydalanuvchi qo\'shish xatosi:', error);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Foydalanuvchini o\'chirishga ishonchingiz komilmi?')) {
      try {
        await usersAPI.delete(id);
        loadUsers();
      } catch (error) {
        console.error('Foydalanuvchini o\'chirish xatosi:', error);
      }
    }
  };

  const getRoleDisplay = (role) => {
    const roles = {
      superadmin: 'Superadmin',
      admin: 'Admin',
      cashier: 'Kassir',
      distributor: 'Distributor',
    };
    return roles[role] || role;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Foydalanuvchilar</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 btn-primary"
          >
            <FiPlus />
            Yangi Foydalanuvchi
          </button>
        </div>

        {showForm && (
          <div className="card">
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                  required
                />
                <input
                  type="password"
                  placeholder="Parol"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-field"
                  required
                />
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="input-field"
                >
                  <option value="cashier">Kassir</option>
                  <option value="admin">Admin</option>
                  <option value="distributor">Distributor</option>
                  <option value="superadmin">Superadmin</option>
                </select>
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
                  <th className="px-6 py-3 text-left font-semibold text-gray-800">Email</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-800">Rol</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-800">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-800">{user.email}</td>
                    <td className="px-6 py-4 text-gray-800">{getRoleDisplay(user.role)}</td>
                    <td className="px-6 py-4 flex gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
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
