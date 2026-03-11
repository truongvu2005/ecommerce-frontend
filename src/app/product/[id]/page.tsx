'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    fetch(`https://vutech-api.onrender.com/v1/products/${id}`)
      .then(res => res.json())
      .then(data => setProduct(data));
  }, [id]);

  if (!product) return <div className="p-10 text-center">Đang tải sản phẩm...</div>;

  return (
    <div className="max-w-5xl mx-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
      {/* Bên trái: Ảnh sản phẩm */}
      <div className="rounded-2xl overflow-hidden shadow-xl bg-white">
        <img src={product.image_url} alt={product.name} className="w-full h-auto object-cover" />
      </div>

      {/* Bên phải: Thông tin & Nút mua */}
      <div className="flex flex-col gap-6">
        <h1 className="text-4xl font-black text-slate-800 uppercase">{product.name}</h1>
        <p className="text-3xl font-bold text-red-600">{Number(product.price).toLocaleString()} đ</p>
        <div className="p-4 bg-slate-100 rounded-xl border-l-4 border-blue-500 text-slate-600">
          Mã sản phẩm (SKU): <span className="font-mono font-bold text-blue-600">{product.sku}</span>
        </div>
        <p className="text-slate-500 leading-relaxed">
          Sản phẩm công nghệ chính hãng, bảo hành 12 tháng. Miễn phí vận chuyển toàn quốc cho đơn hàng từ 1 triệu đồng.
        </p>
        <button className="bg-blue-600 text-white py-4 rounded-xl font-bold text-xl hover:bg-blue-700 shadow-lg active:scale-95 transition-all">
          THÊM VÀO GIỎ HÀNG NGAY
        </button>
      </div>
    </div>
  );
}