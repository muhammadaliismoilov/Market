import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await login(email, password);
      if (data?.user) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login xatosi yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">Do'kon Tizimi</h1>
        <p className="text-gray-600 text-center mb-8">Kiritish uchun login qiling</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="emailingiz@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Parol</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="Parolingiz"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Kirish...' : 'Kirish'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6 text-sm">
          Akkauntingiz yo'qmi? <a href="/signup" className="text-blue-600 hover:underline">Ro'yxatdan o'tish</a>
        </p>
      </div>
    </div>
  );
}
