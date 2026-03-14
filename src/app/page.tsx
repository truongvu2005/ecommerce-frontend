'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast'; // <--- Import Toast

export default function HomeContent() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('https://vutech-api.onrender.com/v1/products')
      .then(res => res.json())
      .then(data => { 
        setProducts(data.data || data); // Lấy tối đa 8 SP mới nhất
        setLoading(false); 
      })
      .catch(err => { 
        console.error(err); 
        setLoading(false); 
      });

    const userStr = localStorage.getItem('user');
    if (userStr) setCurrentUser(JSON.parse(userStr));
  }, []);

  const handleAddToCart = async (productId: string) => {
    if (!currentUser) {
      toast.error('Vui lòng đăng nhập để mua hàng!'); // Thông báo lỗi xịn xò
      router.push('/login');
      return;
    }
    
    // Hiện thông báo đang loading...
    const toastId = toast.loading('Đang thêm vào giỏ...'); 

    try {
      const response = await fetch('https://vutech-api.onrender.com/v1/cart/items', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, productId, quantity: 1 }),
      });
      
      if (response.ok) {
        toast.success('Đã thêm vào giỏ hàng!', { id: toastId }); // Đổi loading thành dấu Tick xanh
      } else {
        toast.error('Có lỗi xảy ra', { id: toastId });
      }
    } catch (error) { 
      toast.error('Lỗi kết nối!', { id: toastId });
    }
  };

  return (
    <main className="w-full">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6">Nâng tầm góc máy của bạn.</h1>
          <p className="text-xl text-blue-100 mb-8">Thiết bị công nghệ đỉnh cao tại Vũ Tech.</p>
          <Link href="/products" className="bg-white text-blue-700 px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-50 transition shadow-xl">
            Mua Sắm Ngay
          </Link>
        </div>
      </div>

      {/* Danh sách sản phẩm */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-black text-slate-800 mb-10 text-center flex items-center justify-center gap-2">
          🔥 Sản phẩm mới nhất
        </h2>

        {/* --- HIỆU ỨNG SKELETON KHI CHỜ LOAD --- */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 animate-pulse">
                <div className="bg-slate-200 aspect-square rounded-xl mb-4 w-full h-48"></div>
                <div className="h-4 bg-slate-200 rounded-full w-3/4 mb-3"></div>
                <div className="h-6 bg-slate-200 rounded-full w-1/2 mb-5"></div>
                <div className="h-12 bg-slate-200 rounded-xl w-full"></div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 8).map((product: any) => (
              <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col group overflow-hidden">
                <Link href={`/product/${product.id}`} className="relative bg-gray-50 aspect-square flex items-center justify-center p-4">
                  <img src={product.image_url || 'https://via.placeholder.com/200'} alt={product.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"/>
                </Link>
                <div className="p-5 flex flex-col flex-1 justify-between">
                  <Link href={`/product/${product.id}`}>
                    <h2 className="text-lg font-bold text-slate-800 line-clamp-2 hover:text-blue-600">{product.name}</h2>
                  </Link>
                  <div className="mt-4">
                    <p className="text-2xl font-black text-red-600 mb-4">{Number(product.price).toLocaleString('vi-VN')} đ</p>
                    <button onClick={() => handleAddToCart(product.id)} className="w-full bg-blue-50 text-blue-700 font-bold py-3 rounded-xl hover:bg-blue-600 hover:text-white transition active:scale-95">
                      + Thêm vào giỏ
                    </button>
                  </div>
                </div>
              </div>
            ))}                                         
          </div>
        ) : (
          <div className="text-center py-20 text-slate-500">Chưa có sản phẩm nào.</div>
        )}
      </div>
    </main>
  );
}