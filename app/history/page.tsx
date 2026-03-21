"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function HistoryPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 🌟 State ใหม่: สำหรับเก็บระยะเวลาที่ผู้ใช้เลือก (ค่าเริ่มต้นคือ "all")
  const [timeFilter, setTimeFilter] = useState<string>("all");

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
    if (!dateString) return "-"; // 🌟 ดักจับถ้าไม่มีวันที่
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-"; // 🌟 ดักจับถ้าวันที่พัง (กันบั๊ก 1 ม.ค. 2513)
    return date.toLocaleString('th-TH', { 
      year: 'numeric', month: 'short', day: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });
  };

  // ==========================================
  // 🌟 ส่วนกรองข้อมูลตามระยะเวลาที่เลือก (Time Filtering)
  // ==========================================
  const now = new Date();
  
  const filteredOrders = orders.filter(order => {
    if (timeFilter === "all") return true; // ถ้าเลือกทั้งหมด ก็ไม่ต้องกรอง

    const orderDate = new Date(order.createdAt);
    // คำนวณหาความต่างของเวลา (มิลลิวินาที) แล้วแปลงเป็น "วัน"
    const diffTime = Math.abs(now.getTime() - orderDate.getTime());
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (timeFilter === "1") return diffDays <= 1; // 24 ชั่วโมงล่าสุด
    if (timeFilter === "7") return diffDays <= 7;
    if (timeFilter === "14") return diffDays <= 14;
    if (timeFilter === "30") return diffDays <= 30;
    
    return true;
  });

  // ==========================================
  // 🌟 ส่วนคำนวณข้อมูลสำหรับ Dashboard (เวอร์ชันอัปเกรด ป้องกันกราฟพัง)
  // ==========================================
  const totalOrders = filteredOrders.length;
  
  const totalRevenue = filteredOrders.reduce((sum, order) => {
    // ป้องกันกรณี order.items ไม่มีข้อมูล
    const orderTotal = (order.items || []).reduce((itemSum: number, item: any) => {
      const price = item.product?.price || 0; // ถ้าไม่มีราคาให้ตีเป็น 0
      return itemSum + (price * item.quantity);
    }, 0);
    return sum + orderTotal;
  }, 0);

  const productStats: Record<string, { name: string, quantity: number, revenue: number }> = {};
  
  filteredOrders.forEach(order => {
    if (!order.items) return; // ถ้าบิลนี้ไม่มีสินค้า ให้ข้ามไปเลย
    
    order.items.forEach((item: any) => {
      // ดักจับกรณีที่ชื่อหรือราคาสินค้ามีปัญหา (เช่น สินค้าถูกลบไปแล้ว)
      const pName = item.product?.name || "สินค้าไม่ทราบชื่อ";
      const pPrice = item.product?.price || 0;

      if (!productStats[pName]) {
        productStats[pName] = { name: pName, quantity: 0, revenue: 0 };
      }
      productStats[pName].quantity += (item.quantity || 1);
      productStats[pName].revenue += (pPrice * (item.quantity || 1));
    });
  });

  const topProductsChartData = Object.values(productStats)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const mostSoldProduct = Object.values(productStats)
    .sort((a, b) => b.quantity - a.quantity)[0];

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* ส่วนหัวของหน้า */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">📊 แดชบอร์ดสรุปยอดขาย</h1>
            <p className="text-gray-500 mt-1">ข้อมูลเชิงลึกและประวัติการขายทั้งหมด</p>
          </div>
          
          {/* 🌟 กลุ่มปุ่มเมนูด้านขวา (เพิ่ม Dropdown เลือกเวลา) */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white px-3 py-2 rounded-xl shadow-sm border border-gray-200 flex items-center gap-2">
              <span className="text-sm text-gray-500 font-medium">📅 ดูข้อมูล:</span>
              <select 
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="bg-transparent text-gray-800 font-bold text-sm focus:outline-none cursor-pointer"
              >
                <option value="1">วันนี้ (24 ชม. ล่าสุด)</option>
                <option value="7">7 วันย้อนหลัง</option>
                <option value="14">14 วันย้อนหลัง</option>
                <option value="30">30 วันย้อนหลัง</option>
                <option value="all">ทั้งหมด</option>
              </select>
            </div>

            <Link href="/" className="bg-gray-800 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-gray-900 transition-colors shadow-sm">
              ← แคชเชียร์
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* ส่วนที่ 1: การ์ดสรุปภาพรวม */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 border-l-4 border-l-blue-500">
                <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center text-2xl">💰</div>
                <div>
                  <p className="text-sm font-medium text-gray-500">รายรับรวม</p>
                  <p className="text-2xl font-bold text-gray-800">฿{totalRevenue.toLocaleString()}</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 border-l-4 border-l-purple-500">
                <div className="w-14 h-14 bg-purple-50 rounded-full flex items-center justify-center text-2xl">🧾</div>
                <div>
                  <p className="text-sm font-medium text-gray-500">จำนวนบิล</p>
                  <p className="text-2xl font-bold text-gray-800">{totalOrders} <span className="text-sm font-normal text-gray-500">รายการ</span></p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 border-l-4 border-l-orange-500">
                <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center text-2xl">🏆</div>
                <div>
                  <p className="text-sm font-medium text-gray-500">เมนูที่ถูกขายมากที่สุด</p>
                  <p className="text-xl font-bold text-gray-800 truncate max-w-[150px]" title={mostSoldProduct?.name}>
                    {mostSoldProduct ? mostSoldProduct.name : "-"}
                  </p>
                  {mostSoldProduct && (
                    <p className="text-xs text-green-600 font-bold mt-1">
                      ขายไปแล้ว {mostSoldProduct.quantity} รายการ
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* ส่วนที่ 2: กราฟแท่ง */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-700 mb-6">📈 5 อันดับเมนูขายดี (ตามรายได้)</h2>
                {topProductsChartData.length > 0 ? (
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topProductsChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        
                        {/* 🌟 เปลี่ยน fill จาก '#6B7280' เป็น '#000000' (สีดำ) */}
                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#000000' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 12, fill: '#000000' }} axisLine={false} tickLine={false} tickFormatter={(value) => `฿${value}`} />
                        
                        <Tooltip 
                          cursor={{ fill: '#F3F4F6' }}
                          contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                          /* 🌟 1. เปลี่ยนสีชื่อเมนู (หัวกล่อง) เป็นสีดำ */
                          labelStyle={{ color: '#000000', fontWeight: 'bold' }}
                          /* 🌟 2. เปลี่ยนสีบรรทัด "รายได้ : ฿XXX" เป็นสีดำ */
                          itemStyle={{ color: '#3B82F6' }}
                          formatter={(value: any) => [`฿${Number(value).toLocaleString()}`, 'รายได้']}
                        />
                        <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} name="รายได้ (บาท)" barSize={40}/>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-72 flex items-center justify-center text-gray-950">ไม่มีข้อมูลในช่วงเวลานี้</div>
                )}
              </div>

              {/* ส่วนที่ 3: รายการประวัติบิล */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[400px]">
                <h2 className="text-lg font-bold text-gray-700 mb-4">📝 ประวัติบิล ({timeFilter === 'all' ? 'ทั้งหมด' : `${timeFilter} วันล่าสุด`})</h2>
                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                  {filteredOrders.length === 0 ? (
                    <div className="text-center text-gray-400 py-10">ไม่มีบิลในช่วงเวลานี้</div>
                  ) : (
                    filteredOrders.map((order) => {
                      const orderTotal = order.items.reduce((sum: number, item: any) => sum + (item.product.price * item.quantity), 0);
                      return (
                        <div key={order.id} className="border border-gray-100 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all bg-gray-50">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className="font-bold text-gray-700 bg-white px-2 py-1 rounded text-xs border mr-2">
                                #{order.dailyNumber || order.id || "?"}
                              </span>
                              <span className="text-xs text-gray-500">{formatDate(order.createdAt)}</span>
                            </div>
                            <div className="font-bold text-blue-600">฿{orderTotal.toLocaleString()}</div>
                          </div>
                          <div className="space-y-1">
                            {order.items?.map((item: any, index: number) => {
                              // 🌟 ระบบกันพัง: ดักจับข้อมูลเก่าที่อาจจะเสีย
                              const pName = item.product?.name || "สินค้าไม่ทราบชื่อ";
                              const pPrice = item.product?.price || 0;
                              const pQty = item.quantity || 1;
                              
                              return (
                                <div key={index} className="flex justify-between text-gray-600 text-xs">
                                  <span>{pName} <span className="text-gray-400 ml-1">x{pQty}</span></span>
                                  <span>฿{pPrice * pQty}</span>
                                </div>
                              );
                            })}
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