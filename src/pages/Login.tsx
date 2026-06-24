import React, { useState } from 'react';
import axios from 'axios';

interface LoginProps {
  onLogin: (password: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('请输入密码');
      return;
    }

    if (true && password === 'whitefox') {
      onLogin(password);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await axios.post('/api/auth', { password });
      if (response.data.success) {
        onLogin(password);
      } else {
        setError('密码不正确');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '身份验证失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-96">
        <h1 className="text-3xl font-bold text-center mb-8 text-blue-500">白狐影视</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-400 mb-2">访问密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 outline-none transition text-white"
              placeholder="请输入密码"
              disabled={loading}
            />
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded transition disabled:bg-blue-800"
            disabled={loading}
          >
            {loading ? '正在验证...' : '进入面板'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
