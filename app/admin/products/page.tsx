"use client";
import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import ScrollToTop from "../../_components/ScrollToTop";
import ProductManager from "../_components/ProductManager";
import { useAuth } from "../../hooks/useAuth";

export default function ProductsPage() {
  const { currentUser } = useAuth(["manager", "supervisor"]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentUser && ["manager", "supervisor"].includes(currentUser.role)) fetchData();
  }, [currentUser]);

  const fetchData = () => {
    setIsLoading(true);
    
    // 🌟 1. ดึง Token จากเครื่อง
    const token = localStorage.getItem("pos_token");
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}` // 🌟 2. แนบกุญแจเข้ากับ Header
    };

    Promise.all([
      // 🌟 3. ใส่ { headers } พ่วงท้ายไปกับ fetch
      fetch("http://localhost:3001/products", { headers }).then(res => res.json()),
      fetch("http://localhost:3001/categories", { headers }).then(res => res.json())
    ]).then(([productsData, categoriesData]) => {
      
      // 🌟 4. ดัก Array.isArray เพื่อป้องกันระบบพังกรณี Token หมดอายุ
      setProducts(Array.isArray(productsData) ? productsData : []); 
      setCategories(Array.isArray(categoriesData) ? categoriesData : []); 
      setIsLoading(false);
      
    }).catch(error => {
      console.error("ดึงข้อมูลไม่สำเร็จ:", error);
      setIsLoading(false);
    });
  };

  if (!currentUser || !["manager", "supervisor"].includes(currentUser.role)) return null;

  return (
    <div className="flex min-h-screen lg:h-screen bg-gray-50 lg:overflow-hidden">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 lg:h-screen lg:overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8">☕ จัดการเมนูสินค้า</h1>
          {isLoading ? <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div> : (
            <ProductManager products={products} categories={categories} fetchData={fetchData} />
          )}
        </div>
      </main>

      {/* ปุ่มเลื่อนขึ้นด้านบน */}
      <ScrollToTop />
    </div>
  );
}