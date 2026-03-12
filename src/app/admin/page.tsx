'use client';
import { useState, useEffect } from 'react';

export default function AdminPage() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State cho Form Sản phẩm (Dùng chung cho cả Thêm và Sửa)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [sku, setSku] = useState('');
  const [imageUrl, setImageUrl] = useState(''); 
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        fetch('https://vutech-api.onrender.com/v1/admin/orders'),
        fetch('https://vutech-api.onrender.com/v1/products')
      ]);
      setOrders(await ordersRes.json());
      setProducts(await productsRes.json());
      setLoading(false);
    } catch (error) {
      console.error('Lỗi lấy dữ liệu:', error);
      setLoading(false);
    }
  };

  // --- HÀM XỬ LÝ LƯU (THÊM HOẶC SỬA) ---
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      let finalImageUrl = imageUrl;

      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        const uploadRes = await fetch('https://vutech-api.onrender.com/v1/admin/upload', {
          method: 'POST', body: formData,
        });
        const uploadData = await uploadRes.json();
        finalImageUrl = uploadData.imageUrl;
      }

      const url = editingId 
        ? `https://vutech-api.onrender.com/v1/admin/products/${editingId}`
        : 'https://vutech-api.onrender.com/v1/admin/products';
      const method = editingId ? 'PUT' : 'POST';

      const productRes = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku, name, price: Number(price), image_url: finalImageUrl }),
      });

      if (productRes.ok) {
        alert(editingId ? '✅ Cập nhật sản phẩm thành công!' : '🎉 Thêm sản phẩm mới thành công!');
        resetForm();
        fetchData(); 
      } else {
        // Đọc lỗi chi tiết từ Backend trả về
        const errorData = await productRes.json(); 
        alert(`❌ Lỗi từ server: ${errorData.error}`);
      }
    } catch (error) {
      alert('❌ Lỗi kết nối!');
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditClick = (product: any) => {
    setEditingId(product.id);
    setName(product.name);
    setPrice(product.price.toString());
    setSku(product.sku);
    setImageUrl(product.image_url);
    setImageFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('⚠️ Bạn có chắc chắn muốn xóa sản phẩm này khỏi cửa hàng?')) return;
    try {
      const res = await fetch(`https://vutech-api.onrender.com/v1/admin/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('🗑️ Đã xóa sản phẩm!');
        fetchData(); 
      }
    } catch (error) {
      alert('❌ Lỗi khi xóa!');
    }
  };

  const resetForm = () => {
    setEditingId(null); setName(''); setPrice(''); setSku(''); setImageUrl(''); setImageFile(null);
  };

  if (loading) return <div className="p-10 text-center font-bold text-white text-2xl">Đang tải dữ liệu hệ thống... ⏳</div>;

  return (
    <div className="min-h-screen bg-slate-900 p-8 text-white font-sans">
      <div className="max-w-7xl mx-auto flex flex-col gap-12">
        
        <h1 className="text-4xl font-black text-center flex items-center justify-center gap-3">
          👨‍💻 TRUNG TÂM QUẢN TRỊ VUTECH
        </h1>

        {/* --- FORM THÊM/SỬA SẢN PHẨM --- */}
        <div className="bg-white text-slate-800 p-8 rounded-2xl shadow-2xl">
          <div className="flex justify-between items-center mb-6 border-b pb-2">
            <h2 className="text-2xl font-bold">
              {editingId ? '✏️ Cập nhật sản phẩm' : '📦 Thêm sản phẩm mới'}
            </h2>
            {editingId && (
              <button onClick={resetForm} className="text-sm bg-gray-200 px-3 py-1 rounded text-gray-700 font-bold hover:bg-gray-300">
                Hủy Sửa (Trở về Thêm Mới)
              </button>
            )}
          </div>
          <form onSubmit={handleSaveProduct} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-sm text-gray-500">Tên sản phẩm</label>
              <input type="text" className="p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-400" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-sm text-gray-500">Giá tiền (VNĐ)</label>
              <input type="number" className="p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-400" value={price} onChange={e => setPrice(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-sm text-gray-500">Mã SKU</label>
              <input type="text" className="p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-400" value={sku} onChange={e => setSku(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-sm text-gray-500">
                {editingId ? 'Ảnh mới (Bỏ trống nếu giữ cũ)' : 'Hình ảnh'}
              </label>
              <input type="file" accept="image/*" className="p-2 border border-dashed rounded-lg cursor-pointer text-sm h-[50px]" onChange={e => setImageFile(e.target.files?.[0] || null)} required={!editingId && !imageUrl} />
            </div>
            <button type="submit" disabled={isUploading} className={`md:col-span-2 lg:col-span-4 py-4 rounded-xl text-white font-bold text-lg transition-all ${isUploading ? 'bg-gray-400' : editingId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700 shadow-lg'}`}>
              {isUploading ? '⏳ Đang xử lý...' : editingId ? '💾 LƯU CẬP NHẬT' : '🚀 ĐĂNG SẢN PHẨM LÊN KỆ'}
            </button>
          </form>
        </div>

        {/* --- BẢNG QUẢN LÝ SẢN PHẨM --- */}
        <div className="bg-white text-slate-800 rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-6 bg-slate-100 border-b">
            <h3 className="font-black text-xl text-slate-700">📱 KHO SẢN PHẨM</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 uppercase text-sm font-bold text-slate-500 border-b">
                  <th className="p-5">Sản phẩm</th>
                  <th className="p-5 text-center">Mã SKU</th>
                  <th className="p-5 text-right">Giá bán</th>
                  <th className="p-5 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product: any) => (
                  <tr key={product.id} className="border-b hover:bg-slate-50 transition-colors">
                    <td className="p-5 flex items-center gap-4">
                      <img src={product.image_url || 'https://via.placeholder.com/50'} className="w-14 h-14 rounded-lg object-cover border shadow-sm" alt="img" />
                      <p className="font-bold text-slate-800">{product.name}</p>
                    </td>
                    <td className="p-5 text-center text-slate-500 font-mono">{product.sku}</td>
                    <td className="p-5 text-right font-black text-red-500">
                      {Number(product.price).toLocaleString()} đ
                    </td>
                    <td className="p-5 text-center">
                      <div className="flex justify-center gap-3">
                        <button onClick={() => handleEditClick(product)} className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 font-bold text-sm transition">Sửa</button>
                        <button onClick={() => handleDeleteProduct(product.id)} className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 font-bold text-sm transition">Xóa</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- BẢNG QUẢN LÝ ĐƠN HÀNG (FULL 5 CỘT NHƯ CŨ) --- */}
        <div className="bg-white text-slate-800 rounded-2xl shadow-2xl overflow-hidden mb-10">
          <div className="p-6 bg-slate-100 border-b">
            <h3 className="font-black text-xl text-slate-700">📦 DANH SÁCH ĐƠN HÀNG</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50 uppercase text-sm font-bold text-slate-500 border-b">
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
                        {/* Nhãn trạng thái */}
                        <span className={`px-3 py-1 rounded-full font-bold text-[10px] uppercase shadow-sm w-fit ${
                          order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 
                          order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' :
                          order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {order.status}
                        </span>

                        {/* Ô select đổi trạng thái */}
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
                                fetchData(); // Fetch lại thay vì reload trang
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
    </div>
  );
}