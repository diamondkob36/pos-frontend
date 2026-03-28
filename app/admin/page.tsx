"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";

// 🌟 นำเข้า 3 Components ที่เราเพิ่งสร้าง
import CategoryManager from "../components/CategoryManager";
import ProductManager from "../components/ProductManager";
import ToppingManager from "../components/ToppingManager";

export default function AdminPage() {
  const router = useRouter();
  
  // 🌟 เก็บแค่ State ส่วนกลาง (Global States)
  const [products, setProducts] = useState<any[]>([]);
  const [toppings, setToppings] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🌟 เช็คสิทธิ์การใช้งาน
  useEffect(() => {
    const userStr = localStorage.getItem("pos_user");
    if (!userStr) {
      router.push("/login");
      return;
    }
    const user = JSON.parse(userStr);
    if (user.role !== "manager") {
      alert("คุณไม่มีสิทธิ์เข้าถึงหน้านี้ครับ (เฉพาะผู้จัดการเท่านั้น) ❌");
      router.push("/");
    } else {
      fetchData(); // ดึงข้อมูลเฉพาะตอนที่มั่นใจว่าเป็น Manager แล้ว
    }
  }, [router]);

  // 🌟 ฟังก์ชันดึงข้อมูลจากหลังบ้าน
  const fetchData = () => {
    setIsLoading(true);
    Promise.all([
      fetch("http://localhost:3001/products").then(res => res.json()),
      fetch("http://localhost:3001/toppings").then(res => res.json()),
      fetch("http://localhost:3001/categories").then(res => res.json())
    ]).then(([productsData, toppingsData, categoriesData]) => {
      setProducts(productsData);
      setToppings(toppingsData);
      setCategories(categoriesData);
      setIsLoading(false);
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 p-8 h-screen overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">⚙️ ระบบจัดการหลังร้าน</h1>
          </div>

          {isLoading ? (
             <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-3 lg:grid-cols-2 gap-8">
              
              {/* 🌟 โยน Props เข้าไปให้ Components ลูกจัดการต่อ */}
              <CategoryManager categories={categories} fetchData={fetchData} />
              
              <ProductManager products={products} categories={categories} fetchData={fetchData} />
              
              <ToppingManager toppings={toppings} categories={categories} fetchData={fetchData} />

            </div>
          )}
        </div>
      </main>
    </div>
  );
}