'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CartPage() {
  const [cartInfo, setCartInfo] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setCurrentUser(user);
      fetchCart(user.id);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCart = async (userId: string) => {
    try {
      const res = await fetch(`https://vutech-api.onrender.com/v1/cart/${userId}`);
      const data = await res.json();
      setCartInfo(data);
    } catch (error) {
      console.error('Lỗi lấy giỏ hàng:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- SỬA LỖI 1: HÀM XÓA SẢN PHẨM ---
  const handleDeleteItem = async (productId: string) => {
    if (!cartInfo?.cartId) return;
    
    // Gửi đúng cartId và productId lên API
    try {
      const res = await fetch(`https://vutech-api.onrender.com/v1/cart/${cartInfo.cartId}/product/${productId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        alert('🗑️ Đã xóa sản phẩm khỏi giỏ!');
        fetchCart(currentUser.id); // Load lại giỏ hàng ngay lập tức
      } else {
        alert('❌ Lỗi khi xóa!');
      }
    } catch (error) {
      alert('❌ Lỗi kết nối!');
    }
  };

  // --- SỬA LỖI 2 & 3: HÀM THANH TOÁN VÀ CHUYỂN HƯỚNG VNPAY ---
  const handleCheckout = async () => {
    if (!cartInfo?.cartId || !currentUser) return;
    
    try {
      // Gửi ĐẦY ĐỦ 4 thông tin bắt buộc cho Backend
      const res = await fetch('https://vutech-api.onrender.com/v1/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          cartId: cartInfo.cartId,
          shippingAddress: 'Địa chỉ mặc định (Bạn có thể làm form nhập sau)', 
          paymentMethod: 'VNPAY' // BẮT BUỘC có cái này để lấy link
        })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        alert('🎉 Chốt đơn thành công! Đang chuyển hướng sang cổng thanh toán...');
        
        // Điều hướng sang trang VNPay mà Backend trả về
        if (data.paymentUrl) {
          window.location.href = data.paymentUrl;
        } else {
          // Nếu lỡ không có link thì cho về lịch sử đơn hàng
          window.location.href = '/orders'; 
        }
      } else {
        alert(`❌ Lỗi thanh toán: ${data.error}`);
      }
    } catch (error) {
      alert('❌ Lỗi kết nối khi thanh toán!');
    }
  };

  if (loading) return <div className="p-10 text-center text-xl font-bold">Đang tải giỏ hàng... ⏳</div>;
  if (!currentUser) return <div className="p-10 text-center font-bold">Vui lòng <Link href="/login" className="text-blue-600 underline">đăng nhập</Link> để xem giỏ hàng!</div>;
  if (!cartInfo || cartInfo.items?.length === 0) return <div className="p-10 text-center font-bold text-xl">Giỏ hàng của bạn đang trống! 🍃<br/><Link href="/" className="text-blue-600 underline mt-4 inline-block">← Đi mua sắm ngay</Link></div>;

  return (
    <div className="min-h-screen bg-gray-50 p-10 font-sans">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-black mb-8 border-b pb-4 text-slate-800">🛒 Giỏ hàng của {currentUser.full_name}</h1>
        
        <div className="flex flex-col gap-4 mb-8">
          {cartInfo.items.map((item: any) => (
            <div key={item.productId} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border hover:shadow-md transition">
              <div>
                <h3 className="font-bold text-xl text-slate-800">{item.name}</h3>
                <p className="text-gray-500 font-medium mt-1">Đơn giá: {Number(item.unitPrice).toLocaleString()} đ</p>
              </div>
              <div className="flex items-center gap-6">
                <span className="font-bold text-sm bg-gray-200 px-3 py-1 rounded-md text-slate-700">SL: {item.quantity}</span>
                <span className="font-black text-blue-600 text-xl w-32 text-right">{Number(item.subTotal).toLocaleString()} đ</span>
                <button 
                  onClick={() => handleDeleteItem(item.productId)}
                  className="text-red-500 font-bold hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg transition"
                >
                  ❌ Xóa
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center border-t-2 pt-6 mb-8">
          <span className="text-2xl font-bold text-gray-600">Tổng thanh toán:</span>
          <span className="text-4xl font-black text-red-600">{Number(cartInfo.totalPrice).toLocaleString()} đ</span>
        </div>

        <button 
          onClick={handleCheckout}
          className="w-full bg-[#00a65a] text-white py-5 rounded-2xl font-black text-2xl hover:bg-[#008d4c] transition-all shadow-lg hover:shadow-xl active:scale-95"
        >
          💳 CHỐT ĐƠN & THANH TOÁN (VNPAY)
        </button>

        <div className="text-center mt-8">
          <Link href="/" className="text-blue-600 font-bold hover:underline">← Quay lại mua sắm thêm</Link>
        </div>
      </div>
    </div>
  );
}