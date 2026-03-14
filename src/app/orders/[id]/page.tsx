'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params?.id;
  const router = useRouter();
  
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    
    // Gọi cái API sếp vừa thêm ở Backend
    fetch(`https://vutech-api.onrender.com/v1/orders/detail/${orderId}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          alert(data.error);
          router.push('/orders');
        } else {
          setOrderData(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Lỗi:", err);
        setLoading(false);
      });
  }, [orderId, router]);

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

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-500">Đang tải chi tiết đơn hàng... ⏳</div>;
  if (!orderData) return null;

  const { order, items } = orderData;

  return (
    <main className="max-w-4xl mx-auto px-6 py-12 w-full animate-fade-in">
      <div className="mb-8">
        <button onClick={() => router.back()} className="text-blue-600 font-bold hover:underline flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm w-fit border border-gray-100">
          ← Quay lại danh sách
        </button>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-6 mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800">Chi tiết đơn hàng</h1>
            <p className="text-slate-500 font-mono mt-1">Mã: #{order.id.toUpperCase()}</p>
          </div>
          <div className="text-right">
            <span className="px-4 py-2 rounded-full text-sm font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {getStatusText(order.status)}
            </span>
            <p className="text-slate-500 text-sm mt-3">Ngày đặt: {new Date(order.created_at).toLocaleString('vi-VN')}</p>
          </div>
        </div>

        {/* Thông tin giao hàng */}
        <div className="bg-slate-50 p-6 rounded-2xl mb-8">
          <h3 className="font-bold text-slate-800 mb-2">📍 Địa chỉ nhận hàng</h3>
          <p className="text-slate-600">{order.shipping_address}</p>
        </div>

        {/* Danh sách sản phẩm */}
        <h3 className="font-bold text-slate-800 mb-4 text-lg">Sản phẩm đã mua</h3>
        <div className="space-y-4">
          {items.map((item: any, index: number) => (
            <div key={index} className="flex items-center gap-4 p-4 border rounded-2xl hover:bg-slate-50 transition">
              <div className="w-20 h-20 bg-white border rounded-xl flex items-center justify-center p-2 overflow-hidden">
                <img src={item.image_url || 'https://via.placeholder.com/150'} alt={item.name} className="object-contain" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-800 line-clamp-1">{item.name}</h4>
                <p className="text-slate-500 text-sm mt-1">Số lượng: x{item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-red-600">{(Number(item.unit_price) * item.quantity).toLocaleString('vi-VN')} đ</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tổng tiền */}
        <div className="mt-8 pt-6 border-t flex justify-between items-center">
          <span className="text-lg font-bold text-slate-600">Thành tiền:</span>
          <span className="text-3xl font-black text-red-600">{Number(order.total_amount).toLocaleString('vi-VN')} đ</span>
        </div>
      </div>
    </main>
  );
}