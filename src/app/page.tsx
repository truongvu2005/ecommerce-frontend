'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  
  // State mới để lưu thông tin người dùng đang đăng nhập
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // 1. Lấy danh sách sản phẩm
    fetch('http://localhost:3000/v1/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });

    // 2. Kiểm tra xem có ai đang đăng nhập không (Lấy từ Local Storage)
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
  }, []);

  // Hàm xử lý Đăng xuất
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setCurrentUser(null);
    alert('Đã đăng xuất thành công!');
  };

  const handleAddToCart = async (productId: string) => {
    // BẢO MẬT MỚI: Chưa đăng nhập thì không cho mua hàng!
    if (!currentUser) {
      alert('Vui lòng đăng nhập để mua hàng nhé!');
      router.push('/login');
      return;
    }

    setStatus('Đang thêm...');
    try {
      const response = await fetch('http://localhost:3000/v1/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id, // LẤY ID THẬT CỦA BẠN TRONG DATABASE!
          productId: productId,
          quantity: 1,
        }),
      });

      if (response.ok) {
        setStatus('✅ Đã thêm thành công!');
        setTimeout(() => setStatus(''), 2500);
      } else {
        setStatus('❌ Lỗi thêm vào giỏ');
      }
    } catch (error) {
      setStatus('❌ Lỗi kết nối!');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-2xl font-bold">Đang tải kho hàng... ⏳</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header thông minh: Biết chào tên người dùng */}
        <div className="flex justify-between items-center mb-10 border-b-2 border-gray-200 pb-5">
          <h1 className="text-4xl font-extrabold text-gray-800">🛍️ Shop Công Nghệ</h1>
          
          <div className="flex items-center gap-4">
            {currentUser ? (
              <>
                <span className="font-bold text-gray-700">Chào, {currentUser.full_name} 👋</span>
                <button onClick={handleLogout} className="text-red-500 font-bold hover:underline">
                  Đăng xuất
                </button>
                <Link href="/cart" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-md transition transform hover:scale-105">
                  🛒 Xem Giỏ Hàng
                </Link>
              </>
            ) : (
              <Link href="/login" className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 shadow-md transition">
                🔑 Đăng Nhập
              </Link>
            )}
          </div>
        </div>

        {status && (
          <div className="fixed top-5 right-5 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-2xl z-50 font-medium">
            {status}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product: any) => (
            <div key={product.id} className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition duration-300 flex flex-col justify-between">
              <div>
                <div className="w-full h-40 bg-gray-100 rounded-xl mb-4 flex items-center justify-center text-gray-400 text-sm">
                  [Ảnh {product.name}]
                </div>
                <h2 className="text-lg font-bold mb-2 text-gray-800 line-clamp-2 h-14">{product.name}</h2>
              </div>
              
              <div>
                <p className="text-2xl text-red-500 font-black mb-4">{Number(product.price).toLocaleString('vi-VN')} đ</p>
                <button 
                  onClick={() => handleAddToCart(product.id)}
                  className="w-full bg-blue-50 text-blue-600 border-2 border-blue-600 px-4 py-3 rounded-xl hover:bg-blue-600 hover:text-white font-bold transition-colors active:scale-95"
                >
                  + Thêm vào giỏ
                </button>
              </div>
            </div>
          ))}
        </div>

        {currentUser && (
          <div className="mt-12 text-center">
            <Link href="/orders" className="text-gray-500 hover:text-gray-800 font-medium underline">
              Xem lịch sử đơn hàng của tôi
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}