"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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

  // ฟังก์ชันช่วยแปลงวันที่ให้ดูง่ายขึ้น (เป็นเวลาไทย)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('th-TH', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* ส่วนหัวของหน้า */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">📊 ประวัติยอดขาย</h1>
          <Link 
            href="/" 
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← กลับไปหน้าแคชเชียร์
          </Link>
        </div>

        {/* ส่วนแสดงข้อมูล */}
        <div className="bg-white p-6 rounded-2xl shadow-sm min-h-[500px]">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center text-gray-500 py-20 text-lg">
              ยังไม่มีประวัติการขายครับ 📭
            </div>
          ) : (
            <div className="space-y-6">
              {/* วนลูปแสดงบิลแต่ละใบ */}
              {orders.map((order) => (
                <div key={order.id} className="border border-gray-200 rounded-xl p-5 hover:border-blue-300 transition-colors shadow-sm">
                  
                  {/* หัวบิล (รหัส, วันที่, ยอดรวม) */}
                  <div className="flex justify-between items-center border-b pb-3 mb-3">
                    <div>
                      <span className="font-bold text-gray-700 mr-3">บิล #{order.id}</span>
                      <span className="text-sm text-gray-500">{formatDate(order.createdAt)}</span>
                    </div>
                    <div className="font-bold text-xl text-blue-600">
                      ฿{order.totalAmount}
                    </div>
                  </div>

                  {/* รายการสินค้าในบิล */}
                  <div className="space-y-2 pl-2">
                    {order.items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between text-gray-600 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center text-[10px]">{item.quantity}</span>
                          <span>{item.product.name}</span>
                        </div>
                        {/* คำนวณราคาต่อรายการ (ราคา * จำนวน) */}
                        <span>฿{item.product.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}