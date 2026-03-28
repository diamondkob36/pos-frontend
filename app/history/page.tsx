"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import * as XLSX from 'xlsx';
import Sidebar from "../components/Sidebar";

import StatCards from "./_components/StatCards";
import SalesCharts from "./_components/SalesCharts";
import OrderList from "./_components/OrderList";

export default function HistoryPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [dbToppings, setDbToppings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<string>("all");
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem("pos_user");
    if (!userStr) { router.push("/login"); return; }
    const user = JSON.parse(userStr);
    if (user.role !== "manager") {
      alert("คุณไม่มีสิทธิ์เข้าถึงหน้านี้ครับ (เฉพาะผู้จัดการเท่านั้น) ❌");
      router.push("/");
    }
  }, [router]);

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:3001/orders").then(res => res.json()),
      fetch("http://localhost:3001/toppings").then(res => res.json())
    ]).then(([ordersData, toppingsData]) => {
      setOrders(ordersData); setDbToppings(toppingsData); setIsLoading(false);
    }).catch((error) => {
      console.error("ดึงข้อมูลไม่สำเร็จ:", error); setIsLoading(false);
    });
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-"; 
    return date.toLocaleString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const now = new Date();
  
  const filteredOrders = orders.filter(order => {
    if (timeFilter === "all") return true;
    const diffDays = Math.abs(now.getTime() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    if (timeFilter === "1") return diffDays <= 1;
    if (timeFilter === "7") return diffDays <= 7;
    if (timeFilter === "14") return diffDays <= 14;
    if (timeFilter === "30") return diffDays <= 30;
    return true;
  });

  const totalOrders = filteredOrders.length;
  
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.items || []).reduce((itemSum: number, item: any) => itemSum + ((item.price || item.product?.price || 0) * item.quantity), 0), 0);

  const toppingPriceMap: Record<string, number> = {};
  dbToppings.forEach(t => toppingPriceMap[t.name] = t.price);

  const productStats: Record<string, { name: string, quantity: number, revenue: number, menuOnlyRevenue: number }> = {};
  const toppingStats: Record<string, { name: string, quantity: number, revenue: number }> = {}; 
  
  filteredOrders.forEach(order => {
    if (!order.items) return; 
    order.items.forEach((item: any) => {
      const pName = item.product?.name || "สินค้าไม่ทราบชื่อ";
      const pPrice = item.price || item.product?.price || 0;
      const itemQty = item.quantity || 1;
      let currentItemToppingsRevenue = 0;

      if (item.toppings) {
        item.toppings.split(',').map((t: string) => t.trim()).forEach((tStr: string) => {
          if (!tStr) return;
          const match = tStr.match(/(.+?)(?:\s+@(\d+(?:\.\d+)?))?(?:\s+x(\d+))?$/);
          const tName = match ? match[1].trim() : tStr;
          const tPrice = match && match[2] ? parseFloat(match[2]) : (toppingPriceMap[tName] || 0);
          const tQty = match && match[3] ? parseInt(match[3], 10) : 1; 

          if (!toppingStats[tName]) toppingStats[tName] = { name: tName, quantity: 0, revenue: 0 };
          toppingStats[tName].quantity += (tQty * itemQty);
          const tRev = tPrice * tQty * itemQty;
          toppingStats[tName].revenue += tRev;
          currentItemToppingsRevenue += tRev;
        });
      }

      if (!productStats[pName]) productStats[pName] = { name: pName, quantity: 0, revenue: 0, menuOnlyRevenue: 0 };
      productStats[pName].quantity += itemQty;
      productStats[pName].revenue += (pPrice * itemQty);
      productStats[pName].menuOnlyRevenue += ((pPrice * itemQty) - currentItemToppingsRevenue);
    });
  });

  const topProductsChartData = Object.values(productStats).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  const mostSoldProduct = Object.values(productStats).sort((a, b) => b.quantity - a.quantity)[0];
  const mostSoldTopping = Object.values(toppingStats).sort((a, b) => b.quantity - a.quantity)[0]; 
  const topToppingsByRevenue = Object.values(toppingStats).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  const exportToExcel = () => {
    if (filteredOrders.length === 0) return alert("ไม่มีข้อมูลให้ Export ในช่วงเวลานี้ครับ");

    const dates = filteredOrders.map(o => new Date(o.createdAt).getTime());
    const dateRangeText = `ข้อมูลยอดขายตั้งแต่วันที่ ${formatDate(new Date(Math.min(...dates)).toISOString())} ถึง ${formatDate(new Date(Math.max(...dates)).toISOString())}`;

    const orderSummaryData: any[] = []; const itemDetailsData: any[] = [];  
    let totalItemsCount = 0; let totalItemsRevenue = 0;
    
    filteredOrders.forEach((order) => {
      const orderTotal = order.items.reduce((sum: number, item: any) => sum + ((item.price || item.product?.price || 0) * (item.quantity || 1)), 0);
      orderSummaryData.push({ "เลขที่บิล": order.dailyNumber || order.id || "-", "วันที่เวลา": formatDate(order.createdAt), "จำนวนรายการสินค้า": order.items.length, "ยอดรวมทั้งสิ้น (บาท)": orderTotal });

      order.items.forEach((item: any) => {
        const itemPrice = item.price || item.product?.price || 0;
        const itemQty = item.quantity || 1;
        const itemTotal = itemPrice * itemQty;
        totalItemsCount += itemQty; totalItemsRevenue += itemTotal;

        itemDetailsData.push({ "เลขที่บิล": order.dailyNumber || order.id || "-", "วันที่": formatDate(order.createdAt), "รายการสินค้า": (item.product?.name || "ไม่ทราบชื่อ") + (item.size ? ` [${item.size}]` : "") + (item.toppings ? ` +${item.toppings}` : ""), "ราคาต่อหน่วย (บาท)": itemPrice, "จำนวน (ชิ้น)": itemQty, "ยอดรวม (บาท)": itemTotal, "หมายเหตุ": item.note || "-" });
      });
    });

    const menuSummaryData = Object.values(productStats).sort((a, b) => b.menuOnlyRevenue - a.menuOnlyRevenue).map((p, index) => ({ "อันดับ": index + 1, "ชื่อเมนูหลัก": p.name, "จำนวนที่ขายได้ (ชิ้น/แก้ว)": p.quantity, "รายได้เฉพาะเมนู (บาท)": p.menuOnlyRevenue, "รายได้รวมท็อปปิ้ง (บาท)": p.revenue }));
    const toppingSummaryData = Object.values(toppingStats).sort((a, b) => b.revenue - a.revenue).map((t, index) => ({ "อันดับ": index + 1, "ชื่อท็อปปิ้ง": t.name, "จำนวนที่ขายได้ (ครั้ง)": t.quantity, "รายได้รวม (บาท)": t.revenue }));

    const createSheetWithHeaderFooter = (title: string, data: any[], totals: any) => {
      const ws = XLSX.utils.aoa_to_sheet([[title], [dateRangeText], []]);
      if (data.length > 0) { XLSX.utils.sheet_add_json(ws, data, { origin: "A4" }); XLSX.utils.sheet_add_json(ws, [totals], { origin: `A${4 + data.length + 1}`, skipHeader: true, header: Object.keys(totals) }); } 
      else { XLSX.utils.sheet_add_json(ws, [{"ข้อมูล": "ไม่มีข้อมูลในช่วงเวลานี้"}], { origin: "A4" }); }
      return ws;
    };

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, createSheetWithHeaderFooter("รายงานสรุปยอดขายรายบิล", orderSummaryData, { "เลขที่บิล": "สรุปยอดรวม", "วันที่เวลา": "", "จำนวนรายการสินค้า": orderSummaryData.reduce((sum, o) => sum + o["จำนวนรายการสินค้า"], 0), "ยอดรวมทั้งสิ้น (บาท)": totalRevenue }), "สรุปยอดรายบิล");
    XLSX.utils.book_append_sheet(workbook, createSheetWithHeaderFooter("รายงานรายละเอียดสินค้าที่ขายได้", itemDetailsData, { "เลขที่บิล": "สรุปยอดรวม", "วันที่": "", "รายการสินค้า": "", "ราคาต่อหน่วย (บาท)": "", "จำนวน (ชิ้น)": totalItemsCount, "ยอดรวม (บาท)": totalItemsRevenue, "หมายเหตุ": "" }), "รายละเอียดสินค้า");
    XLSX.utils.book_append_sheet(workbook, createSheetWithHeaderFooter("รายงานสรุปยอดขายเมนูหลัก", menuSummaryData, { "อันดับ": "สรุปยอดรวม", "ชื่อเมนูหลัก": "", "จำนวนที่ขายได้ (ชิ้น/แก้ว)": menuSummaryData.reduce((sum, p) => sum + p["จำนวนที่ขายได้ (ชิ้น/แก้ว)"], 0), "รายได้เฉพาะเมนู (บาท)": menuSummaryData.reduce((sum, p) => sum + p["รายได้เฉพาะเมนู (บาท)"], 0), "รายได้รวมท็อปปิ้ง (บาท)": menuSummaryData.reduce((sum, p) => sum + p["รายได้รวมท็อปปิ้ง (บาท)"], 0) }), "สรุปยอดเมนูหลัก");
    XLSX.utils.book_append_sheet(workbook, createSheetWithHeaderFooter("รายงานสรุปรายได้ท็อปปิ้ง", toppingSummaryData, { "อันดับ": "สรุปยอดรวม", "ชื่อท็อปปิ้ง": "", "จำนวนที่ขายได้ (ครั้ง)": toppingSummaryData.reduce((sum, t) => sum + t["จำนวนที่ขายได้ (ครั้ง)"], 0), "รายได้รวม (บาท)": toppingSummaryData.reduce((sum, t) => sum + t["รายได้รวม (บาท)"], 0) }), "สรุปยอดท็อปปิ้ง");

    XLSX.writeFile(workbook, `sales_history_${timeFilter === 'all' ? 'all' : timeFilter + '_days'}.xlsx`);
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
                <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} className="bg-transparent text-gray-800 font-bold text-sm focus:outline-none cursor-pointer">
                  <option value="1">วันนี้ (24 ชม. ล่าสุด)</option>
                  <option value="7">7 วันย้อนหลัง</option>
                  <option value="14">14 วันย้อนหลัง</option>
                  <option value="30">30 วันย้อนหลัง</option>
                  <option value="all">ทั้งหมด</option>
                </select>
              </div>
              <button onClick={exportToExcel} className="bg-green-600 text-white px-4 py-2.5 rounded-xl font-bold shadow-sm hover:bg-green-700 transition-colors flex items-center gap-2">📥 Export Excel</button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
          ) : (
            <>
              {/* 🌟 1. ส่วนกล่องสรุปยอด */}
              <StatCards totalRevenue={totalRevenue} totalOrders={totalOrders} mostSoldProduct={mostSoldProduct} mostSoldTopping={mostSoldTopping} />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 🌟 2. ส่วนกราฟและจัดอันดับ */}
                <SalesCharts topProductsChartData={topProductsChartData} topToppingsByRevenue={topToppingsByRevenue} />

                {/* 🌟 3. ส่วนรายการบิล */}
                <OrderList filteredOrders={filteredOrders} timeFilter={timeFilter} formatDate={formatDate} />
              </div>
            </>
          )}

        </div>
      </main>
    </div>
  );
}