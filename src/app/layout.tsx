import "./globals.css"; // phải import ở root layout để tailwind áp dụng toàn bộ app
import type { Metadata } from "next";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Quản lý nhân viên",
  description: "Dashboard quản lý nhân viên",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="bg-gray-100 min-h-screen">
        {children}
        {/* Toaster đặt 1 lần ở root để gọi toast.success/error từ mọi nơi trong app*/}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
