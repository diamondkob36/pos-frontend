"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SalesCharts({ topProductsChartData, topToppingsByRevenue }: any) {
  return (
    <div className="space-y-8">
      {/* กราฟแท่ง 5 อันดับเมนูขายดี */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-700 mb-6">📈 5 อันดับเมนูขายดี (ตามรายได้)</h2>
        {topProductsChartData.length > 0 ? (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProductsChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#000000' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#000000' }} axisLine={false} tickLine={false} tickFormatter={(value) => `฿${value}`} />
                <Tooltip 
                  cursor={{ fill: '#F3F4F6' }}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  labelStyle={{ color: '#000000', fontWeight: 'bold' }}
                  itemStyle={{ color: '#3B82F6' }}
                  formatter={(value: any) => [`฿${Number(value).toLocaleString()}`, 'รายได้']}
                />
                <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} name="รายได้ (บาท)" barSize={40} activeBar={{ fill: '#1E3A8A' }}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-72 flex items-center justify-center text-gray-400 font-medium">ไม่มีข้อมูลในช่วงเวลานี้</div>
        )}
      </div>

      {/* ลิสต์ 5 อันดับท็อปปิ้งทำเงิน */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
          <span>✨</span> 5 อันดับท็อปปิ้งทำรายได้สูงสุด
        </h2>
        {topToppingsByRevenue.length > 0 ? (
          <div className="space-y-3">
            {topToppingsByRevenue.map((t: any, index: number) => (
              <div key={index} className="flex justify-between items-center p-3 border border-gray-100 rounded-xl bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-yellow-100 text-yellow-600' : index === 1 ? 'bg-gray-200 text-gray-600' : index === 2 ? 'bg-orange-100 text-orange-600' : 'bg-blue-50 text-blue-500'}`}>
                    #{index + 1}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-800">{t.name}</span>
                    <span className="text-[10px] font-medium text-gray-500">ถูกสั่งไป {t.quantity} ครั้ง</span>
                  </div>
                </div>
                <div className="bg-white px-3 py-1.5 rounded-lg border border-pink-100 shadow-sm text-sm">
                  <span className="font-black text-pink-600">฿{t.revenue.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-400 font-medium border-2 border-dashed border-gray-100 rounded-xl">ไม่มีข้อมูลการสั่งท็อปปิ้ง</div>
        )}
      </div>
    </div>
  );
}