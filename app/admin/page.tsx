"use client";

import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import CategoryManager from "./_components/CategoryManager";
import ProductManager from "./_components/ProductManager";
import ToppingManager from "./_components/ToppingManager";

// 🔌 นำเข้า useAuth
import { useAuth } from "../hooks/useAuth";

export default function AdminPage() {
  // 🔌 เสียบปลั๊กระบบเช็คสิทธิ์ และบังคับว่าต้องเป็น "manager" เท่านั้น
  const { currentUser } = useAuth("manager");
  
  const [products, setProducts] = useState<any[]>([]);
  const [toppings, setToppings] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🌟 ดึงข้อมูลเฉพาะตอนที่มั่นใจแล้วว่ามีผู้ใช้ล็อกอินและเป็น manager
  useEffect(() => {
    if (currentUser?.role === "manager") {
      fetchData(); 
    }
  }, [currentUser]);

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

  // ถ้าระบบยังเช็คข้อมูลไม่เสร็จ หรือยังไม่มีข้อมูล currentUser ไม่ต้องวาดหน้าต่าง
  if (!currentUser || currentUser.role !== "manager") return null;

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