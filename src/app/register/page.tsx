'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('https://vutech-api.onrender.com/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('🎉 Đăng ký thành công! Mời sếp đăng nhập nhé.');
        router.push('/login'); // Chuyển sang trang đăng nhập
      } else {
        setError('❌ ' + data.error);
      }
    } catch (err) {
      setError('❌ Lỗi kết nối đến máy chủ!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-black text-center text-green-600 mb-8">TẠO TÀI KHOẢN</h1>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-6 text-sm font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-bold mb-2">Họ và tên</label>
            <input 
              type="text" required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition"
              placeholder="VD: Trương Tấn Quang Vũ"
              value={fullName} onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">Email</label>
            <input 
              type="email" required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition"
              placeholder="Nhập email của bạn"
              value={email} onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">Mật khẩu</label>
            <input 
              type="password" required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition"
              placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button 
            type="submit" disabled={isLoading}
            className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition shadow-lg active:scale-95"
          >
            {isLoading ? 'Đang xử lý...' : 'Đăng Ký Ngay'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Đã có tài khoản? <Link href="/login" className="text-green-600 hover:underline font-bold">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}