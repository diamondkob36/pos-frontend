"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
// 🌟 นำเข้าเครื่องมือทำกราฟจาก Recharts
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function HistoryPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ดึงข้อมูลบิลทั้งหมดจากหลังบ้าน
  useEffect(() => {
    fetch("http://localhost:3001/orders")
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("ดึงข้อมูลประวัติไม่สำเร็จ:", error);
        setIsLoading(false);
      });
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('th-TH', { 
      year: 'numeric', month: 'short', day: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });
  };

  // ==========================================
  // 🌟 ส่วนคำนวณข้อมูลสำหรับ Dashboard
  // ==========================================
  // 1. คำนวณยอดขายรวมทั้งหมด และ จำนวนบิล
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => {
    // คำนวณยอดรวมของแต่ละบิล
    const orderTotal = order.items.reduce((itemSum: number, item: any) => itemSum + (item.product.price * item.quantity), 0);
    return sum + orderTotal;
  }, 0);

  // 2. คำนวณหาสินค้าขายดี (รวมยอดฮิตจากทุกบิล)
  const productStats: Record<string, { name: string, quantity: number, revenue: number }> = {};
  
  orders.forEach(order => {
    order.items.forEach((item: any) => {
      const pName = item.product.name;
      if (!productStats[pName]) {
        productStats[pName] = { name: pName, quantity: 0, revenue: 0 };
      }
      productStats[pName].quantity += item.quantity;
      productStats[pName].revenue += (item.product.price * item.quantity);
    });
  });

  // แปลงข้อมูลเป็น Array แล้วจัดเรียงจากขายดีสุดไปน้อยสุด (เอาแค่ Top 5)
  const topProductsChartData = Object.values(productStats)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* ส่วนหัวของหน้า */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">📊 แดชบอร์ดสรุปยอดขาย</h1>
            <p className="text-gray-500 mt-1">ข้อมูลเชิงลึกและประวัติการขายทั้งหมด</p>
          </div>
          <Link href="/" className="bg-gray-800 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-gray-900 transition-colors shadow-sm">
            ← กลับไปหน้าแคชเชียร์
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* 🌟 ส่วนที่ 1: การ์ดสรุปภาพรวม (Summary Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 border-l-4 border-l-blue-500">
                <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center text-2xl">💰</div>
                <div>
                  <p className="text-sm font-medium text-gray-500">รายรับรวมทั้งหมด</p>
                  <p className="text-2xl font-bold text-gray-800">฿{totalRevenue.toLocaleString()}</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 border-l-4 border-l-purple-500">
                <div className="w-14 h-14 bg-purple-50 rounded-full flex items-center justify-center text-2xl">🧾</div>
                <div>
                  <p className="text-sm font-medium text-gray-500">จำนวนบิลทั้งหมด</p>
                  <p className="text-2xl font-bold text-gray-800">{totalOrders} <span className="text-sm font-normal text-gray-500">รายการ</span></p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 border-l-4 border-l-orange-500">
                <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center text-2xl">🏆</div>
                <div>
                  <p className="text-sm font-medium text-gray-500">เมนูที่ทำรายได้สูงสุด</p>
                  <p className="text-xl font-bold text-gray-800 truncate max-w-[150px]">
                    {topProductsChartData.length > 0 ? topProductsChartData[0].name : "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 🌟 ส่วนที่ 2: กราฟแท่ง 5 อันดับเมนูขายดี */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-700 mb-6">📈 5 อันดับเมนูขายดี (ตามรายได้)</h2>
                {topProductsChartData.length > 0 ? (
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topProductsChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} tickFormatter={(value) => `฿${value}`} />
                        <Tooltip 
                          cursor={{ fill: '#F3F4F6' }}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                          formatter={(value: number) => [`฿${value.toLocaleString()}`, 'รายได้']}
                        />
                        <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} name="รายได้ (บาท)" barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-72 flex items-center justify-center text-gray-400">ยังไม่มีข้อมูลการขายเพียงพอ</div>
                )}
              </div>

              {/* 🌟 ส่วนที่ 3: รายการประวัติบิล (แบบเดิมที่ปรับให้สวยขึ้น) */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[400px]">
                <h2 className="text-lg font-bold text-gray-700 mb-4">📝 ประวัติบิลล่าสุด</h2>
                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                  {orders.length === 0 ? (
                    <div className="text-center text-gray-400 py-10">ยังไม่มีประวัติการขาย</div>
                  ) : (
                    orders.map((order) => {
                      const orderTotal = order.items.reduce((sum: number, item: any) => sum + (item.product.price * item.quantity), 0);
                      return (
                        <div key={order.id} className="border border-gray-100 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all bg-gray-50">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className="font-bold text-gray-700 bg-white px-2 py-1 rounded text-xs border mr-2">#{order.id}</span>
                              <span className="text-xs text-gray-500">{formatDate(order.createdAt)}</span>
                            </div>
                            <div className="font-bold text-blue-600">฿{orderTotal.toLocaleString()}</div>
                          </div>
                          <div className="space-y-1">
                            {order.items.map((item: any, index: number) => (
                              <div key={index} className="flex justify-between text-gray-600 text-xs">
                                <span>{item.product.name} <span className="text-gray-400 ml-1">x{item.quantity}</span></span>
                                <span>฿{item.product.price * item.quantity}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </>
        )}

      </div>
    </main>
  );
}