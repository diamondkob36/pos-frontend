"use client";
import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import ToppingManager from "../_components/ToppingManager";
import { useAuth } from "../../hooks/useAuth";

export default function ToppingsPage() {
  const { currentUser } = useAuth(["manager", "supervisor"]);
  const [toppings, setToppings] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentUser && ["manager", "supervisor"].includes(currentUser.role)) fetchData();
  }, [currentUser]);

  const fetchData = () => {
    setIsLoading(true);
    
    // 🌟 ดึง Token และตั้งค่า Headers
    const token = localStorage.getItem("pos_token");
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };

    Promise.all([
      fetch("http://localhost:3001/toppings", { headers }).then(res => res.json()),
      fetch("http://localhost:3001/categories", { headers }).then(res => res.json())
    ]).then(([toppingsData, categoriesData]) => {
      // 🌟 ดัก isArray กันพัง
      setToppings(Array.isArray(toppingsData) ? toppingsData : []); 
      setCategories(Array.isArray(categoriesData) ? categoriesData : []); 
      setIsLoading(false);
    }).catch(error => {
      console.error("Error:", error);
      setIsLoading(false);
    });
  };

  if (!currentUser || !["manager", "supervisor"].includes(currentUser.role)) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8 h-screen overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">✨ จัดการท็อปปิ้ง</h1>
          {isLoading ? <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div> : (
            <ToppingManager toppings={toppings} categories={categories} fetchData={fetchData} />
          )}
        </div>
      </main>
    </div>
  );
}