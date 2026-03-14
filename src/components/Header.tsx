'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [keyword, setKeyword] = useState(''); // State lưu từ khóa
  const router = useRouter();

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
    router.push('/login');
  };

  // Hàm xử lý tìm kiếm khi gõ Enter
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault(); // Ngăn trình duyệt load lại trang
    if (keyword.trim()) {
      router.push(`/products?search=${encodeURIComponent(keyword)}`);
      setIsMobileMenuOpen(false); // Đóng menu nếu đang ở mobile
      setKeyword(''); // Xóa chữ trong ô nhập sau khi tìm
    }
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        <Link href="/" className="flex items-center gap-3">
          <div className="bg-blue-600 text-white w-10 h-10 rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-blue-600/30">V</div>
          <span className="font-black text-2xl tracking-tight text-slate-800">Vũ Tech<span className="text-blue-600">Shop</span></span>
        </Link>

        <button className="md:hidden p-2 text-slate-600" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>

        <nav className="hidden md:flex items-center gap-8 font-semibold text-slate-600">
          <Link href="/" className="hover:text-blue-600 transition">Trang chủ</Link>
          <Link href="/products" className="hover:text-blue-600 transition">Sản phẩm</Link>
          <Link href="/about" className="hover:text-blue-600 transition">Giới thiệu</Link>
        </nav>

        <div className="hidden md:flex items-center gap-6">
          
          {/* THANH TÌM KIẾM CHO PC */}
          {/* THANH TÌM KIẾM CHO PC - DÙNG ONKEYDOWN */}
          <div className="relative">
            <input 
              type="text" 
              placeholder="Bạn muốn tìm mua gì?" 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && keyword.trim()) {
                  e.preventDefault();
                  router.push(`/products?search=${encodeURIComponent(keyword)}`);
                  setKeyword('');
                }
              }}
              className="bg-slate-50 border border-transparent focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 px-5 py-2.5 rounded-full text-sm w-64 transition-all outline-none" 
            />
            <button 
              onClick={() => {
                if (keyword.trim()) {
                  router.push(`/products?search=${encodeURIComponent(keyword)}`);
                  setKeyword('');
                }
              }} 
              className="absolute right-3 top-2.5 text-slate-400 hover:text-blue-600"
            >
              🔍
            </button>
          </div>

          {currentUser ? (
            <div className="flex items-center gap-4 border-l pl-6">
              <div className="text-sm text-slate-600">
                Xin chào, <br/><Link href="/profile" className="font-bold text-slate-800 hover:text-blue-600">{currentUser.full_name}</Link>
              </div>
              
              {(currentUser.role === 'ADMIN' || currentUser.role === 'admin') && (
                <Link href="/admin" className="text-purple-600 bg-purple-50 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1 hover:bg-purple-100 transition">
                  ⚙️ Admin
                </Link>
              )}
              
              <Link href="/cart" className="w-10 h-10 bg-slate-50 hover:bg-slate-100 rounded-full flex items-center justify-center text-slate-600 transition relative">🛒</Link>
              <Link href="/orders" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition">Đơn hàng</Link>
              <button onClick={handleLogout} className="text-sm font-bold text-red-500 hover:text-red-700 transition">Đăng xuất</button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/register" className="font-semibold text-slate-600 hover:text-blue-600 transition">Đăng ký</Link>
              <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full font-bold shadow-lg shadow-blue-600/30 transition-all active:scale-95">Đăng Nhập</Link>
            </div>
          )}
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-4 shadow-xl absolute w-full left-0 animate-fade-in">
          
          {/* THANH TÌM KIẾM CHO ĐIỆN THOẠI */}
          {/* THANH TÌM KIẾM CHO ĐIỆN THOẠI - DÙNG ONKEYDOWN */}
          <div className="relative">
            <input 
              type="text" 
              placeholder="Tìm kiếm sản phẩm..." 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && keyword.trim()) {
                  e.preventDefault();
                  router.push(`/products?search=${encodeURIComponent(keyword)}`);
                  setIsMobileMenuOpen(false);
                  setKeyword('');
                }
              }}
              className="w-full bg-slate-50 border px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>
          
          <nav className="flex flex-col gap-4 font-semibold text-slate-600">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>Trang chủ</Link>
            <Link href="/products" onClick={() => setIsMobileMenuOpen(false)}>Sản phẩm</Link>
            <Link href="/about" onClick={() => setIsMobileMenuOpen(false)}>Giới thiệu</Link>
          </nav>

          <div className="border-t pt-4">
            {currentUser ? (
              <div className="flex flex-col gap-3">
                <Link href="/profile" className="text-slate-800 font-bold">Xin chào, {currentUser.full_name}</Link>
                {(currentUser.role === 'ADMIN' || currentUser.role === 'admin') && <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="text-purple-600">⚙️ Quản trị Admin</Link>}
                <Link href="/cart" onClick={() => setIsMobileMenuOpen(false)}>🛒 Giỏ hàng</Link>
                <Link href="/orders" onClick={() => setIsMobileMenuOpen(false)}>📦 Đơn hàng của tôi</Link>
                <button onClick={handleLogout} className="text-left text-red-500 font-bold">Đăng xuất</button>
              </div>
            ) : (
              <div className="flex gap-4">
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex-1 bg-blue-600 text-center text-white py-2 rounded-lg font-bold">Đăng nhập</Link>
                <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="flex-1 bg-slate-100 text-center text-slate-800 py-2 rounded-lg font-bold">Đăng ký</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}