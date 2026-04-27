import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DiamondK36 POS - ระบบจัดการจุดขาย",
  description: "ระบบบริหารจัดการร้านค้าที่มีประสิทธิภาพ โดย DiamondK36",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* คุณสามารถเพิ่ม Provider ต่างๆ เช่น AuthProvider หรือ CartProvider ตรงนี้ได้ในอนาคต */}
        {children}
      </body>
    </html>
  );
}