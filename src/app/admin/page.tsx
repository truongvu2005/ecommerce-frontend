'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); // State mới chứa danh mục
  const [loading, setLoading] = useState(true);
  
  // State cho Form Sản phẩm
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [sku, setSku] = useState('');
  const [categoryId, setCategoryId] = useState(''); // State mới chứa ID danh mục đang chọn
  const [imageUrl, setImageUrl] = useState(''); 
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.role === 'admin' || user.role === 'ADMIN') { // Thêm check chữ HOA cho chắc
        setIsAdmin(true);
        fetchData(); 
      } else {
        alert('⛔ CẢNH BÁO: Bạn không có quyền truy cập khu vực quản trị!');
        router.push('/');
      }
    } else {
      alert('Vui lòng đăng nhập để tiếp tục!');
      router.push('/login');
    }
  }, [router]);

  const fetchData = async () => {
    try {
      // Bắn 3 API cùng lúc cho lẹ: Đơn hàng, Sản phẩm, Danh mục
      const [ordersRes, productsRes, categoriesRes] = await Promise.all([
        fetch('https://vutech-api.onrender.com/v1/admin/orders'),
        fetch('https://vutech-api.onrender.com/v1/products?limit=100'), // Load nhiều SP ra bảng
        fetch('https://vutech-api.onrender.com/v1/categories')
      ]);
      
      setOrders(await ordersRes.json());
      
      // Fix lỗi sập web ở đây: Lấy data.data nếu có
      const productsData = await productsRes.json();
      setProducts(productsData.data || productsData);
      
      setCategories(await categoriesRes.json());
      
      setLoading(false);
    } catch (error) {
      console.error('Lỗi lấy dữ liệu:', error);
      setLoading(false);
    }
  };

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

      // Đẩy thêm category_id lên Server
      const productRes = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sku, 
          name, 
          price: Number(price), 
          image_url: finalImageUrl,
          category_id: categoryId ? Number(categoryId) : null 
        }),
      });

      if (productRes.ok) {
        alert(editingId ? '✅ Cập nhật sản phẩm thành công!' : '🎉 Thêm sản phẩm mới thành công!');
        resetForm();
        fetchData(); 
      } else {
        const errData = await productRes.json();
        alert(`❌ Lỗi từ server: ${errData.error}`);
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
    setCategoryId(product.category_id ? product.category_id.toString() : ''); // Lấy category cũ
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
    setEditingId(null); setName(''); setPrice(''); setSku(''); setCategoryId(''); setImageUrl(''); setImageFile(null);
  };

  if (!isAdmin) return <div className="min-h-screen bg-slate-900 flex justify-center items-center text-white text-2xl font-bold">Đang kiểm tra quyền truy cập... 🛡️</div>;
  if (loading) return <div className="p-10 text-center font-bold text-white text-2xl bg-slate-900 min-h-screen">Đang tải dữ liệu hệ thống... ⏳</div>;

  return (
    <div className="min-h-screen bg-slate-900 p-8 text-white font-sans">
      <div className="max-w-7xl mx-auto flex flex-col gap-12">
        
        <h1 className="text-4xl font-black text-center flex items-center justify-center gap-3 mt-4">
          👨‍💻 TRUNG TÂM QUẢN TRỊ VUTECH
        </h1>

        {/* --- FORM THÊM/SỬA SẢN PHẨM --- */}
        <div className="bg-white text-slate-800 p-8 rounded-3xl shadow-2xl">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h2 className="text-2xl font-black text-blue-700 flex items-center gap-2">
              {editingId ? '✏️ Cập nhật sản phẩm' : '📦 Thêm sản phẩm mới'}
            </h2>
            {editingId && (
              <button onClick={resetForm} className="text-sm bg-gray-100 px-4 py-2 rounded-xl text-gray-700 font-bold hover:bg-gray-200 transition">
                Hủy Sửa
              </button>
            )}
          </div>
          <form onSubmit={handleSaveProduct} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            
            <div className="flex flex-col gap-2 lg:col-span-2">
              <label className="font-bold text-sm text-slate-500 uppercase tracking-wider">Tên sản phẩm</label>
              <input type="text" className="p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition" value={name} onChange={e => setName(e.target.value)} required placeholder="VD: Bàn phím cơ AULA F75..." />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm text-slate-500 uppercase tracking-wider">Danh mục</label>
              <select className="p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition" value={categoryId} onChange={e => setCategoryId(e.target.value)} required>
                <option value="" disabled>-- Chọn danh mục --</option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm text-slate-500 uppercase tracking-wider">Giá tiền (VNĐ)</label>
              <input type="number" className="p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition" value={price} onChange={e => setPrice(e.target.value)} required />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm text-slate-500 uppercase tracking-wider">Mã SKU</label>
              <input type="text" className="p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition" value={sku} onChange={e => setSku(e.target.value)} required />
            </div>

            <div className="flex flex-col gap-2 lg:col-span-5">
              <label className="font-bold text-sm text-slate-500 uppercase tracking-wider">
                {editingId ? 'Ảnh mới (Bỏ trống nếu giữ cũ)' : 'Hình ảnh'}
              </label>
              <input type="file" accept="image/*" className="p-3 bg-slate-50 border border-dashed border-gray-300 rounded-xl cursor-pointer text-sm" onChange={e => setImageFile(e.target.files?.[0] || null)} required={!editingId && !imageUrl} />
            </div>

            <button type="submit" disabled={isUploading} className={`md:col-span-2 lg:col-span-5 py-4 rounded-2xl text-white font-black text-lg transition-all active:scale-95 ${isUploading ? 'bg-slate-400' : editingId ? 'bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/30' : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/30'}`}>
              {isUploading ? '⏳ Đang tải ảnh & Xử lý...' : editingId ? '💾 LƯU CẬP NHẬT' : '🚀 ĐĂNG SẢN PHẨM LÊN KỆ'}
            </button>
          </form>
        </div>

        {/* --- BẢNG QUẢN LÝ SẢN PHẨM --- */}
        <div className="bg-white text-slate-800 rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-6 bg-slate-50 border-b flex items-center justify-between">
            <h3 className="font-black text-xl text-slate-700">📱 KHO SẢN PHẨM</h3>
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold text-sm">Tổng: {products.length} SP</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="uppercase text-xs font-black text-slate-400 border-b">
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
                      <img src={product.image_url || 'https://via.placeholder.com/50'} className="w-16 h-16 rounded-xl object-contain bg-white border shadow-sm p-1" alt="img" />
                      <div>
                        <p className="font-bold text-slate-800 line-clamp-1">{product.name}</p>
                        {/* Hiện ID danh mục nhỏ bên dưới */}
                        <p className="text-xs text-slate-400 mt-1 font-mono">ID Danh mục: {product.category_id || 'Chưa phân loại'}</p>
                      </div>
                    </td>
                    <td className="p-5 text-center text-slate-500 font-mono text-sm">{product.sku}</td>
                    <td className="p-5 text-right font-black text-red-600 text-lg">
                      {Number(product.price).toLocaleString()} đ
                    </td>
                    <td className="p-5 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleEditClick(product)} className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl hover:bg-blue-100 hover:text-blue-700 font-bold text-sm transition">Sửa</button>
                        <button onClick={() => handleDeleteProduct(product.id)} className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl hover:bg-red-100 hover:text-red-700 font-bold text-sm transition">Xóa</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- BẢNG QUẢN LÝ ĐƠN HÀNG --- (Giữ nguyên như code của sếp vì đã rất chuẩn) */}
        <div className="bg-white text-slate-800 rounded-3xl shadow-2xl overflow-hidden mb-10">
          <div className="p-6 bg-slate-50 border-b flex items-center justify-between">
            <h3 className="font-black text-xl text-slate-700">📦 DANH SÁCH ĐƠN HÀNG</h3>
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold text-sm">{orders.length} Đơn</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="uppercase text-xs font-black text-slate-400 border-b">
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
                    <td className="p-5 font-mono text-sm text-slate-500">
                      #{order.id.substring(0, 8).toUpperCase()}
                    </td>
                    <td className="p-5">
                      <p className="font-bold text-slate-800">{order.full_name}</p>
                      <p className="text-sm text-slate-500">{order.email}</p>
                    </td>
                    <td className="p-5 text-right font-black text-red-600 text-lg">
                      {Number(order.total_amount).toLocaleString('vi-VN')} đ
                    </td>
                    <td className="p-5 text-center text-slate-500 text-sm font-medium">
                      {new Date(order.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="p-5">
                      <div className="flex flex-col items-center gap-2">
                        <select 
                          className={`text-sm p-2 px-4 border rounded-xl font-bold outline-none cursor-pointer shadow-sm transition-colors ${
                            order.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-200 focus:ring-green-400' : 
                            order.status === 'SHIPPED' ? 'bg-blue-50 text-blue-700 border-blue-200 focus:ring-blue-400' :
                            order.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-200 focus:ring-red-400' :
                            'bg-yellow-50 text-yellow-700 border-yellow-200 focus:ring-yellow-400'
                          }`}
                          value={order.status}
                          onChange={async (e) => {
                            const newStatus = e.target.value;
                            try {
                              const res = await fetch(`https://vutech-api.onrender.com/v1/admin/orders/${order.id}/status`, {
                                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ status: newStatus })
                              });
                              if (res.ok) {
                                alert('✅ Cập nhật trạng thái thành công!');
                                fetchData(); 
                              }
                            } catch (err) { alert('❌ Lỗi kết nối server!'); }
                          }}
                        >
                          <option value="PENDING">⏳ Đang chờ (PENDING)</option>
                          <option value="SHIPPED">🚚 Đang giao (SHIPPED)</option>
                          <option value="COMPLETED">✅ Hoàn thành (COMPLETED)</option>
                          <option value="CANCELLED">❌ Hủy đơn (CANCELLED)</option>
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