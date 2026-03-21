"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "../components/Sidebar";

export default function AdminPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [toppings, setToppings] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]); // 🌟 State เก็บหมวดหมู่
  const [isLoading, setIsLoading] = useState(true);

  // 🌟 ฟอร์มหมวดหมู่ (Category)
  const [catValue, setCatValue] = useState("");
  const [catLabel, setCatLabel] = useState("");
  const [catHasType, setCatHasType] = useState(false);
  const [catHasSize, setCatHasSize] = useState(false);
  const [editingCatId, setEditingCatId] = useState<number | null>(null);

  // ฟอร์มสินค้า
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [category, setCategory] = useState(""); 
  const [editingId, setEditingId] = useState<number | null>(null);

  // ฟอร์มท็อปปิ้ง
  const [toppingName, setToppingName] = useState("");
  const [toppingPrice, setToppingPrice] = useState("");
  const [toppingImage, setToppingImage] = useState("");
  const [toppingCategory, setToppingCategory] = useState("");
  const [editingToppingId, setEditingToppingId] = useState<number | null>(null);

  const [productFilter, setProductFilter] = useState("all");
  const [toppingFilter, setToppingFilter] = useState("all");

  const fetchData = () => {
    setIsLoading(true);
    Promise.all([
      fetch("http://localhost:3001/products").then(res => res.json()),
      fetch("http://localhost:3001/toppings").then(res => res.json()),
      fetch("http://localhost:3001/categories").then(res => res.json()) // 🌟 ดึงข้อมูลหมวดหมู่
    ]).then(([productsData, toppingsData, categoriesData]) => {
      setProducts(productsData);
      setToppings(toppingsData);
      setCategories(categoriesData);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🌟 ตั้งค่าเริ่มต้นให้ Dropdown ถ้ายังไม่ได้เลือกอะไร
  useEffect(() => {
    if (categories.length > 0 && !category) {
      setCategory(categories[0].value);
      setToppingCategory(categories[0].value);
    }
  }, [categories]);

  // ==========================================
  // 🌟 จัดการหมวดหมู่ (Category CRUD)
  // ==========================================
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { value: catValue, label: catLabel, hasType: catHasType, hasSize: catHasSize };
    const url = editingCatId ? `http://localhost:3001/categories/${editingCatId}` : "http://localhost:3001/categories";
    const method = editingCatId ? "PUT" : "POST";

    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setCatValue(""); setCatLabel(""); setCatHasType(false); setCatHasSize(false); setEditingCatId(null);
    fetchData();
  };

  const handleEditCategory = (c: any) => {
    setCatValue(c.value); setCatLabel(c.label); setCatHasType(c.hasType); setCatHasSize(c.hasSize); setEditingCatId(c.id);
  };

  const handleDeleteCategory = async (id: number) => {
    if (confirm("แน่ใจหรือไม่ที่จะลบหมวดหมู่นี้? (หากลบ เมนูที่อยู่ในหมวดหมู่นี้อาจไม่แสดงผลบนหน้าจอ)")) {
      await fetch(`http://localhost:3001/categories/${id}`, { method: "DELETE" });
      fetchData();
    }
  };

  // --- จัดการสินค้า ---
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name, price: Number(price), image, category };
    const url = editingId ? `http://localhost:3001/products/${editingId}` : "http://localhost:3001/products";
    const method = editingId ? "PUT" : "POST";

    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setName(""); setPrice(""); setImage(""); setCategory(categories[0]?.value || ""); setEditingId(null);
    fetchData();
  };

  const handleEditProduct = (p: any) => {
    setName(p.name); setPrice(p.price); setImage(p.image); setCategory(p.category || categories[0]?.value); setEditingId(p.id);
  };

  const handleDeleteProduct = async (id: number) => {
    if (confirm("แน่ใจหรือไม่ที่จะลบสินค้านี้?")) {
      await fetch(`http://localhost:3001/products/${id}`, { method: "DELETE" });
      fetchData();
    }
  };

  // --- จัดการท็อปปิ้ง ---
  const handleSaveTopping = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name: toppingName, price: Number(toppingPrice), category: toppingCategory, image: toppingImage };
    const url = editingToppingId ? `http://localhost:3001/toppings/${editingToppingId}` : "http://localhost:3001/toppings";
    const method = editingToppingId ? "PUT" : "POST";

    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setToppingName(""); setToppingPrice(""); setToppingImage(""); setToppingCategory(categories[0]?.value || ""); setEditingToppingId(null);
    fetchData();
  };

  const handleEditTopping = (t: any) => {
    setToppingName(t.name); setToppingPrice(t.price); setToppingImage(t.image || ""); setToppingCategory(t.category || categories[0]?.value); setEditingToppingId(t.id);
  };

  const handleDeleteTopping = async (id: number) => {
    if (confirm("ลบท็อปปิ้งนี้?")) {
      await fetch(`http://localhost:3001/toppings/${id}`, { method: "DELETE" });
      fetchData();
    }
  };

  const filteredProducts = productFilter === "all" ? products : products.filter(p => p.category === productFilter);
  const filteredToppings = toppingFilter === "all" ? toppings : toppings.filter(t => t.category === toppingFilter);

  // ฟังก์ชันหาชื่อหมวดหมู่ภาษาไทยเพื่อเอาไปโชว์ให้สวยๆ
  const getCategoryLabel = (val: string) => categories.find(c => c.value === val)?.label || val;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 p-8 h-screen overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">⚙️ ระบบจัดการหลังร้าน</h1>
          </div>

          {/* ปรับเป็น 3 คอลัมน์ (หรือ 2 คอลัมน์ถ้าจอเล็ก) */}
          <div className="grid grid-cols-1 xl:grid-cols-3 lg:grid-cols-2 gap-8">
            
            {/* ================= โซนหมวดหมู่ (หมวดหมู่) ================= */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col max-h-[85vh]">
              <h2 className="text-xl font-bold mb-4 text-emerald-600 shrink-0">🗂️ จัดการหมวดหมู่เมนู</h2>
              
              <form onSubmit={handleSaveCategory} className="mb-4 flex flex-col gap-3 bg-gray-50 p-4 rounded-xl shrink-0 border border-gray-200">
                <input type="text" placeholder="ชื่อที่แสดงผล (เช่น อาหารคาว)" value={catLabel} onChange={e => setCatLabel(e.target.value)} required className="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-gray-900 bg-white" />
                <input type="text" placeholder="รหัสอ้างอิงภาษาอังกฤษ (เช่น food)" value={catValue} onChange={e => setCatValue(e.target.value)} required className="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-gray-900 bg-white" />
                
                <div className="flex flex-col gap-2 mt-1">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                    <input type="checkbox" checked={catHasType} onChange={e => setCatHasType(e.target.checked)} className="w-4 h-4 accent-emerald-600" />
                    มีให้เลือกประเภท (ร้อน/เย็น/ปั่น)
                  </label>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                    <input type="checkbox" checked={catHasSize} onChange={e => setCatHasSize(e.target.checked)} className="w-4 h-4 accent-emerald-600" />
                    มีให้เลือกขนาดไซส์ (S, M, L)
                  </label>
                </div>

                <button type="submit" className="mt-2 bg-emerald-600 text-white py-2.5 rounded-lg font-bold hover:bg-emerald-700 transition-colors shadow-sm">
                  {editingCatId ? "อัปเดตหมวดหมู่" : "+ เพิ่มหมวดหมู่ใหม่"}
                </button>
              </form>

              <div className="space-y-3 overflow-y-auto flex-1 pr-2">
                {categories.length === 0 ? <p className="text-center text-gray-400 py-4 font-medium">ยังไม่มีข้อมูลหมวดหมู่</p> : null}
                {categories.map(c => (
                  <div key={c.id} className="p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors bg-white shadow-sm flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-gray-800">{c.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">รหัส: {c.value}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleEditCategory(c)} className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-bold hover:bg-yellow-200">แก้</button>
                        <button onClick={() => handleDeleteCategory(c.id)} className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-xs font-bold hover:bg-red-200">ลบ</button>
                      </div>
                    </div>
                    <div className="flex gap-2 text-[10px]">
                      {c.hasType ? <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md font-bold">✓ ร้อน/เย็น</span> : <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md">✗ ร้อน/เย็น</span>}
                      {c.hasSize ? <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md font-bold">✓ ไซส์แก้ว</span> : <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md">✗ ไซส์แก้ว</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ================= โซนสินค้า ================= */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col max-h-[85vh]">
              <h2 className="text-xl font-bold mb-4 text-blue-600 shrink-0">📦 จัดการเมนูสินค้า</h2>
              <form onSubmit={handleSaveProduct} className="mb-4 grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-xl shrink-0 border border-gray-200">
                <input type="text" placeholder="ชื่อเมนู" value={name} onChange={e => setName(e.target.value)} required className="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900 bg-white" />
                <input type="number" placeholder="ราคาตั้งต้น (บาท)" value={price} onChange={e => setPrice(e.target.value)} required className="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900 bg-white" />
                <input type="text" placeholder="URL รูปภาพ" value={image} onChange={e => setImage(e.target.value)} required className="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 col-span-2 font-medium text-gray-900 bg-white" />
                
                {/* 🌟 ดึงข้อมูลหมวดหมู่มาแสดงแบบอัตโนมัติ */}
                <select value={category} onChange={e => setCategory(e.target.value)} className="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 col-span-2 font-bold text-gray-900 bg-white cursor-pointer">
                  {categories.map(c => (
                    <option key={c.id} value={c.value}>🗂️ {c.label}</option>
                  ))}
                  {categories.length === 0 && <option value="">(กรุณาสร้างหมวดหมู่ก่อน)</option>}
                </select>

                <button type="submit" disabled={categories.length === 0} className={`col-span-2 py-2.5 rounded-lg font-bold transition-colors shadow-sm ${categories.length === 0 ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                  {editingId ? "อัปเดตเมนู" : "+ เพิ่มเมนูใหม่"}
                </button>
              </form>

              {/* 🌟 ดึงปุ่ม Filter มาแสดงแบบอัตโนมัติ */}
              <div className="flex gap-2 mb-3 shrink-0 overflow-x-auto pb-2 custom-scrollbar">
                <button onClick={() => setProductFilter("all")} className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${productFilter === "all" ? "bg-blue-600 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>ทั้งหมด</button>
                {categories.map(c => (
                  <button key={c.id} onClick={() => setProductFilter(c.value)} className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${productFilter === c.value ? "bg-blue-600 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                    {c.label}
                  </button>
                ))}
              </div>

              <div className="space-y-3 overflow-y-auto flex-1 pr-2">
                {filteredProducts.length === 0 ? <p className="text-center text-gray-400 py-4 font-medium">ไม่พบเมนูในหมวดหมู่นี้</p> : null}
                {filteredProducts.map(p => (
                  <div key={p.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors bg-white shadow-sm">
                    <div className="flex items-center gap-3">
                      <img src={p.image} className="w-12 h-12 object-cover rounded-md bg-gray-100 border border-gray-200" alt={p.name} />
                      <div>
                        <p className="font-bold text-gray-800">{p.name}</p>
                        <p className="text-xs font-medium text-gray-500 mt-0.5">฿{p.price} • {getCategoryLabel(p.category)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEditProduct(p)} className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-bold hover:bg-yellow-200">แก้</button>
                      <button onClick={() => handleDeleteProduct(p.id)} className="px-3 py-1.5 bg-red-100 text-red-600 rounded-lg text-xs font-bold hover:bg-red-200">ลบ</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ================= โซนท็อปปิ้ง ================= */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col max-h-[85vh]">
              <h2 className="text-xl font-bold mb-4 text-purple-600 shrink-0">✨ จัดการท็อปปิ้ง</h2>
              <form onSubmit={handleSaveTopping} className="mb-4 grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-xl shrink-0 border border-gray-200">
                <input type="text" placeholder="ชื่อท็อปปิ้ง" value={toppingName} onChange={e => setToppingName(e.target.value)} required className="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500 font-medium text-gray-900 bg-white" />
                <input type="number" placeholder="ราคา (+บาท)" value={toppingPrice} onChange={e => setToppingPrice(e.target.value)} required className="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500 font-medium text-gray-900 bg-white" />
                <input type="text" placeholder="URL รูปภาพ (ตัวเลือกเสริม)" value={toppingImage} onChange={e => setToppingImage(e.target.value)} className="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500 col-span-2 font-medium text-gray-900 bg-white" />
                
                <select value={toppingCategory} onChange={e => setToppingCategory(e.target.value)} className="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500 col-span-2 font-bold text-gray-900 bg-white cursor-pointer">
                  {categories.map(c => (
                    <option key={c.id} value={c.value}>🗂️ ใช้สำหรับหมวด: {c.label}</option>
                  ))}
                  {categories.length === 0 && <option value="">(กรุณาสร้างหมวดหมู่ก่อน)</option>}
                </select>

                <button type="submit" disabled={categories.length === 0} className={`col-span-2 py-2.5 rounded-lg font-bold transition-colors shadow-sm ${categories.length === 0 ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700'}`}>
                  {editingToppingId ? "อัปเดตท็อปปิ้ง" : "+ เพิ่มท็อปปิ้งใหม่"}
                </button>
              </form>

              <div className="flex gap-2 mb-3 shrink-0 overflow-x-auto pb-2 custom-scrollbar">
                <button onClick={() => setToppingFilter("all")} className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${toppingFilter === "all" ? "bg-purple-600 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>ทั้งหมด</button>
                {categories.map(c => (
                  <button key={c.id} onClick={() => setToppingFilter(c.value)} className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${toppingFilter === c.value ? "bg-purple-600 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                    ของ {c.label}
                  </button>
                ))}
              </div>

              <div className="space-y-3 overflow-y-auto flex-1 pr-2">
                {filteredToppings.length === 0 ? <p className="text-center text-gray-400 py-4 font-medium">ไม่พบท็อปปิ้งในหมวดหมู่นี้</p> : null}
                {filteredToppings.map(t => (
                  <div key={t.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors bg-white shadow-sm">
                    <div className="flex items-center gap-3">
                      {t.image ? <img src={t.image} className="w-12 h-12 object-cover rounded-full border border-gray-200 bg-white" alt={t.name} /> : <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center text-xl font-bold border border-purple-100">✨</div>}
                      <div>
                        <p className="font-bold text-gray-800">{t.name}</p>
                        <p className="text-xs font-medium text-gray-500 mt-0.5">+{t.price} บาท • {getCategoryLabel(t.category)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEditTopping(t)} className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-bold hover:bg-yellow-200">แก้</button>
                      <button onClick={() => handleDeleteTopping(t.id)} className="px-3 py-1.5 bg-red-100 text-red-600 rounded-lg text-xs font-bold hover:bg-red-200">ลบ</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}