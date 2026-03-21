"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';
import Sidebar from "../components/Sidebar";

export default function HistoryPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [dbToppings, setDbToppings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<string>("all");

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:3001/orders").then(res => res.json()),
      fetch("http://localhost:3001/toppings").then(res => res.json())
    ])
    .then(([ordersData, toppingsData]) => {
      setOrders(ordersData);
      setDbToppings(toppingsData);
      setIsLoading(false);
    })
    .catch((error) => {
      console.error("ดึงข้อมูลประวัติไม่สำเร็จ:", error);
      setIsLoading(false);
    });
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-"; 
    return date.toLocaleString('th-TH', { 
      year: 'numeric', month: 'short', day: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });
  };

  const now = new Date();
  
  const filteredOrders = orders.filter(order => {
    if (timeFilter === "all") return true;

    const orderDate = new Date(order.createdAt);
    const diffTime = Math.abs(now.getTime() - orderDate.getTime());
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (timeFilter === "1") return diffDays <= 1;
    if (timeFilter === "7") return diffDays <= 7;
    if (timeFilter === "14") return diffDays <= 14;
    if (timeFilter === "30") return diffDays <= 30;
    
    return true;
  });

  const totalOrders = filteredOrders.length;
  
  const totalRevenue = filteredOrders.reduce((sum, order) => {
    const orderTotal = (order.items || []).reduce((itemSum: number, item: any) => {
      const price = item.price || item.product?.price || 0; 
      return itemSum + (price * item.quantity);
    }, 0);
    return sum + orderTotal;
  }, 0);

  const toppingPriceMap: Record<string, number> = {};
  dbToppings.forEach(t => {
    toppingPriceMap[t.name] = t.price;
  });

  // 🌟 เพิ่มฟิลด์ menuOnlyRevenue เก็บรายได้แบบเพียวๆ
  const productStats: Record<string, { name: string, quantity: number, revenue: number, menuOnlyRevenue: number }> = {};
  const toppingStats: Record<string, { name: string, quantity: number, revenue: number }> = {}; 
  
  filteredOrders.forEach(order => {
    if (!order.items) return; 
    order.items.forEach((item: any) => {
      
      const pName = item.product?.name || "สินค้าไม่ทราบชื่อ";
      const pPrice = item.price || item.product?.price || 0;
      const itemQty = item.quantity || 1;

      let currentItemToppingsRevenue = 0; // ยอดรวมท็อปปิ้งเฉพาะของสินค้านี้

      if (item.toppings) {
        const toppingsList = item.toppings.split(',').map((t: string) => t.trim());
        toppingsList.forEach((tStr: string) => {
          if (!tStr) return;
          
          // 🌟 ใช้ Regex ตัวใหม่ เพื่อดึงทั้ง ชื่อ, ราคา(หลัง @), และจำนวน(หลัง x)
          const match = tStr.match(/(.+?)(?:\s+@(\d+(?:\.\d+)?))?(?:\s+x(\d+))?$/);
          
          const tName = match ? match[1].trim() : tStr;
          
          // 🌟 ถ้าระบบมีราคาฝังมาด้วย (@10) ให้ใช้ราคานั้น แต่ถ้าเป็นบิลเก่าที่ไม่มี ให้ดึงราคาปัจจุบันมาใช้แทน
          const tPrice = match && match[2] ? parseFloat(match[2]) : (toppingPriceMap[tName] || 0);
          
          const tQty = match && match[3] ? parseInt(match[3], 10) : 1; 

          if (!toppingStats[tName]) {
            toppingStats[tName] = { name: tName, quantity: 0, revenue: 0 };
          }
          
          const itemQty = item.quantity || 1;
          toppingStats[tName].quantity += (tQty * itemQty);
          
          // 🌟 ใช้ tPrice ที่ดึงมาจากในบิลเลย ยอดไม่เพี้ยนแน่นอน
          const tRev = tPrice * tQty * itemQty;
          
          toppingStats[tName].revenue += tRev;
          currentItemToppingsRevenue += tRev;
        });
      }

      if (!productStats[pName]) {
        productStats[pName] = { name: pName, quantity: 0, revenue: 0, menuOnlyRevenue: 0 };
      }
      
      productStats[pName].quantity += itemQty;
      productStats[pName].revenue += (pPrice * itemQty);
      // 🌟 หักลบค่าท็อปปิ้งออกจากรายได้รวม จะได้รายได้เมนูแบบเพียวๆ
      productStats[pName].menuOnlyRevenue += ((pPrice * itemQty) - currentItemToppingsRevenue);
    });
  });

  const topProductsChartData = Object.values(productStats)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const mostSoldProduct = Object.values(productStats)
    .sort((a, b) => b.quantity - a.quantity)[0];

  const topToppingsByQuantity = Object.values(toppingStats)
    .sort((a, b) => b.quantity - a.quantity); 
  const mostSoldTopping = topToppingsByQuantity[0]; 

  const topToppingsByRevenue = Object.values(toppingStats)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // ==========================================
  // 🌟 ฟังก์ชัน Export Excel
  // ==========================================
  const exportToExcel = () => {
    if (filteredOrders.length === 0) {
      alert("ไม่มีข้อมูลให้ Export ในช่วงเวลานี้ครับ");
      return;
    }

    const dates = filteredOrders.map(o => new Date(o.createdAt).getTime());
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    const dateRangeText = `ข้อมูลยอดขายตั้งแต่วันที่ ${formatDate(minDate.toISOString())} ถึง ${formatDate(maxDate.toISOString())}`;

    const orderSummaryData: any[] = []; 
    const itemDetailsData: any[] = [];  
    
    let totalItemsCount = 0;
    let totalItemsRevenue = 0;
    
    filteredOrders.forEach((order) => {
      const orderTotal = order.items.reduce((sum: number, item: any) => {
        const price = item.price || item.product?.price || 0;
        return sum + (price * (item.quantity || 1));
      }, 0);

      orderSummaryData.push({
        "เลขที่บิล": order.dailyNumber || order.id || "-",
        "วันที่เวลา": formatDate(order.createdAt),
        "จำนวนรายการสินค้า": order.items.length,
        "ยอดรวมทั้งสิ้น (บาท)": orderTotal
      });

      order.items.forEach((item: any) => {
        const sizeText = item.size ? ` [${item.size}]` : "";
        const toppingText = item.toppings ? ` +${item.toppings}` : "";
        
        const itemPrice = item.price || item.product?.price || 0;
        const itemQty = item.quantity || 1;
        const itemTotal = itemPrice * itemQty;

        totalItemsCount += itemQty;
        totalItemsRevenue += itemTotal;

        itemDetailsData.push({
          "เลขที่บิล": order.dailyNumber || order.id || "-",
          "วันที่": formatDate(order.createdAt),
          "รายการสินค้า": (item.product?.name || "สินค้าไม่ทราบชื่อ") + sizeText + toppingText,
          "ราคาต่อหน่วย (บาท)": itemPrice,
          "จำนวน (ชิ้น)": itemQty,
          "ยอดรวม (บาท)": itemTotal,
          "หมายเหตุ": item.note || "-"
        });
      });
    });

    // 🌟 ดึงข้อมูลเมนูหลักมาจัดเรียงตามรายได้เพียวๆ (ไม่รวมท็อปปิ้ง)
    const menuSummaryData = Object.values(productStats)
      .sort((a, b) => b.menuOnlyRevenue - a.menuOnlyRevenue)
      .map((p, index) => ({
        "อันดับ": index + 1,
        "ชื่อเมนูหลัก": p.name,
        "จำนวนที่ขายได้ (ชิ้น/แก้ว)": p.quantity,
        "รายได้เฉพาะเมนู (บาท)": p.menuOnlyRevenue, // รายได้เพียวๆ
        "รายได้รวมท็อปปิ้ง (บาท)": p.revenue       // รายได้ที่โดนท็อปปิ้งดันยอด
      }));

    const totalMenuCount = menuSummaryData.reduce((sum, p) => sum + p["จำนวนที่ขายได้ (ชิ้น/แก้ว)"], 0);
    const totalMenuOnlyRevenue = menuSummaryData.reduce((sum, p) => sum + p["รายได้เฉพาะเมนู (บาท)"], 0);
    const totalMenuRevenueWithToppings = menuSummaryData.reduce((sum, p) => sum + p["รายได้รวมท็อปปิ้ง (บาท)"], 0);

    const toppingSummaryData = Object.values(toppingStats)
      .sort((a, b) => b.revenue - a.revenue)
      .map((t, index) => ({
        "อันดับ": index + 1,
        "ชื่อท็อปปิ้ง": t.name,
        "จำนวนที่ขายได้ (ครั้ง)": t.quantity,
        "รายได้รวม (บาท)": t.revenue
      }));

    const totalToppingsCount = toppingSummaryData.reduce((sum, t) => sum + t["จำนวนที่ขายได้ (ครั้ง)"], 0);
    const totalToppingsRevenue = toppingSummaryData.reduce((sum, t) => sum + t["รายได้รวม (บาท)"], 0);

    const createSheetWithHeaderFooter = (title: string, data: any[], totals: any) => {
      const ws = XLSX.utils.aoa_to_sheet([
        [title],             
        [dateRangeText],     
        []                   
      ]);

      if (data.length > 0) {
        XLSX.utils.sheet_add_json(ws, data, { origin: "A4" });
        const totalRowIndex = 4 + data.length + 1; 
        XLSX.utils.sheet_add_json(ws, [totals], { 
          origin: `A${totalRowIndex}`, 
          skipHeader: true, 
          header: Object.keys(totals) 
        });
      } else {
        XLSX.utils.sheet_add_json(ws, [{"ข้อมูล": "ไม่มีข้อมูลในช่วงเวลานี้"}], { origin: "A4" });
      }

      return ws;
    };

    const summarySheet = createSheetWithHeaderFooter(
      "รายงานสรุปยอดขายรายบิล", orderSummaryData, 
      { "เลขที่บิล": "สรุปยอดรวมทั้งสิ้น", "วันที่เวลา": "", "จำนวนรายการสินค้า": orderSummaryData.reduce((sum, o) => sum + o["จำนวนรายการสินค้า"], 0), "ยอดรวมทั้งสิ้น (บาท)": totalRevenue }
    );

    const detailsSheet = createSheetWithHeaderFooter(
      "รายงานรายละเอียดสินค้าที่ขายได้", itemDetailsData, 
      { "เลขที่บิล": "สรุปยอดรวมทั้งสิ้น", "วันที่": "", "รายการสินค้า": "", "ราคาต่อหน่วย (บาท)": "", "จำนวน (ชิ้น)": totalItemsCount, "ยอดรวม (บาท)": totalItemsRevenue, "หมายเหตุ": "" }
    );

    // 🌟 สร้าง Sheet ที่ 3: สรุปยอดเมนูหลัก (ไม่รวมท็อปปิ้ง)
    const menuSheet = createSheetWithHeaderFooter(
      "รายงานสรุปยอดขายเมนูหลัก (แยกท็อปปิ้ง)", menuSummaryData, 
      { "อันดับ": "สรุปยอดรวมทั้งสิ้น", "ชื่อเมนูหลัก": "", "จำนวนที่ขายได้ (ชิ้น/แก้ว)": totalMenuCount, "รายได้เฉพาะเมนู (บาท)": totalMenuOnlyRevenue, "รายได้รวมท็อปปิ้ง (บาท)": totalMenuRevenueWithToppings }
    );

    const toppingSheet = createSheetWithHeaderFooter(
      "รายงานสรุปรายได้ท็อปปิ้ง", toppingSummaryData, 
      { "อันดับ": "สรุปยอดรวมทั้งสิ้น", "ชื่อท็อปปิ้ง": "", "จำนวนที่ขายได้ (ครั้ง)": totalToppingsCount, "รายได้รวม (บาท)": totalToppingsRevenue }
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, summarySheet, "สรุปยอดรายบิล");
    XLSX.utils.book_append_sheet(workbook, detailsSheet, "รายละเอียดสินค้า");
    XLSX.utils.book_append_sheet(workbook, menuSheet, "สรุปยอดเมนูหลัก"); // แทรกชีทใหม่เข้าไป
    XLSX.utils.book_append_sheet(workbook, toppingSheet, "สรุปยอดท็อปปิ้ง");

    const fileName = `sales_history_${timeFilter === 'all' ? 'all' : timeFilter + '_days'}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      
      <Sidebar />

      <main className="flex-1 p-8 h-screen overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">📊 แดชบอร์ดสรุปยอดขาย</h1>
              <p className="text-gray-500 mt-1">ข้อมูลเชิงลึกและประวัติการขายทั้งหมด</p>
            </div>
            
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

              <button 
                onClick={exportToExcel}
                className="bg-green-600 text-white px-4 py-2.5 rounded-xl font-bold shadow-sm hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                📥 Export Excel
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 border-l-4 border-l-blue-500">
                  <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center text-2xl shrink-0">💰</div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium text-gray-500">รายรับรวม</p>
                    <p className="text-2xl font-bold text-gray-800 truncate">฿{totalRevenue.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 border-l-4 border-l-purple-500">
                  <div className="w-14 h-14 bg-purple-50 rounded-full flex items-center justify-center text-2xl shrink-0">🧾</div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium text-gray-500">จำนวนบิล</p>
                    <p className="text-2xl font-bold text-gray-800 truncate">{totalOrders} <span className="text-sm font-normal text-gray-500">รายการ</span></p>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 border-l-4 border-l-orange-500">
                  <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center text-2xl shrink-0">🏆</div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium text-gray-500">เมนูขายดีสุด</p>
                    <p className="text-xl font-bold text-gray-800 truncate" title={mostSoldProduct?.name}>
                      {mostSoldProduct ? mostSoldProduct.name : "-"}
                    </p>
                    {mostSoldProduct && (
                      <p className="text-xs text-green-600 font-bold mt-1 truncate">
                        ขายได้ {mostSoldProduct.quantity} รายการ
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 border-l-4 border-l-pink-500">
                  <div className="w-14 h-14 bg-pink-50 rounded-full flex items-center justify-center text-2xl shrink-0">✨</div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium text-gray-500">ท็อปปิ้งยอดฮิต</p>
                    <p className="text-xl font-bold text-gray-800 truncate" title={mostSoldTopping?.name}>
                      {mostSoldTopping ? mostSoldTopping.name : "-"}
                    </p>
                    {mostSoldTopping && (
                      <p className="text-xs text-pink-600 font-bold mt-1 truncate">
                        ถูกสั่งไป {mostSoldTopping.quantity} ครั้ง
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                <div className="space-y-8">
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
                            <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} name="รายได้ (บาท)" barSize={40}activeBar={{ fill: '#1E3A8A' }}/>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-72 flex items-center justify-center text-gray-400 font-medium">ไม่มีข้อมูลในช่วงเวลานี้</div>
                    )}
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                      <span>✨</span> 5 อันดับท็อปปิ้งทำรายได้สูงสุด
                    </h2>
                    {topToppingsByRevenue.length > 0 ? (
                      <div className="space-y-3">
                        {topToppingsByRevenue.map((t, index) => (
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

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full min-h-[600px] max-h-[800px]">
                  <h2 className="text-lg font-bold text-gray-700 mb-4">📝 ประวัติบิล ({timeFilter === 'all' ? 'ทั้งหมด' : `${timeFilter} วันล่าสุด`})</h2>
                  <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                    {filteredOrders.length === 0 ? (
                      <div className="text-center text-gray-400 py-10">ไม่มีบิลในช่วงเวลานี้</div>
                    ) : (
                      filteredOrders.map((order) => {
                        const orderTotal = order.items.reduce((sum: number, item: any) => sum + ((item.price || item.product.price) * item.quantity), 0);
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
                            <div className="space-y-2 mt-3">
                              {order.items?.map((item: any, index: number) => {
                                const pName = item.product?.name || "สินค้าไม่ทราบชื่อ";
                                const pPrice = item.price || item.product?.price || 0; 
                                const pQty = item.quantity || 1;
                                
                                return (
                                  <div key={index} className="flex justify-between text-gray-700 text-xs items-start border-t border-gray-100 pt-2 first:border-0 first:pt-0">
                                    <div className="flex-1 pr-4">
                                      <span className="font-bold">{pName} <span className="text-gray-400 font-normal ml-1">x{pQty}</span></span>
                                      
                                      <div className="text-[10px] text-gray-500 mt-0.5 space-y-0.5">
                                        {item.size && <p>• {item.size}</p>}
                                        {item.toppings && <p>• ท็อปปิ้ง: {item.toppings}</p>}
                                        {item.note && <p className="text-orange-500">หมายเหตุ: {item.note}</p>}
                                      </div>
                                    </div>
                                    <span className="font-bold text-gray-800">฿{pPrice * pQty}</span>
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
    </div>
  );
}