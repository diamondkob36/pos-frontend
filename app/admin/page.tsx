"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [toppings, setToppings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ฟอร์มสินค้า
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [category, setCategory] = useState("beverage");
  const [editingId, setEditingId] = useState<number | null>(null);

  // 🌟 ฟอร์มท็อปปิ้ง (เพิ่ม image และ editingToppingId)
  const [toppingName, setToppingName] = useState("");
  const [toppingPrice, setToppingPrice] = useState("");
  const [toppingImage, setToppingImage] = useState("");
  const [toppingCategory, setToppingCategory] = useState("beverage");
  const [editingToppingId, setEditingToppingId] = useState<number | null>(null);

  const fetchData = () => {
    setIsLoading(true);
    Promise.all([
      fetch("http://localhost:3001/products").then(res => res.json()),
      fetch("http://localhost:3001/toppings").then(res => res.json())
    ]).then(([productsData, toppingsData]) => {
      setProducts(productsData);
      setToppings(toppingsData);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- จัดการสินค้า ---
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name, price: Number(price), image, category };
    const url = editingId ? `http://localhost:3001/products/${editingId}` : "http://localhost:3001/products";
    const method = editingId ? "PUT" : "POST";

    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setName(""); setPrice(""); setImage(""); setCategory("beverage"); setEditingId(null);
    fetchData();
  };

  const handleEditProduct = (p: any) => {
    setName(p.name); setPrice(p.price); setImage(p.image); setCategory(p.category || "beverage"); setEditingId(p.id);
  };

  const handleDeleteProduct = async (id: number) => {
    if (confirm("แน่ใจหรือไม่ที่จะลบสินค้านี้?")) {
      await fetch(`http://localhost:3001/products/${id}`, { method: "DELETE" });
      fetchData();
    }
  };

  // --- 🌟 จัดการท็อปปิ้ง (รวม Create และ Edit ไว้ด้วยกัน) ---
  const handleSaveTopping = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { 
      name: toppingName, 
      price: Number(toppingPrice), 
      category: toppingCategory,
      image: toppingImage 
    };
    
    const url = editingToppingId ? `http://localhost:3001/toppings/${editingToppingId}` : "http://localhost:3001/toppings";
    const method = editingToppingId ? "PUT" : "POST";

    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    
    // เคลียร์ฟอร์ม
    setToppingName(""); setToppingPrice(""); setToppingImage(""); setToppingCategory("beverage"); setEditingToppingId(null);
    fetchData();
  };

  // 🌟 ฟังก์ชันดึงข้อมูลมาแก้ไข
  const handleEditTopping = (t: any) => {
    setToppingName(t.name);
    setToppingPrice(t.price);
    setToppingImage(t.image || "");
    setToppingCategory(t.category || "beverage");
    setEditingToppingId(t.id);
  };

  const handleDeleteTopping = async (id: number) => {
    if (confirm("ลบท็อปปิ้งนี้?")) {
      await fetch(`http://localhost:3001/toppings/${id}`, { method: "DELETE" });
      fetchData();
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">⚙️ ระบบจัดการหลังร้าน</h1>
          <Link href="/" className="bg-gray-800 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm hover:bg-gray-900 transition-colors">
            ← กลับไปหน้าแคชเชียร์
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ================= โซนสินค้า ================= */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-4 text-blue-600">📦 จัดการเมนูสินค้า</h2>
            <form onSubmit={handleSaveProduct} className="mb-6 grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-xl">
              <input type="text" placeholder="ชื่อเมนู" value={name} onChange={e => setName(e.target.value)} required className="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-black" />
              <input type="number" placeholder="ราคาตั้งต้น (บาท)" value={price} onChange={e => setPrice(e.target.value)} required className="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-black" />
              <input type="text" placeholder="URL รูปภาพ" value={image} onChange={e => setImage(e.target.value)} required className="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 col-span-2 text-black" />
              <select value={category} onChange={e => setCategory(e.target.value)} className="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 col-span-2 font-medium text-black">
                <option value="beverage">🥤 เครื่องดื่ม (มีตัวเลือกร้อน/เย็น/ปั่น)</option>
                <option value="dessert">🍰 ขนมหวาน / เบเกอรี่ (มีตัวเลือกขนาดชิ้น)</option>
              </select>
              <button type="submit" className="col-span-2 bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700">
                {editingId ? "อัปเดตเมนู" : "+ เพิ่มเมนูใหม่"}
              </button>
            </form>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {products.map(p => (
                <div key={p.id} className="flex justify-between items-center p-3 border rounded-xl hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <img src={p.image} className="w-12 h-12 object-cover rounded-md bg-gray-200" alt={p.name} />
                    <div>
                      <p className="font-bold text-gray-800">{p.name}</p>
                      <p className="text-xs text-gray-500">฿{p.price} • {p.category === 'dessert' ? '🍰 ขนม' : '🥤 น้ำ'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditProduct(p)} className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-bold">แก้</button>
                    <button onClick={() => handleDeleteProduct(p.id)} className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-sm font-bold">ลบ</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ================= โซนท็อปปิ้ง ================= */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-4 text-purple-600">✨ จัดการท็อปปิ้งส่วนกลาง</h2>
            <form onSubmit={handleSaveTopping} className="mb-6 grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-xl">
              <input type="text" placeholder="ชื่อท็อปปิ้ง" value={toppingName} onChange={e => setToppingName(e.target.value)} required className="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500 text-black" />
              <input type="number" placeholder="ราคา (+บาท)" value={toppingPrice} onChange={e => setToppingPrice(e.target.value)} required className="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500 text-black" />
              
              {/* 🌟 ช่องใส่รูปภาพท็อปปิ้ง (ไม่ต้อง required เพื่อให้เว้นว่างได้) */}
              <input type="text" placeholder="URL รูปภาพ (ตัวเลือกเสริม)" value={toppingImage} onChange={e => setToppingImage(e.target.value)} className="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500 col-span-2 text-black" />
              
              <select value={toppingCategory} onChange={e => setToppingCategory(e.target.value)} className="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500 col-span-2 font-medium text-black">
                <option value="beverage">🥤 ใช้สำหรับหมวด: เครื่องดื่ม</option>
                <option value="dessert">🍰 ใช้สำหรับหมวด: ขนมหวาน</option>
              </select>

              <button type="submit" className="col-span-2 bg-purple-600 text-white py-2 rounded-lg font-bold hover:bg-purple-700">
                {editingToppingId ? "อัปเดตท็อปปิ้ง" : "+ เพิ่มท็อปปิ้งใหม่"}
              </button>
            </form>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {toppings.length === 0 ? <p className="text-center text-gray-400 py-4">ยังไม่มีข้อมูลท็อปปิ้ง</p> : null}
              {toppings.map(t => (
                <div key={t.id} className="flex justify-between items-center p-3 border rounded-xl hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    {/* 🌟 แสดงรูปภาพท็อปปิ้ง (ถ้ามี) */}
                    {t.image ? (
                      <img src={t.image} className="w-12 h-12 object-cover rounded-md bg-gray-200" alt={t.name} />
                    ) : (
                      <div className="w-12 h-12 bg-purple-100 text-purple-400 rounded-md flex items-center justify-center text-xl font-bold">✨</div>
                    )}
                    <div>
                      <p className="font-bold text-gray-800">{t.name}</p>
                      <p className="text-xs text-gray-500 ">+{t.price} บาท • {t.category === 'dessert' ? '🍰 ขนม' : '🥤 น้ำ'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {/* 🌟 ปุ่มแก้ไขท็อปปิ้ง */}
                    <button onClick={() => handleEditTopping(t)} className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-bold">แก้</button>
                    <button onClick={() => handleDeleteTopping(t.id)} className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-sm font-bold">ลบ</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}