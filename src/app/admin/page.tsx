'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Gọi API lấy TẤT CẢ đơn hàng khi vừa vào trang
  const fetchOrders = () => {
    fetch('http://localhost:3000/v1/admin/orders')
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Hàm gọi API cập nhật trạng thái
  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`http://localhost:3000/v1/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        alert('✅ Đã cập nhật trạng thái thành: ' + newStatus);
        fetchOrders(); // Tải lại danh sách sau khi cập nhật thành công
      } else {
        alert('❌ Lỗi cập nhật!');
      }
    } catch (error) {
      alert('❌ Lỗi kết nối!');
    }
  };

  if (loading) return <div className="p-10 text-center text-xl font-bold">Đang tải dữ liệu quản trị...</div>;

  return (
    <div className="min-h-screen bg-gray-900 p-10 font-sans text-gray-800">
      <div className="max-w-7xl mx-auto bg-white p-8 rounded-2xl shadow-2xl">
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <h1 className="text-3xl font-black text-blue-900">👨‍💻 TRANG QUẢN TRỊ SHOP</h1>
          <Link href="/" className="text-blue-500 hover:underline font-bold">← Về trang khách hàng</Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Mã Đơn</th>
                <th className="py-3 px-6 text-left">Khách Hàng</th>
                <th className="py-3 px-6 text-center">Tổng Tiền</th>
                <th className="py-3 px-6 text-center">Ngày Đặt</th>
                <th className="py-3 px-6 text-center">Trạng Thái</th>
                <th className="py-3 px-6 text-center">Hành Động</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm font-medium">
              {orders.map((order: any) => (
                <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                  <td className="py-4 px-6 font-mono text-xs">{order.id.split('-')[0]}...</td>
                  <td className="py-4 px-6">
                    <p className="font-bold text-gray-900">{order.full_name}</p>
                    <p className="text-xs text-gray-500">{order.email}</p>
                  </td>
                  <td className="py-4 px-6 text-center font-bold text-red-600">
                    {Number(order.total_amount).toLocaleString('vi-VN')} đ
                  </td>
                  <td className="py-4 px-6 text-center text-gray-500">
                    {new Date(order.created_at).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 
                      order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' : 
                      'bg-green-100 text-green-700'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <select 
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      value={order.status}
                      onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                    >
                      <option value="PENDING">Chờ xử lý (PENDING)</option>
                      <option value="SHIPPED">Đang giao (SHIPPED)</option>
                      <option value="COMPLETED">Hoàn thành (COMPLETED)</option>
                      <option value="CANCELLED">Hủy đơn (CANCELLED)</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}