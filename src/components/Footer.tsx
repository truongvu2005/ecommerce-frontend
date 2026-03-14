import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-16 mt-auto">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <Link href="/" className="flex items-center gap-2 mb-4">
            <div className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-black">V</div>
            <span className="text-xl font-black text-white tracking-tight">Vũ Tech<span className="text-blue-500">Shop</span></span>
          </Link>
          <p className="text-slate-400 leading-relaxed max-w-md">
            Hệ thống bán lẻ thiết bị công nghệ, linh kiện PC và phụ kiện Gaming Gear hàng đầu Việt Nam. Chất lượng làm nên thương hiệu.
          </p>
        </div>
        <div>
          <h3 className="text-white font-bold text-lg mb-4">Về chúng tôi</h3>
          <ul className="space-y-3">
            <li><Link href="/about" className="hover:text-white transition">Giới thiệu</Link></li>
            <li><Link href="#" className="hover:text-white transition">Chính sách bảo hành</Link></li>
            <li><Link href="#" className="hover:text-white transition">Tuyển dụng</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-white font-bold text-lg mb-4">Liên hệ</h3>
          <ul className="space-y-3 text-slate-400">
            <li>📍 123 Đường Công Nghệ, Đà Nẵng</li>
            <li>📞 Hotline: 0362313700</li>
            <li>✉️ Email: vutruong67893@gmail.com</li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Vũ Tech Shop. Đồ án xây dựng bởi Trương Tấn Quang Vũ - Lớp 23CNTT1.
      </div>
    </footer>
  );
}