'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 1. Kiểm tra đăng nhập
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      alert('Vui lòng đăng nhập để xem lịch sử đơn hàng!');
      router.push('/login');
      return;
    }

    // 2. Lấy ID thật gọi API
    const user = JSON.parse(userStr);
    
    fetch(`http://localhost:3000/v1/orders/${user.id}`)
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-2xl font-bold text-gray-500">Đang tải lịch sử... ⏳</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-10 font-sans">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-extrabold mb-8 text-gray-800 border-b pb-4">📦 Lịch sử đơn hàng</h1>
        
        {orders.length === 0 ? (
          <p className="text-gray-500 text-xl text-center">Bạn chưa có đơn hàng nào.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order: any) => (
              <div key={order.id} className="border-2 border-gray-100 rounded-xl p-5 flex justify-between items-center bg-gray-50 hover:shadow-md transition">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Mã đơn: <span className="font-mono text-gray-800">{order.id}</span></p>
                  <p className="text-gray-500 text-sm">Ngày đặt: {new Date(order.created_at).toLocaleString('vi-VN')}</p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {order.status}
                  </span>
                  <p className="text-2xl font-black text-red-500 mt-2">
                    {Number(order.total_amount).toLocaleString('vi-VN')} đ
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-8 text-center">
          <Link href="/" className="text-blue-500 hover:text-blue-700 font-semibold text-lg flex items-center justify-center gap-1">← Về trang chủ</Link>
        </div>
      </div>
    </div>
  );
}