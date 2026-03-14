'use client';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function HomeContent() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();
  
  // Đọc từ khóa tìm kiếm trên thanh URL
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  useEffect(() => {
    fetch('https://vutech-api.onrender.com/v1/products')
      .then(res => res.json())
      .then(data => { setProducts(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });

    const userStr = localStorage.getItem('user');
    if (userStr) setCurrentUser(JSON.parse(userStr));
  }, []);

  const handleAddToCart = async (productId: string) => {
    if (!currentUser) {
      alert('Vui lòng đăng nhập để mua hàng nhé!');
      router.push('/login');
      return;
    }
    setStatus('Đang thêm...');
    try {
      const response = await fetch('https://vutech-api.onrender.com/v1/cart/items', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, productId: productId, quantity: 1 }),
      });
      if (response.ok) {
        setStatus('✅ Đã thêm vào giỏ!');
        setTimeout(() => setStatus(''), 2500);
      } else setStatus('❌ Lỗi thêm vào giỏ');
    } catch (error) { setStatus('❌ Lỗi kết nối!'); }
  };

  // --- LOGIC TÌM KIẾM THẦN THÁNH ---
  // Lọc sản phẩm nào có tên chứa từ khóa tìm kiếm (Không phân biệt hoa thường)
  const filteredProducts = products.filter((product: any) => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="min-h-screen flex items-center justify-center text-2xl font-bold bg-gray-50 text-slate-500">Đang tải kho hàng Vũ Tech... ⏳</div>;

  return (
    <main className="max-w-7xl mx-auto px-6 py-8 w-full">
      {status && (
        <div className="fixed top-24 right-5 bg-green-500 text-white px-6 py-3 rounded-lg shadow-2xl z-50 font-bold flex items-center animate-bounce">
          {status}
        </div>
      )}

      {/* Chỉ hiện Banner nếu KHÔNG có từ khóa tìm kiếm */}
      {!searchQuery && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-10 md:p-16 mb-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
          <div className="relative z-10 max-w-xl">
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold tracking-wide uppercase mb-4 inline-block backdrop-blur-sm">✨ Khai trương giảm giá 50%</span>
            <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight">Nâng tầm góc máy <br/> của bạn ngay hôm nay.</h1>
            <p className="text-blue-100 text-lg mb-8 leading-relaxed">Khám phá bộ sưu tập thiết bị công nghệ đỉnh cao từ Vũ Tech. Chất lượng tuyệt đối, giao hàng hỏa tốc trong 2 giờ.</p>
            <button onClick={() => router.push('/products')} className="bg-white text-blue-700 px-8 py-4 rounded-full font-black hover:bg-blue-50 transition shadow-lg hover:shadow-xl active:scale-95">MUA SẮM NGAY</button>
          </div>
          <div className="absolute -right-20 -top-40 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        </div>
      )}

      {/* Tiêu đề thay đổi theo ngữ cảnh */}
      <div className="flex justify-between items-end mb-8 mt-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800">
            {searchQuery ? `🔍 Kết quả tìm kiếm cho: "${searchQuery}"` : '🔥 Sản phẩm nổi bật'}
          </h2>
          <p className="text-slate-500 mt-2 font-medium">
            {searchQuery ? `Tìm thấy ${filteredProducts.length} sản phẩm phù hợp` : 'Những món đồ công nghệ được săn lùng nhiều nhất'}
          </p>
        </div>
        {searchQuery && (
          <Link href="/" className="text-blue-600 font-bold hover:underline bg-blue-50 px-4 py-2 rounded-lg">
            ✕ Hủy tìm kiếm
          </Link>
        )}
      </div>

      {/* Grid Sản Phẩm */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filteredProducts.map((product: any) => (
            <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col group overflow-hidden">
              <Link href={`/product/${product.id}`} className="cursor-pointer relative overflow-hidden bg-gray-50 aspect-square flex items-center justify-center p-4">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"/>
                ) : (
                  <span className="text-gray-400 font-medium">Không có ảnh</span>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>
              </Link>
              <div className="p-5 flex flex-col flex-1 justify-between">
                <Link href={`/product/${product.id}`}>
                  <h2 className="text-lg font-bold text-slate-800 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">{product.name}</h2>
                </Link>
                <div className="mt-4">
                  <p className="text-2xl font-black text-red-600 mb-4">{Number(product.price).toLocaleString('vi-VN')} đ</p>
                  <button onClick={() => handleAddToCart(product.id)} className="w-full bg-slate-100 text-blue-700 border border-transparent px-4 py-3 rounded-xl hover:bg-blue-600 hover:text-white font-bold transition-all duration-300 active:scale-95 flex justify-center items-center gap-2">
                    <span>+</span> Thêm vào giỏ
                  </button>
                </div>
              </div>
            </div>
          ))}                                         
        </div>
      ) : (
        <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-300">
          <p className="text-5xl mb-4">🕵️‍♂️</p>
          <h3 className="text-2xl font-bold text-slate-700 mb-2">Không tìm thấy sản phẩm!</h3>
          <p className="text-slate-500 mb-6">Thử tìm với một từ khóa khác hoặc xem các sản phẩm nổi bật nhé.</p>
          <Link href="/" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition">
            Quay lại kho hàng
          </Link>
        </div>
      )}

      {/* {currentUser && (
        <div className="mt-16 text-center">
          <Link href="/orders" className="text-slate-500 hover:text-blue-600 font-bold underline text-lg transition-colors">📦 Xem chi tiết lịch sử đơn hàng của tôi</Link>
        </div>
      )} */}
    </main>
  );
}

// Bọc Component chính trong Suspense theo đúng chuẩn của Next.js 13+ App Router
export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold text-2xl text-slate-500">Đang khởi tạo cửa hàng...</div>}>
      <HomeContent />
    </Suspense>
  );
}