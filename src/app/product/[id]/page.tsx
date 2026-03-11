'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function ProductDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [status, setStatus] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // 1. Lấy thông tin sản phẩm
    fetch(`https://vutech-api.onrender.com/v1/products/${id}`)
      .then(res => res.json())
      .then(data => setProduct(data));

    // 2. Lấy thông tin user để mua hàng
    const userStr = localStorage.getItem('user');
    if (userStr) setCurrentUser(JSON.parse(userStr));
  }, [id]);

  const handleAddToCart = async () => {
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
          productId: id, // id lấy từ useParams
          quantity: 1,
        }),
      });

      if (response.ok) {
        setStatus('✅ Đã thêm vào giỏ thành công!');
        setTimeout(() => setStatus(''), 2500);
      } else {
        setStatus('❌ Lỗi khi thêm');
      }
    } catch (error) {
      setStatus('❌ Lỗi kết nối!');
    }
  };

  if (!product) return <div className="p-10 text-center font-bold">Đang tải sản phẩm... ⏳</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      {/* Toast thông báo */}
      {status && (
        <div className="fixed top-5 right-5 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-2xl z-50 animate-bounce">
          {status}
        </div>
      )}

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 bg-white p-8 rounded-3xl shadow-sm">
        {/* Bên trái: Ảnh sản phẩm */}
        <div className="rounded-2xl overflow-hidden shadow-inner bg-gray-50 flex items-center justify-center">
          <img 
            src={product.image_url || 'https://via.placeholder.com/500'} 
            alt={product.name} 
            className="w-full h-auto max-h-[500px] object-contain hover:scale-105 transition-transform duration-500" 
          />
        </div>

        {/* Bên phải: Thông tin */}
        <div className="flex flex-col justify-center gap-6">
          <button 
            onClick={() => router.back()} 
            className="text-blue-600 font-bold hover:underline w-fit"
          >
            ← Quay lại cửa hàng
          </button>
          
          <h1 className="text-4xl font-black text-slate-800 leading-tight">{product.name}</h1>
          
          <div className="flex items-center gap-4">
            <span className="text-4xl font-black text-red-600">
              {Number(product.price).toLocaleString('vi-VN')} đ
            </span>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm font-bold">
              Còn hàng
            </span>
          </div>

          <div className="p-4 bg-blue-50 rounded-xl border-l-4 border-blue-500 text-slate-700">
            Mã sản phẩm (SKU): <span className="font-mono font-bold text-blue-700">{product.sku}</span>
          </div>

          <p className="text-slate-500 text-lg leading-relaxed">
            Sản phẩm công nghệ chính hãng tại <strong>Vũ Tech Shop</strong>. 
            Cam kết chất lượng tốt nhất, hỗ trợ kỹ thuật 24/7 và giao hàng siêu tốc trong vòng 2h.
          </p>

          <button 
            onClick={handleAddToCart}
            className="bg-blue-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-blue-700 shadow-xl active:scale-95 transition-all mt-4"
          >
            MUA NGAY - THÊM VÀO GIỎ
          </button>
        </div>
      </div>
    </div>
  );
}