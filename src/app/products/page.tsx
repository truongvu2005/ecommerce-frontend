'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  
  // State phân trang và bộ lọc
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) setCurrentUser(JSON.parse(userStr));

    // Lấy danh sách Danh mục
    fetch('https://vutech-api.onrender.com/v1/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error('Lỗi load danh mục:', err));
  }, []);

  // Hàm gọi API lấy sản phẩm (chạy lại mỗi khi Page hoặc Category thay đổi)
  useEffect(() => {
    setLoading(true);
    let url = `https://vutech-api.onrender.com/v1/products?page=${currentPage}&limit=8`;
    if (selectedCategory) url += `&category=${selectedCategory}`;

    fetch(url)
      .then(res => res.json())
      .then(resData => {
        // Hứng data từ cấu trúc API mới
        setProducts(resData.data || []);
        if (resData.pagination) setTotalPages(resData.pagination.totalPages);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [currentPage, selectedCategory]);

  const handleAddToCart = async (productId: string) => {
    if (!currentUser) {
      alert('Vui lòng đăng nhập!');
      return router.push('/login');
    }
    setStatus('Đang thêm...');
    try {
      const response = await fetch('https://vutech-api.onrender.com/v1/cart/items', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, productId, quantity: 1 }),
      });
      if (response.ok) {
        setStatus('✅ Đã thêm vào giỏ!');
        setTimeout(() => setStatus(''), 2000);
      }
    } catch (error) { setStatus('❌ Lỗi kết nối!'); }
  };

  // Nút chuyển trang
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Tự cuộn lên đầu cực xịn
    }
  };

  // Nút chọn danh mục
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1); // Reset về trang 1 khi đổi bộ lọc
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-10 w-full animate-fade-in flex flex-col md:flex-row gap-8">
      {status && (
        <div className="fixed top-24 right-5 bg-green-500 text-white px-6 py-3 rounded-lg shadow-2xl z-50 font-bold animate-bounce">
          {status}
        </div>
      )}

      {/* --- CỘT BÊN TRÁI: DANH MỤC LỌC --- */}
      <div className="w-full md:w-64 flex-shrink-0">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 sticky top-28">
          <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
            🗂️ Danh mục
          </h2>
          <div className="space-y-2">
            <button 
              onClick={() => handleCategorySelect('')}
              className={`w-full text-left px-4 py-2.5 rounded-xl font-semibold transition ${selectedCategory === '' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              Tất cả sản phẩm
            </button>
            {categories.map((cat: any) => (
              <button 
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className={`w-full text-left px-4 py-2.5 rounded-xl font-semibold transition ${selectedCategory == cat.id ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* --- CỘT BÊN PHẢI: LƯỚI SẢN PHẨM & PHÂN TRANG --- */}
      <div className="flex-1">
        <div className="mb-6 flex justify-between items-end">
          <h1 className="text-3xl font-black text-slate-800">Sản phẩm Vũ Tech</h1>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center font-bold text-slate-400">Đang tải hàng... ⏳</div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product: any) => (
                <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col group overflow-hidden">
                  <Link href={`/product/${product.id}`} className="relative bg-gray-50 aspect-square flex items-center justify-center p-4">
                    <img src={product.image_url || 'https://via.placeholder.com/200'} alt={product.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"/>
                  </Link>
                  <div className="p-5 flex flex-col flex-1 justify-between">
                    <Link href={`/product/${product.id}`}>
                      <h2 className="text-lg font-bold text-slate-800 line-clamp-2 hover:text-blue-600">{product.name}</h2>
                    </Link>
                    <div className="mt-4">
                      <p className="text-2xl font-black text-red-600 mb-4">{Number(product.price).toLocaleString('vi-VN')} đ</p>
                      <button onClick={() => handleAddToCart(product.id)} className="w-full bg-blue-50 text-blue-700 font-bold py-3 rounded-xl hover:bg-blue-600 hover:text-white transition active:scale-95">
                        + Thêm vào giỏ
                      </button>
                    </div>
                  </div>
                </div>
              ))}                                         
            </div>

            {/* BỘ NÚT PHÂN TRANG */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center gap-2">
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 rounded-xl font-bold bg-white border text-slate-600 disabled:opacity-50 hover:bg-slate-50">
                  &lt; Trước
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button 
                    key={i} 
                    onClick={() => handlePageChange(i + 1)} 
                    className={`w-10 h-10 rounded-xl font-bold transition ${currentPage === i + 1 ? 'bg-blue-600 text-white shadow-md' : 'bg-white border text-slate-600 hover:bg-slate-50'}`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-4 py-2 rounded-xl font-bold bg-white border text-slate-600 disabled:opacity-50 hover:bg-slate-50">
                  Sau &gt;
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
            <h3 className="text-xl font-bold text-slate-700">Không có sản phẩm nào trong danh mục này.</h3>
          </div>
        )}
      </div>
    </main>
  );
}