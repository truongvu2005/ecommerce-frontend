'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function CartPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // State Giỏ hàng
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // State Địa chỉ Hành chính (API Việt Nam)
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  // State Form Thanh toán
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      toast.error('Vui lòng đăng nhập để xem giỏ hàng!');
      router.push('/login');
      return;
    }
    const user = JSON.parse(userStr);
    setCurrentUser(user);
    fetchCart(user.id);

    // Lấy dữ liệu 63 Tỉnh Thành Việt Nam
    fetch('https://provinces.open-api.vn/api/?depth=3')
      .then(res => res.json())
      .then(data => setProvinces(data))
      .catch(err => console.error('Lỗi lấy địa chỉ:', err));
  }, [router]);

  const fetchCart = (userId: string) => {
    fetch(`https://vutech-api.onrender.com/v1/cart/${userId}`)
      .then(res => res.json())
      .then(data => {
        setCart(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  // Logic tự động cập nhật Quận/Huyện khi chọn Tỉnh
  const handleProvinceChange = (e: any) => {
    const provinceCode = e.target.value;
    setSelectedProvince(provinceCode);
    const province = provinces.find((p: any) => p.code == provinceCode);
    setDistricts(province ? province.districts : []);
    setSelectedDistrict('');
    setWards([]);
    setSelectedWard('');
  };

  // Logic tự động cập nhật Phường/Xã khi chọn Quận
  const handleDistrictChange = (e: any) => {
    const districtCode = e.target.value;
    setSelectedDistrict(districtCode);
    const district = districts.find((d: any) => d.code == districtCode);
    setWards(district ? district.wards : []);
    setSelectedWard('');
  };

  const handleRemoveItem = async (productId: string) => {
    const toastId = toast.loading('Đang xóa sản phẩm...');
    try {
      const res = await fetch(`https://vutech-api.onrender.com/v1/cart/${cart.cartId}/product/${productId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Đã xóa khỏi giỏ!', { id: toastId });
        fetchCart(currentUser.id);
      }
    } catch (error) {
      toast.error('Lỗi kết nối', { id: toastId });
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProvince || !selectedDistrict || !selectedWard || !streetAddress) {
      return toast.error('Vui lòng nhập đầy đủ địa chỉ giao hàng!');
    }

    setIsCheckingOut(true);
    const toastId = toast.loading('Đang xử lý đơn hàng...');

    // Lấy Tên Tỉnh, Huyện, Xã từ Code
    const pName = provinces.find(p => p.code == selectedProvince)?.name;
    const dName = districts.find(d => d.code == selectedDistrict)?.name;
    const wName = wards.find(w => w.code == selectedWard)?.name;
    
    // Ghép thành địa chỉ hoàn chỉnh
    const fullShippingAddress = `${streetAddress}, ${wName}, ${dName}, ${pName}`;

    try {
      const response = await fetch('https://vutech-api.onrender.com/v1/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          cartId: cart.cartId,
          shippingAddress: fullShippingAddress,
          paymentMethod: paymentMethod
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success('🎉 Đặt hàng thành công!', { id: toastId });
        router.push('/orders'); // Đẩy sang trang lịch sử đơn hàng
      } else {
        toast.error(`Lỗi: ${data.error}`, { id: toastId });
        setIsCheckingOut(false);
      }
    } catch (error) {
      toast.error('Lỗi kết nối server!', { id: toastId });
      setIsCheckingOut(false);
    }
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center font-bold text-slate-500 text-xl">Đang tải giỏ hàng... 🛒</div>;

  return (
    <main className="max-w-7xl mx-auto px-6 py-12 animate-fade-in">
      <h1 className="text-3xl font-black text-slate-800 mb-8">Giỏ hàng của bạn</h1>

      {cart?.items?.length > 0 ? (
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* CỘT TRÁI: DANH SÁCH SẢN PHẨM */}
          <div className="flex-1 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-fit">
            <div className="space-y-6">
              {cart.items.map((item: any) => (
                <div key={item.productId} className="flex items-center gap-4 border-b pb-6 last:border-0 last:pb-0">
                  <div className="w-24 h-24 bg-slate-50 rounded-xl flex items-center justify-center p-2 border">
                    {/* Chú ý: Cần join lấy thêm ảnh ở Backend nếu muốn hiện ảnh, tạm thời dùng ảnh mặc định */}
                    <img src="https://via.placeholder.com/100" alt="product" className="object-contain" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800 text-lg">{item.name}</h3>
                    <p className="text-slate-500 mt-1">Số lượng: <span className="font-bold text-blue-600">{item.quantity}</span></p>
                    <p className="font-black text-red-600 mt-2">{Number(item.unitPrice).toLocaleString('vi-VN')} đ</p>
                  </div>
                  <button onClick={() => handleRemoveItem(item.productId)} className="text-red-500 hover:text-red-700 font-bold bg-red-50 px-4 py-2 rounded-lg transition active:scale-95">
                    Xóa
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* CỘT PHẢI: FORM THANH TOÁN (CHECKOUT ADDRESS) */}
          <div className="w-full lg:w-[450px]">
            <form onSubmit={handleCheckout} className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 sticky top-28">
              <h2 className="text-xl font-black text-slate-800 mb-6 border-b pb-4">Thông tin nhận hàng</h2>
              
              <div className="space-y-4 mb-6">
                {/* Chọn Tỉnh / Thành */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-bold text-slate-600">Tỉnh / Thành phố *</label>
                  <select value={selectedProvince} onChange={handleProvinceChange} required className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50">
                    <option value="" disabled>-- Chọn Tỉnh / Thành phố --</option>
                    {provinces.map((p: any) => <option key={p.code} value={p.code}>{p.name}</option>)}
                  </select>
                </div>

                {/* Chọn Quận / Huyện */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-bold text-slate-600">Quận / Huyện *</label>
                  <select value={selectedDistrict} onChange={handleDistrictChange} required disabled={!selectedProvince} className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 disabled:opacity-50">
                    <option value="" disabled>-- Chọn Quận / Huyện --</option>
                    {districts.map((d: any) => <option key={d.code} value={d.code}>{d.name}</option>)}
                  </select>
                </div>

                {/* Chọn Phường / Xã */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-bold text-slate-600">Phường / Xã *</label>
                  <select value={selectedWard} onChange={(e) => setSelectedWard(e.target.value)} required disabled={!selectedDistrict} className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 disabled:opacity-50">
                    <option value="" disabled>-- Chọn Phường / Xã --</option>
                    {wards.map((w: any) => <option key={w.code} value={w.code}>{w.name}</option>)}
                  </select>
                </div>

                {/* Số nhà, Tên đường */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-bold text-slate-600">Số nhà, Tên đường *</label>
                  <input type="text" value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)} required placeholder="VD: 123 Đường Công Nghệ..." className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50" />
                </div>
                
                {/* Phương thức thanh toán */}
                <div className="flex flex-col gap-1 pt-2">
                  <label className="text-sm font-bold text-slate-600">Phương thức thanh toán</label>
                  <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50 text-blue-800 font-bold">
                    <option value="COD">💵 Thanh toán khi nhận hàng (COD)</option>
                    <option value="VNPAY">💳 Thanh toán thẻ / VNPay</option>
                  </select>
                </div>
              </div>

              <div className="border-t pt-6 mb-6 flex justify-between items-center">
                <span className="text-lg font-bold text-slate-500">Tổng cộng:</span>
                <span className="text-3xl font-black text-red-600">{Number(cart.totalPrice).toLocaleString('vi-VN')} đ</span>
              </div>

              <button type="submit" disabled={isCheckingOut} className={`w-full py-4 rounded-xl text-white font-black text-lg transition-all active:scale-95 ${isCheckingOut ? 'bg-slate-400' : 'bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/30'}`}>
                {isCheckingOut ? '⏳ ĐANG XỬ LÝ...' : 'XÁC NHẬN ĐẶT HÀNG'}
              </button>
            </form>
          </div>

        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
          <p className="text-6xl mb-4">🛒</p>
          <h3 className="text-2xl font-bold text-slate-700 mb-2">Giỏ hàng trống</h3>
          <p className="text-slate-500 mb-6">Bạn chưa chọn mua sản phẩm nào.</p>
          <Link href="/products" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition inline-block shadow-lg">
            Tiếp tục mua sắm
          </Link>
        </div>
      )}
    </main>
  );
}