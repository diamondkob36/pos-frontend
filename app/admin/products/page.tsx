"use client";
import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
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
    Promise.all([
      fetch("http://localhost:3001/products").then(res => res.json()),
      fetch("http://localhost:3001/categories").then(res => res.json())
    ]).then(([productsData, categoriesData]) => {
      setProducts(productsData); setCategories(categoriesData); setIsLoading(false);
    });
  };

  if (!currentUser || !["manager", "supervisor"].includes(currentUser.role)) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8 h-screen overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">☕ จัดการเมนูสินค้า</h1>
          {isLoading ? <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div> : (
            <ProductManager products={products} categories={categories} fetchData={fetchData} />
          )}
        </div>
      </main>
    </div>
  );
}