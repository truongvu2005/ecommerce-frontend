'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const router = useRouter();

  // Tách hàm load giỏ hàng ra và nhận vào userId động
  const loadCart = (userId: string) => {
    fetch(`http://localhost:3000/v1/cart/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setCart(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi lấy giỏ hàng:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    // 1. Kiểm tra xem user đã đăng nhập chưa
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      // Nếu chưa đăng nhập, đá văng về trang login luôn
      alert('Vui lòng đăng nhập để xem giỏ hàng nhé!');
      router.push('/login');
      return;
    }

    // 2. Nếu đã đăng nhập, lấy ID và gọi API giỏ hàng
    const user = JSON.parse(userStr);
    setCurrentUser(user);
    loadCart(user.id);
  }, [router]);

  const handleRemoveItem = async (productId: string) => {
    if (!cart || !cart.cartId || !currentUser) return;
    if (!confirm('Bạn có chắc muốn bỏ sản phẩm này khỏi giỏ?')) return;

    try {
      const res = await fetch(`http://localhost:3000/v1/cart/${cart.cartId}/product/${productId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        loadCart(currentUser.id); // Gọi lại giỏ hàng với ID thật
      } else {
        alert('❌ Lỗi không thể xóa!');
      }
    } catch (error) {
      alert('❌ Lỗi kết nối!');
    }
  };

  const handleCheckout = async () => {
    if (!cart || !cart.cartId || !currentUser) return;
    setIsCheckingOut(true);

    try {
      const response = await fetch('http://localhost:3000/v1/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id, // DÙNG ID THẬT CỦA BẠN!
          cartId: cart.cartId,
          shippingAddress: "123 Đường Điện Biên Phủ, Đà Nẵng",
          paymentMethod: "VNPAY"
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('🎉 Đặt hàng thành công! Mã đơn: ' + data.orderId);
        if (data.paymentUrl) {
          window.location.href = data.paymentUrl;
        } else {
          loadCart(currentUser.id); 
          setIsCheckingOut(false);
        }
      } else {
        alert('❌ Lỗi: ' + data.error);
        setIsCheckingOut(false);
      }
    } catch (error) {
      alert('❌ Lỗi kết nối!');
      setIsCheckingOut(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-2xl font-bold text-gray-500">Đang tải giỏ hàng... ⏳</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-10 font-sans">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-extrabold mb-8 text-gray-800 border-b pb-4">🛒 Giỏ hàng của {currentUser?.full_name}</h1>
        
        {!cart || !cart.items || cart.items.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 text-xl mb-4">Giỏ hàng của bạn đang trống.</p>
          </div>
        ) : (
          <div>
            <div className="space-y-6">
              {cart.items.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-800">{item.name}</h2>
                    <p className="text-gray-500 mt-1">Đơn giá: {Number(item.unitPrice).toLocaleString('vi-VN')} đ</p>
                  </div>
                  <div className="text-right flex items-center gap-6">
                    <div>
                      <p className="text-sm font-bold text-gray-800 bg-gray-200 px-3 py-1 rounded-md mb-1 inline-block">SL: {item.quantity}</p>
                      <p className="text-blue-600 font-black text-lg block">{Number(item.subTotal).toLocaleString('vi-VN')} đ</p>
                    </div>
                    <button onClick={() => handleRemoveItem(item.productId)} className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors font-bold text-sm">
                      ❌ Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-6 border-t-2 border-gray-200 flex justify-between items-center">
              <span className="text-2xl font-bold text-gray-500">Tổng thanh toán:</span>
              <span className="text-4xl font-black text-red-500">{Number(cart.totalPrice).toLocaleString('vi-VN')} đ</span>
            </div>

            <button onClick={handleCheckout} disabled={isCheckingOut} className={`w-full mt-8 text-white py-4 rounded-xl text-xl font-bold transition-all flex justify-center items-center gap-2 ${isCheckingOut ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 shadow-lg active:scale-95'}`}>
              {isCheckingOut ? '⏳ Đang xử lý...' : '💳 Chốt đơn & Thanh toán'}
            </button>
          </div>
        )}
        
        <div className="mt-8 text-center">
          <Link href="/" className="text-blue-500 hover:text-blue-700 font-semibold text-lg flex items-center justify-center gap-1">← Quay lại mua sắm thêm</Link>
        </div>
      </div>
    </div>
  );
}