import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/src/components/Header";
import Footer from "@/src/components/Footer";
import { Toaster } from 'react-hot-toast'; // <--- MỚI: Import thư viện

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vũ Tech Shop - Thiết bị công nghệ đỉnh cao",
  description: "Cửa hàng công nghệ số 1 Đà Nẵng",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${inter.className} flex flex-col min-h-screen bg-gray-50`}>
        {/* Nút điều hướng luôn nằm trên cùng */}
        <Header />
        
        {/* Nội dung các trang sẽ thay đổi ở đây (thêm pt-20 để không bị Header đè) */}
        <div className="flex-1 pt-20">
          {children}
        </div>

        {/* Chân trang luôn nằm dưới cùng */}
        <Footer />
        
        {/* --- MỚI: Đặt loa thông báo ở góc dưới bên phải --- */}
        <Toaster position="bottom-right" reverseOrder={false} />
      </body>
    </html>
  );
}