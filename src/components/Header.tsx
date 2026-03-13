'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Header() {
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setCurrentUser(null);
    alert('Đã đăng xuất thành công!');
    window.location.href = '/login'; // Đá văng về trang đăng nhập
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
        
        {/* Cụm Logo & Menu Điều Hướng */}
        <div className="flex items-center gap-12">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <div className="bg-blue-600 text-white w-10 h-10 rounded-xl flex items-center justify-center font-black text-xl">V</div>
            <span className="text-2xl font-black text-slate-800 tracking-tight">Vũ Tech<span className="text-blue-600">Shop</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-8 font-bold text-slate-600">
            <Link href="/" className="hover:text-blue-600 transition">Trang chủ</Link>
            <Link href="#" className="hover:text-blue-600 transition">Sản phẩm</Link>
            <Link href="/about" className="hover:text-blue-600 transition">Giới thiệu</Link>
            <Link href="#" className="hover:text-blue-600 transition">Tin tức</Link>
          </div>
        </div>

        {/* Khu vực User */}
        <div className="flex items-center gap-4">
          {currentUser ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs text-slate-500">Xin chào,</span>
                <span className="font-bold text-slate-800 text-sm">{currentUser.full_name}</span>
              </div>
              
              {currentUser.role === 'admin' && (
                <Link href="/admin" className="text-purple-600 bg-purple-50 px-3 py-2 rounded-lg font-bold hover:bg-purple-100 transition text-sm">
                  ⚙️ Admin
                </Link>
              )}

              <Link href="/cart" className="relative p-2 text-slate-700 hover:text-blue-600 transition bg-slate-100 hover:bg-blue-50 rounded-full w-10 h-10 flex items-center justify-center">
                🛒
              </Link>

              <div className="h-6 w-px bg-gray-300 mx-1"></div>

              <Link href="/orders" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition hidden sm:block">
                Đơn hàng
              </Link>
              <button onClick={handleLogout} className="text-sm font-semibold text-red-500 hover:text-red-700 transition">
                Đăng xuất
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <Link href="/register" className="hidden sm:block px-5 py-2.5 rounded-full font-bold text-blue-600 hover:bg-blue-50 transition">
                Đăng ký
              </Link>
              <Link href="/login" className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-bold hover:bg-blue-700 shadow-md transition transform hover:-translate-y-0.5">
                Đăng Nhập
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}