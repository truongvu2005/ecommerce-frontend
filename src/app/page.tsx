'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('https://vutech-api.onrender.com/v1/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });

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
  };

  const handleAddToCart = async (productId: string) => {
    if (!currentUser) {
      alert('Vui lòng đăng nhập để mua hàng nhé!');
      router.push('/login');
      return;
    }

    setStatus('Đang thêm...');
    try {
      const response = await fetch('https://vutech-api.onrender.com/v1/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id, 
          productId: productId,
          quantity: 1,
        }),
      });

      if (response.ok) {
        setStatus('✅ Đã thêm vào giỏ!');
        setTimeout(() => setStatus(''), 2500);
      } else {
        setStatus('❌ Lỗi thêm vào giỏ');
      }
    } catch (error) {
      setStatus('❌ Lỗi kết nối!');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-2xl font-bold bg-gray-50 text-slate-500">Đang tải kho hàng Vũ Tech... ⏳</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      
      {/* ================= HEADER / NAVBAR (CỐ ĐỊNH) ================= */}
      <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <div className="bg-blue-600 text-white w-10 h-10 rounded-xl flex items-center justify-center font-black text-xl">V</div>
            <span className="text-2xl font-black text-slate-800 tracking-tight">Vũ Tech<span className="text-blue-600">Shop</span></span>
          </Link>

          {/* Thanh tìm kiếm mô phỏng */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <input type="text" placeholder="Bạn muốn tìm mua gì hôm nay?" className="w-full bg-slate-100 border-none rounded-full py-3 pl-6 pr-12 outline-none focus:ring-2 focus:ring-blue-500 transition" />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600">
                🔍
              </button>
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

      {/* Thông báo Toast */}
      {status && (
        <div className="fixed top-24 right-5 bg-green-500 text-white px-6 py-3 rounded-lg shadow-2xl z-50 font-bold flex items-center gap-2 animate-bounce">
          {status}
        </div>
      )}

      {/* ================= MAIN CONTENT ================= */}
      {/* Thêm pt-28 để đẩy nội dung xuống không bị Navbar đè lên */}
      <main className="flex-1 max-w-7xl mx-auto px-6 pt-28 pb-16 w-full">
        
        {/* Banner Hero */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-10 md:p-16 mb-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
          <div className="relative z-10 max-w-xl">
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold tracking-wide uppercase mb-4 inline-block backdrop-blur-sm">
              ✨ Khai trương giảm giá 50%
            </span>
            <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight">Nâng tầm góc máy <br/> của bạn ngay hôm nay.</h1>
            <p className="text-blue-100 text-lg mb-8 leading-relaxed">
              Khám phá bộ sưu tập thiết bị công nghệ đỉnh cao từ Vũ Tech. Chất lượng tuyệt đối, bảo hành 24 tháng, giao hàng hỏa tốc trong 2 giờ.
            </p>
            <button className="bg-white text-blue-700 px-8 py-4 rounded-full font-black hover:bg-blue-50 transition shadow-lg hover:shadow-xl active:scale-95">
              MUA SẮM NGAY
            </button>
          </div>
          {/* Vòng tròn trang trí */}
          <div className="absolute -right-20 -top-40 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute right-20 -bottom-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"></div>
        </div>

        {/* Tiêu đề khu vực sản phẩm */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-black text-slate-800">🔥 Sản phẩm nổi bật</h2>
            <p className="text-slate-500 mt-2">Những món đồ công nghệ được săn lùng nhiều nhất</p>
          </div>
          <button className="text-blue-600 font-bold hover:underline hidden sm:block">Xem tất cả →</button>
        </div>

        {/* Grid Sản Phẩm */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map((product: any) => (
            <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col group overflow-hidden">
              
              <Link href={`/product/${product.id}`} className="cursor-pointer relative overflow-hidden bg-gray-50 aspect-square flex items-center justify-center p-4">
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.name} 
                    className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <span className="text-gray-400 font-medium">Không có ảnh</span>
                )}
                {/* Overlay làm tối ảnh khi hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>
              </Link>
              
              <div className="p-5 flex flex-col flex-1 justify-between">
                <Link href={`/product/${product.id}`}>
                  <h2 className="text-lg font-bold text-slate-800 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </h2>
                </Link>
                
                <div className="mt-4">
                  <p className="text-2xl font-black text-red-600 mb-4">
                    {Number(product.price).toLocaleString('vi-VN')} <span className="text-sm text-red-500 underline">đ</span>
                  </p>
                  <button 
                    onClick={() => handleAddToCart(product.id)}
                    className="w-full bg-slate-100 text-blue-700 border border-transparent px-4 py-3 rounded-xl hover:bg-blue-600 hover:text-white font-bold transition-all duration-300 active:scale-95 flex justify-center items-center gap-2"
                  >
                    <span>+</span> Thêm vào giỏ
                  </button>
                </div>
              </div>
            </div>
          ))}                                         
        </div>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="bg-slate-900 text-slate-300 py-16 mt-auto">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-black">V</div>
              <span className="text-xl font-black text-white tracking-tight">Vũ Tech<span className="text-blue-500">Shop</span></span>
            </Link>
            <p className="text-slate-400 leading-relaxed max-w-md">
              Hệ thống bán lẻ thiết bị công nghệ, linh kiện PC và phụ kiện Gaming Gear hàng đầu Việt Nam. Chất lượng làm nên thương hiệu.
            </p>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Về chúng tôi</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="hover:text-white transition">Giới thiệu</Link></li>
              <li><Link href="#" className="hover:text-white transition">Chính sách bảo hành</Link></li>
              <li><Link href="#" className="hover:text-white transition">Tuyển dụng</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Liên hệ</h3>
            <ul className="space-y-3 text-slate-400">
              <li>📍 123 Đường Công Nghệ, Đà Nẵng</li>
              <li>📞 Hotline: 0123.456.789</li>
              <li>✉️ Email: contact@vutech.com</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} Vũ Tech Shop. Đồ án xây dựng bởi Trương Tấn Quang Vũ - Lớp 23CNTT1.
        </div>
      </footer>
    </div>
  );
}