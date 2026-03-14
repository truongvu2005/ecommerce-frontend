'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      alert('Vui lòng đăng nhập để xem đơn hàng!');
      router.push('/login');
      return;
    }
    
    const user = JSON.parse(userStr);
    setCurrentUser(user);

    // Gọi API lấy lịch sử đơn hàng của đúng user đang đăng nhập
    fetch(`https://vutech-api.onrender.com/v1/orders/${user.id}`)
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Lỗi lấy đơn hàng:', err);
        setLoading(false);
      });
  }, [router]);

  // Hàm "độ" màu sắc cho từng trạng thái đơn hàng
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'PROCESSING': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'SHIPPED': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'COMPLETED': return 'bg-green-100 text-green-700 border-green-200';
      case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Hàm dịch tiếng Anh sang tiếng Việt cho khách dễ hiểu
  const getStatusText = (status: string) => {
    switch(status) {
      case 'PENDING': return '⏳ Chờ xác nhận';
      case 'PROCESSING': return '📦 Đang đóng gói';
      case 'SHIPPED': return '🚚 Đang giao hàng';
      case 'COMPLETED': return '✅ Đã nhận hàng';
      case 'CANCELLED': return '❌ Đã hủy';
      default: return status;
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-xl text-slate-500 bg-gray-50">Đang tải lịch sử đơn hàng... ⏳</div>;

  return (
    <main className="max-w-5xl mx-auto px-6 py-12 w-full animate-fade-in min-h-screen">
      
      {/* --- Tiêu đề trang --- */}
      <div className="flex items-center gap-4 mb-10 border-b pb-6">
        <Link href="/" className="text-slate-400 hover:text-blue-600 transition bg-white p-3 rounded-full shadow-sm hover:shadow-md border">
          ← Trở về
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-800">Lịch sử đơn hàng</h1>
          <p className="text-slate-500 mt-1">Theo dõi các đơn hàng bạn đã đặt tại Vũ Tech Shop</p>
        </div>
      </div>

      {/* --- Danh sách đơn hàng --- */}
      {orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order: any) => (
            <div key={order.id} className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  {/* Mã đơn hàng cắt ngắn cho đẹp */}
                  <span className="font-bold text-slate-800 text-lg">Mã đơn: <span className="font-mono text-blue-600">#{order.id.substring(0, 8).toUpperCase()}</span></span>
                  
                  {/* Nhãn trạng thái */}
                  <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>
                
                <div className="text-slate-500 text-sm flex items-center gap-2">
                  <span>📅 Ngày đặt:</span>
                  <span className="font-medium text-slate-700">
                    {new Date(order.created_at).toLocaleString('vi-VN')}
                  </span>
                </div>
              </div>

              <div className="flex flex-col md:items-end gap-2 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
                <span className="text-slate-500 text-sm">Tổng thanh toán</span>
                <span className="text-2xl font-black text-red-600">
                  {Number(order.total_amount).toLocaleString('vi-VN')} đ
                </span>
                <Link href={`/orders/${order.id}`} className="mt-2 text-blue-600 text-sm font-bold hover:underline bg-blue-50 px-4 py-2 rounded-lg transition-colors hover:bg-blue-100 w-full md:w-auto text-center block">
                  Xem chi tiết
                </Link>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
          <p className="text-5xl mb-4">🛒</p>
          <h3 className="text-2xl font-bold text-slate-700 mb-2">Bạn chưa có đơn hàng nào</h3>
          <p className="text-slate-500 mb-6">Hãy dạo quanh cửa hàng và chọn cho mình những món đồ ưng ý nhé.</p>
          <Link href="/products" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition inline-block">
            Bắt đầu mua sắm
          </Link>
        </div>
      )}
    </main>
  );
}