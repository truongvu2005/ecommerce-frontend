'use client';
import { useRouter } from 'next/navigation';

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 font-sans animate-fade-in">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* --- Banner Giới thiệu --- */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-12 md:p-20 text-center text-white relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-black mb-6">Về Vũ Tech Shop</h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
              Khởi nguồn từ đam mê công nghệ, chúng tôi mang đến những trải nghiệm mua sắm tuyệt vời nhất cho cộng đồng đam mê đồ công nghệ tại Việt Nam.
            </p>
          </div>
          {/* Vòng tròn trang trí */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>

        {/* --- Nội dung chi tiết --- */}
        <div className="p-10 md:p-16 text-slate-700 leading-relaxed space-y-12">
          
          {/* Phần Sứ mệnh */}
          <section className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-black text-slate-800 mb-6">Sứ mệnh của chúng tôi</h2>
            <p className="text-lg text-slate-600">
              Được thành lập và phát triển bởi lập trình viên <strong>Trương Tấn Quang Vũ (Lớp 23CNTT1)</strong>, Vũ Tech Shop không chỉ là một dự án thương mại điện tử thông thường, mà còn là tâm huyết mang đến một nền tảng mua sắm minh bạch, giao diện hiện đại và trải nghiệm mượt mà nhất. Chúng tôi cam kết cung cấp các sản phẩm công nghệ chất lượng với mức giá cạnh tranh nhất.
            </p>
          </section>

          {/* Phần Điểm mạnh */}
          <section>
            <h2 className="text-3xl font-black text-slate-800 mb-8 text-center">Tại sao chọn Vũ Tech?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4 bg-slate-50 p-6 rounded-2xl hover:shadow-md transition">
                <div className="bg-blue-100 text-blue-600 text-3xl p-4 rounded-xl">🚀</div>
                <div>
                  <h3 className="font-bold text-xl text-slate-800 mb-2">Giao hàng hỏa tốc</h3>
                  <p className="text-slate-600">Nhận hàng siêu tốc trong vòng 2h tại khu vực nội thành Đà Nẵng.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 bg-slate-50 p-6 rounded-2xl hover:shadow-md transition">
                <div className="bg-green-100 text-green-600 text-3xl p-4 rounded-xl">🛡️</div>
                <div>
                  <h3 className="font-bold text-xl text-slate-800 mb-2">Bảo hành dài hạn</h3>
                  <p className="text-slate-600">Cam kết 1 đổi 1 trong 30 ngày, bảo hành lên đến 24 tháng chính hãng.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 bg-slate-50 p-6 rounded-2xl hover:shadow-md transition">
                <div className="bg-purple-100 text-purple-600 text-3xl p-4 rounded-xl">💳</div>
                <div>
                  <h3 className="font-bold text-xl text-slate-800 mb-2">Thanh toán an toàn</h3>
                  <p className="text-slate-600">Hỗ trợ thanh toán online tiện lợi, bảo mật tuyệt đối qua cổng VNPay.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 bg-slate-50 p-6 rounded-2xl hover:shadow-md transition">
                <div className="bg-orange-100 text-orange-600 text-3xl p-4 rounded-xl">👨‍💻</div>
                <div>
                  <h3 className="font-bold text-xl text-slate-800 mb-2">Hỗ trợ kỹ thuật 24/7</h3>
                  <p className="text-slate-600">Đội ngũ chuyên viên IT luôn sẵn sàng giải đáp mọi thắc mắc của bạn.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Nút quay lại trang chủ */}
          <div className="pt-8 text-center border-t border-gray-100">
            <button 
              onClick={() => router.push('/')}
              className="bg-blue-600 text-white px-10 py-4 rounded-full font-black text-lg hover:bg-blue-700 shadow-xl active:scale-95 transition-all inline-flex items-center gap-2"
            >
              <span>←</span> Bắt đầu mua sắm ngay
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}