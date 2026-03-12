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
  const [imageUrl, setImageUrl] = useState(''); // Lưu link ảnh cũ nếu không đổi ảnh mới
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
      const ordersData = await ordersRes.json();
      const productsData = await productsRes.json();
      setOrders(ordersData);
      setProducts(productsData);
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
      let finalImageUrl = imageUrl; // Mặc định dùng link cũ

      // 1. Nếu có chọn ảnh mới, upload lên Cloudinary trước
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        const uploadRes = await fetch('https://vutech-api.onrender.com/v1/admin/upload', {
          method: 'POST',
          body: formData,
        });
        const uploadData = await uploadRes.json();
        finalImageUrl = uploadData.imageUrl;
      }

      // 2. Gửi API (Dùng POST nếu thêm mới, PUT nếu đang sửa)
      const url = editingId 
        ? `https://vutech-api.onrender.com/v1/admin/products/${editingId}`
        : 'https://vutech-api.onrender.com/v1/admin/products';
      
      const method = editingId ? 'PUT' : 'POST';

      const productRes = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku, name, price: Number(price), image_url: finalImageUrl
        }),
      });

      if (productRes.ok) {
        alert(editingId ? '✅ Cập nhật sản phẩm thành công!' : '🎉 Thêm sản phẩm mới thành công!');
        resetForm();
        fetchData(); // Load lại bảng
      } else {
        alert('❌ Lỗi xử lý từ server!');
      }
    } catch (error) {
      alert('❌ Lỗi kết nối!');
    } finally {
      setIsUploading(false);
    }
  };

  // --- HÀM BẤM NÚT SỬA ---
  const handleEditClick = (product: any) => {
    setEditingId(product.id);
    setName(product.name);
    setPrice(product.price.toString());
    setSku(product.sku);
    setImageUrl(product.image_url);
    setImageFile(null); // Reset file ảnh mới
    // Cuộn lên form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- HÀM XÓA SẢN PHẨM ---
  const handleDeleteProduct = async (id: string) => {
    if (!confirm('⚠️ Bạn có chắc chắn muốn xóa sản phẩm này khỏi cửa hàng?')) return;
    
    try {
      const res = await fetch(`https://vutech-api.onrender.com/v1/admin/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('🗑️ Đã xóa sản phẩm!');
        fetchData(); // Load lại bảng
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
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-black mb-10 text-center flex items-center justify-center gap-3">
          👨‍💻 TRUNG TÂM QUẢN TRỊ VUTECH
        </h1>

        {/* --- FORM THÊM/SỬA SẢN PHẨM --- */}
        <div className="bg-white text-slate-800 p-8 rounded-2xl shadow-2xl mb-12">
          <div className="flex justify-between items-center mb-6 border-b pb-2">
            <h2 className="text-2xl font-bold">
              {editingId ? '✏️ Cập nhật sản phẩm' : '📦 Thêm sản phẩm mới'}
            </h2>
            {editingId && (
              <button onClick={resetForm} className="text-sm bg-gray-200 px-3 py-1 rounded text-gray-700 font-bold hover:bg-gray-300">
                Hủy Sửa (Thêm Mới)
              </button>
            )}
          </div>
          <form onSubmit={handleSaveProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input type="text" placeholder="Tên sản phẩm" className="p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-400" value={name} onChange={e => setName(e.target.value)} required />
            <input type="number" placeholder="Giá tiền (VNĐ)" className="p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-400" value={price} onChange={e => setPrice(e.target.value)} required />
            <input type="text" placeholder="Mã SKU (VD: BP-001)" className="p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-400" value={sku} onChange={e => setSku(e.target.value)} required />
            
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-sm text-gray-500">
                {editingId ? 'Chọn ảnh mới (Bỏ trống nếu giữ ảnh cũ):' : 'Chọn hình ảnh sản phẩm:'}
              </label>
              <input type="file" accept="image/*" className="p-2 border border-dashed rounded-lg cursor-pointer text-sm" onChange={e => setImageFile(e.target.files?.[0] || null)} required={!editingId && !imageUrl} />
            </div>

            <button type="submit" disabled={isUploading} className={`md:col-span-2 py-4 rounded-xl text-white font-bold text-lg transition-all ${isUploading ? 'bg-gray-400' : editingId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700 shadow-lg'}`}>
              {isUploading ? '⏳ Đang xử lý...' : editingId ? '💾 LƯU CẬP NHẬT' : '🚀 ĐĂNG SẢN PHẨM LÊN KỆ'}
            </button>
          </form>
        </div>

        {/* --- GRID 2 CỘT: DANH SÁCH SẢN PHẨM & ĐƠN HÀNG --- */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          
          {/* BẢNG SẢN PHẨM */}
          <div className="bg-white text-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[600px]">
            <div className="p-5 bg-slate-100 border-b">
              <h3 className="font-black text-lg text-slate-700">📱 KHO SẢN PHẨM</h3>
            </div>
            <div className="overflow-y-auto p-0 flex-1">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white shadow-sm">
                  <tr className="uppercase text-xs font-bold text-slate-500 border-b">
                    <th className="p-4">Sản phẩm</th>
                    <th className="p-4 text-right">Giá</th>
                    <th className="p-4 text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product: any) => (
                    <tr key={product.id} className="border-b hover:bg-slate-50">
                      <td className="p-4 flex items-center gap-3">
                        <img src={product.image_url || 'https://via.placeholder.com/50'} className="w-12 h-12 rounded object-cover border" alt="img" />
                        <div>
                          <p className="font-bold text-sm text-slate-800 line-clamp-1">{product.name}</p>
                          <p className="text-xs text-slate-400 font-mono">{product.sku}</p>
                        </div>
                      </td>
                      <td className="p-4 text-right font-black text-red-500 text-sm">
                        {Number(product.price).toLocaleString()} đ
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleEditClick(product)} className="bg-blue-100 text-blue-700 p-2 rounded hover:bg-blue-200 font-bold text-xs">Sửa</button>
                          <button onClick={() => handleDeleteProduct(product.id)} className="bg-red-100 text-red-700 p-2 rounded hover:bg-red-200 font-bold text-xs">Xóa</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* BẢNG ĐƠN HÀNG (Giữ form Slate cũ của bạn) */}
          <div className="bg-white text-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[600px]">
            <div className="p-5 bg-slate-100 border-b">
              <h3 className="font-black text-lg text-slate-700">📦 ĐƠN HÀNG MỚI</h3>
            </div>
            <div className="overflow-y-auto p-0 flex-1">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white shadow-sm">
                  <tr className="uppercase text-xs font-bold text-slate-500 border-b">
                    <th className="p-4">Khách hàng</th>
                    <th className="p-4 text-right">Tổng tiền</th>
                    <th className="p-4 text-center">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order: any) => (
                    <tr key={order.id} className="border-b hover:bg-slate-50">
                      <td className="p-4">
                        <p className="font-bold text-sm text-slate-800">{order.full_name}</p>
                        <p className="text-xs text-slate-400 font-mono">{order.id.substring(0, 6)}</p>
                      </td>
                      <td className="p-4 text-right font-black text-red-500 text-sm">
                        {Number(order.total_amount).toLocaleString()} đ
                      </td>
                      <td className="p-4 flex flex-col items-center gap-1">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                          order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 
                          order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' :
                          order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {order.status}
                        </span>
                        <select 
                          className="text-[10px] p-1 border rounded bg-white font-semibold outline-none cursor-pointer"
                          value={order.status}
                          onChange={async (e) => {
                            try {
                              await fetch(`https://vutech-api.onrender.com/v1/admin/orders/${order.id}/status`, {
                                method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: e.target.value })
                              });
                              fetchData(); // Load lại ngay
                            } catch (err) {}
                          }}
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}