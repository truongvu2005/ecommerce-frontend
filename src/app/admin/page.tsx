'use client';
import { useState, useEffect } from 'react';

export default function AdminPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State cho Form thêm sản phẩm
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [sku, setSku] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetch('https://vutech-api.onrender.com/v1/admin/orders')
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      });
  }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      let imageUrl = '';

      // 1. Nếu có chọn file ảnh, gọi API upload lên Cloudinary trước
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);

        const uploadRes = await fetch('https://vutech-api.onrender.com/v1/admin/upload', {
          method: 'POST',
          body: formData,
        });
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.imageUrl;
      }

      // 2. Sau khi có Link ảnh (hoặc không), gọi API lưu sản phẩm vào DB
      const productRes = await fetch('https://vutech-api.onrender.com/v1/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku,
          name,
          price: Number(price),
          image_url: imageUrl
        }),
      });

      if (productRes.ok) {
        alert('🎉 Thêm sản phẩm kèm ảnh thật thành công!');
        // Reset form
        setName(''); setPrice(''); setSku(''); setImageFile(null);
      }
    } catch (error) {
      alert('❌ Lỗi xử lý!');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8 text-white font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black mb-10 text-center flex items-center justify-center gap-3">
          👨‍💻 TRANG QUẢN TRỊ SHOP
        </h1>

        {/* --- FORM THÊM SẢN PHẨM MỚI --- */}
        <div className="bg-white text-slate-800 p-8 rounded-2xl shadow-2xl mb-12">
          <h2 className="text-2xl font-bold mb-6 border-b pb-2">📦 Thêm sản phẩm mới</h2>
          <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input type="text" placeholder="Tên sản phẩm (VD: Bàn phím cơ)" className="p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-400" value={name} onChange={e => setName(e.target.value)} required />
            <input type="number" placeholder="Giá tiền (VNĐ)" className="p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-400" value={price} onChange={e => setPrice(e.target.value)} required />
            <input type="text" placeholder="Mã SKU (VD: BP-001)" className="p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-400" value={sku} onChange={e => setSku(e.target.value)} required />
            
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-sm text-gray-500">Chọn hình ảnh sản phẩm:</label>
              <input type="file" accept="image/*" className="p-2 border border-dashed rounded-lg cursor-pointer" onChange={e => setImageFile(e.target.files?.[0] || null)} />
            </div>

            <button type="submit" disabled={isUploading} className={`md:col-span-2 py-4 rounded-xl text-white font-bold text-lg transition-all ${isUploading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-lg'}`}>
              {isUploading ? '正在上传 (Đang tải ảnh lên mây...)' : '🚀 ĐĂNG SẢN PHẨM LÊN KỆ'}
            </button>
          </form>
        </div>

        {/* --- DANH SÁCH ĐƠN HÀNG (GIỮ NGUYÊN) --- */}
        <div className="bg-white text-slate-800 rounded-2xl shadow-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 uppercase text-sm font-bold text-slate-500">
                <th className="p-5">Mã đơn</th>
                <th className="p-5">Khách hàng</th>
                <th className="p-5 text-right">Tổng tiền</th>
                <th className="p-5 text-center">Ngày đặt</th>
                <th className="p-5 text-center">Hành động & Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: any) => (
                <tr key={order.id} className="border-b hover:bg-slate-50 transition-colors">
                  <td className="p-5 font-mono text-xs text-slate-400">
                    {order.id.substring(0, 8)}...
                  </td>
                  <td className="p-5">
                    <p className="font-bold text-slate-800">{order.full_name}</p>
                    <p className="text-xs text-slate-400">{order.email}</p>
                  </td>
                  <td className="p-5 text-right font-black text-red-500">
                    {Number(order.total_amount).toLocaleString('vi-VN')} đ
                  </td>
                  <td className="p-5 text-center text-slate-500 text-sm">
                    {new Date(order.created_at).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="p-5">
                    <div className="flex flex-col items-center gap-2">
                      {/* Badge hiển thị trạng thái hiện tại */}
                      <span className={`px-3 py-1 rounded-full font-bold text-[10px] uppercase shadow-sm ${
                        order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 
                        order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.status}
                      </span>

                      {/* Ô chọn để cập nhật (giữ nguyên logic fetch của bạn) */}
                      <select 
                        className="text-xs p-2 border rounded-lg bg-white font-semibold outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer shadow-sm"
                        value={order.status}
                        onChange={async (e) => {
                          const newStatus = e.target.value;
                          try {
                            const res = await fetch(`https://vutech-api.onrender.com/v1/admin/orders/${order.id}/status`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ status: newStatus })
                            });
                            if (res.ok) {
                              alert('✅ Đã cập nhật trạng thái đơn hàng!');
                              window.location.reload(); 
                            }
                          } catch (err) {
                            alert('❌ Lỗi kết nối server!');
                          }
                        }}
                      >
                        <option value="PENDING">Đang chờ (PENDING)</option>
                        <option value="SHIPPED">Đang giao (SHIPPED)</option>
                        <option value="COMPLETED">Hoàn thành (COMPLETED)</option>
                        <option value="CANCELLED">Hủy đơn (CANCELLED)</option>
                      </select>
                    </div>
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