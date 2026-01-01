
import React, { useState, useContext } from 'react';
import { DataContext } from '../context/DataContext';
import { SchoolIcon } from '../components/icons/Icons';

const Login: React.FC = () => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const context = useContext(DataContext);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (context?.login(username, password)) {
      setError('');
    } else {
      setError('Username atau password salah.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-full max-w-sm p-8 space-y-6 bg-gray-800 rounded-lg shadow-md">
        <div className="flex justify-center">
            <SchoolIcon className="w-16 h-16 text-indigo-500"/>
        </div>
        <h2 className="text-2xl font-bold text-center text-white">
          Selamat Datang di LapKes
        </h2>
        <p className="text-center text-gray-400">Silakan login untuk melanjutkan</p>
        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-medium text-gray-300">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div>
            <button
              type="submit"
              className="w-full px-4 py-2 font-bold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Login
            </button>
          </div>
          <div className="mt-4 text-center">
             <p className="text-sm text-gray-500">Default: admin / password123</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
