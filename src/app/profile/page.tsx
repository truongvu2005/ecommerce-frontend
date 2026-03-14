'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      toast.error('Bạn cần đăng nhập trước!');
      router.push('/login');
      return;
    }
    
    const localUser = JSON.parse(userStr);
    
    // Gọi API lấy data mới nhất từ DB
    fetch(`https://vutech-api.onrender.com/v1/users/${localUser.id}`)
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setFullName(data.full_name || '');
        setPhone(data.phone || '');
        setAddress(data.address || '');
        setAvatarUrl(data.avatar_url || '');
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const toastId = toast.loading('Đang lưu thông tin...');

    try {
      let finalAvatarUrl = avatarUrl;

      // 1. Nếu khách có chọn ảnh mới thì Upload ảnh trước
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        const uploadRes = await fetch('https://vutech-api.onrender.com/v1/admin/upload', {
          method: 'POST', body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadData.imageUrl) finalAvatarUrl = uploadData.imageUrl;
      }

      // 2. Cập nhật thông tin vào DB
      const res = await fetch(`https://vutech-api.onrender.com/v1/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          phone: phone,
          address: address,
          avatar_url: finalAvatarUrl
        })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Cập nhật hồ sơ thành công!', { id: toastId });
        setAvatarUrl(finalAvatarUrl);
        // Cập nhật lại LocalStorage để Header nhận tên mới
        localStorage.setItem('user', JSON.stringify(data.user));
        // Reset file input
        setImageFile(null);
      } else {
        toast.error(`Lỗi: ${data.error}`, { id: toastId });
      }
    } catch (error) {
      toast.error('Lỗi kết nối server', { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center font-bold text-slate-500">Đang tải hồ sơ... ⏳</div>;

  return (
    <main className="max-w-4xl mx-auto px-6 py-12 animate-fade-in min-h-screen">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Header Cover */}
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
        
        <div className="px-8 pb-8">
          {/* Avatar Section */}
          <div className="relative flex justify-center -mt-16 mb-8">
            <div className="relative group">
              <img 
                src={imageFile ? URL.createObjectURL(imageFile) : (avatarUrl || 'https://ui-avatars.com/api/?name=' + fullName + '&background=random&size=150')} 
                alt="Avatar" 
                className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg bg-white"
              />
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 shadow-md transition transform hover:scale-110">
                📷
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
              </label>
            </div>
          </div>

          <h1 className="text-2xl font-black text-center text-slate-800 mb-8">Hồ sơ của bạn</h1>

          <form onSubmit={handleSave} className="max-w-2xl mx-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="font-bold text-sm text-slate-500 uppercase">Họ và Tên</label>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required className="p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition" />
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="font-bold text-sm text-slate-500 uppercase">Số điện thoại</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Nhập SĐT..." className="p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm text-slate-500 uppercase">Email (Không thể đổi)</label>
              <input type="email" value={user.email} disabled className="p-3 bg-gray-100 border rounded-xl text-gray-500 cursor-not-allowed font-medium" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm text-slate-500 uppercase">Địa chỉ mặc định</label>
              <textarea value={address} onChange={e => setAddress(e.target.value)} rows={3} placeholder="VD: 123 Đường Công Nghệ, Quận Hải Châu..." className="p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition resize-none" />
            </div>

            <button type="submit" disabled={isSaving} className={`w-full py-4 rounded-xl text-white font-black text-lg transition-all active:scale-95 mt-4 ${isSaving ? 'bg-slate-400' : 'bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/30'}`}>
              {isSaving ? '⏳ ĐANG LƯU...' : '💾 LƯU THAY ĐỔI'}
            </button>
          </form>

        </div>
      </div>
    </main>
  );
}