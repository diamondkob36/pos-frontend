"use client";
import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import CategoryManager from "../_components/CategoryManager";
import { useAuth } from "../../hooks/useAuth";

export default function CategoriesPage() {
  const { currentUser } = useAuth(["manager", "supervisor"]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentUser && ["manager", "supervisor"].includes(currentUser.role)) fetchData();
  }, [currentUser]);

  const fetchData = () => {
    setIsLoading(true);
    
    const token = localStorage.getItem("pos_token");
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };

    fetch("http://localhost:3001/categories", { headers })
      .then(res => res.json())
      .then(data => {
        setCategories(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch(error => {
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
          <h1 className="text-3xl font-bold text-gray-800 mb-8">🗂️ จัดการหมวดหมู่สินค้า</h1>
          {isLoading ? <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div> : (
            <CategoryManager categories={categories} fetchData={fetchData} />
          )}
        </div>
      </main>
    </div>
  );
}