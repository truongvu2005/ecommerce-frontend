'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Gọi API lấy toàn bộ sản phẩm từ Backend
    fetch('https://vutech-api.onrender.com/v1/products')
      .then(res => res.json())
      .then(data => { setProducts(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });

    // Kiểm tra đăng nhập
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

  if (loading) return <div className="min-h-screen flex items-center justify-center text-xl font-bold text-slate-500 bg-gray-50">Đang tải toàn bộ kho hàng... ⏳</div>;

  return (
    <main className="max-w-7xl mx-auto px-6 py-12 w-full animate-fade-in">
      {status && (
        <div className="fixed top-24 right-5 bg-green-500 text-white px-6 py-3 rounded-lg shadow-2xl z-50 font-bold flex items-center animate-bounce">
          {status}
        </div>
      )}

      {/* --- Tiêu đề trang Sản phẩm --- */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-black text-slate-800 mb-4 uppercase tracking-tight">
          Tất cả sản phẩm
        </h1>
        <p className="text-slate-500 text-lg">
          Khám phá {products.length} mặt hàng công nghệ đỉnh cao đang có sẵn tại Vũ Tech.
        </p>
        <div className="w-24 h-1.5 bg-blue-600 mx-auto mt-6 rounded-full"></div>
      </div>

      {/* --- Lưới hiển thị Sản Phẩm --- */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map((product: any) => (
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
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
          <p className="text-4xl mb-4">📦</p>
          <h3 className="text-xl font-bold text-slate-700">Kho hàng đang trống</h3>
        </div>
      )}
    </main>
  );
}