'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function ProductDetail() {
  const params = useParams();
  const id = params?.id; 
  const router = useRouter();
  
  const [product, setProduct] = useState<any>(null);
  const [status, setStatus] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');
  
  // --- STATE MỚI: QUẢN LÝ SỐ LƯỢNG MUA ---
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!id) return;

    fetch(`https://vutech-api.onrender.com/v1/products/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Không tìm thấy sản phẩm hoặc lỗi Server');
        return res.json();
      })
      .then(data => {
        if (data.error) setErrorMessage(data.error);
        else setProduct(data);
      })
      .catch(err => {
        console.error("Lỗi lấy sản phẩm:", err);
        setErrorMessage('Không thể tải chi tiết sản phẩm. Vui lòng thử lại sau!');
      });

    const userStr = localStorage.getItem('user');
    if (userStr) setCurrentUser(JSON.parse(userStr));
  }, [id]);

  // --- HÀM TĂNG GIẢM SỐ LƯỢNG (Không cho giảm dưới 1) ---
  const handleDecrease = () => {
    if (quantity > 1) setQuantity(q => q - 1);
  };
  const handleIncrease = () => {
    setQuantity(q => q + 1);
  };

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
          productId: id,
          quantity: quantity, // <-- GỬI LÊN SERVER ĐÚNG SỐ LƯỢNG KHÁCH CHỌN
        }),
      });

      if (response.ok) {
        setStatus(`✅ Đã thêm ${quantity} sản phẩm vào giỏ!`);
        setTimeout(() => setStatus(''), 2500);
      } else {
        setStatus('❌ Lỗi khi thêm');
      }
    } catch (error) {
      setStatus('❌ Lỗi kết nối!');
    }
  };

  if (errorMessage) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <h1 className="text-2xl font-bold text-red-500">❌ OOPS! CÓ LỖI XẢY RA</h1>
        <p className="text-gray-600">{errorMessage}</p>
        <button onClick={() => router.push('/')} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700">
          ← Về trang chủ
        </button>
      </div>
    );
  }

  if (!product) return <div className="min-h-screen flex items-center justify-center font-bold text-2xl text-gray-500">Đang tải sản phẩm... ⏳</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans">
      {status && (
        <div className="fixed top-5 right-5 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-2xl z-50 animate-bounce font-medium">
          {status}
        </div>
      )}

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 bg-white p-8 rounded-3xl shadow-lg border">
        <div className="rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center border p-4">
          <img 
            src={product.image_url || 'https://via.placeholder.com/500'} 
            alt={product.name} 
            className="w-full h-auto max-h-[500px] object-contain hover:scale-105 transition-transform duration-500" 
          />
        </div>

        <div className="flex flex-col justify-center gap-6">
          <button 
            onClick={() => router.back()} 
            className="text-blue-600 font-bold hover:underline w-fit flex items-center gap-2"
          >
            ← Quay lại cửa hàng
          </button>
          
          <h1 className="text-4xl font-black text-slate-800 leading-tight">{product.name}</h1>
          
          <div className="flex items-center gap-4">
            <span className="text-4xl font-black text-red-600">
              {Number(product.price).toLocaleString('vi-VN')} đ
            </span>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm font-bold border border-green-200">
              Còn hàng
            </span>
          </div>

          <div className="p-4 bg-blue-50 rounded-xl border-l-4 border-blue-500 text-slate-700">
            Mã sản phẩm (SKU): <span className="font-mono font-bold text-blue-700">{product.sku}</span>
          </div>

          <p className="text-slate-500 text-lg leading-relaxed border-b pb-6">
            Sản phẩm công nghệ chính hãng tại <strong className="text-slate-800">Shop Công Nghệ Vũ Tech</strong>. 
            Cam kết chất lượng tốt nhất, hỗ trợ kỹ thuật 24/7 và giao hàng siêu tốc.
          </p>

          {/* --- KHU VỰC CHỌN SỐ LƯỢNG --- */}
          <div className="flex items-center gap-6 mt-2">
            <span className="font-bold text-slate-600 text-lg">Số lượng:</span>
            <div className="flex items-center border-2 border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm">
              <button 
                onClick={handleDecrease}
                className="px-5 py-2 text-2xl font-bold text-gray-500 hover:bg-gray-100 hover:text-red-500 transition active:bg-gray-200"
              >
                -
              </button>
              <span className="px-6 py-2 font-black text-slate-800 border-x-2 border-gray-200 w-16 text-center text-xl">
                {quantity}
              </span>
              <button 
                onClick={handleIncrease}
                className="px-5 py-2 text-2xl font-bold text-gray-500 hover:bg-gray-100 hover:text-green-600 transition active:bg-gray-200"
              >
                +
              </button>
            </div>
          </div>

          <button 
            onClick={handleAddToCart}
            className="bg-blue-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-blue-700 shadow-xl active:scale-95 transition-all mt-2 flex items-center justify-center gap-3"
          >
            🛒 THÊM VÀO GIỎ HÀNG NGAY
          </button>
        </div>
      </div>
    </div>
  );
}