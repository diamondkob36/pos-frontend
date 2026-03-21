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

  // ฟอร์มท็อปปิ้ง
  const [toppingName, setToppingName] = useState("");
  const [toppingPrice, setToppingPrice] = useState("");
  const [toppingImage, setToppingImage] = useState("");
  const [toppingCategory, setToppingCategory] = useState("beverage");
  const [editingToppingId, setEditingToppingId] = useState<number | null>(null);

  // 🌟 State ใหม่: สำหรับเก็บค่าตัวกรอง (Filter) ของรายการ
  const [productFilter, setProductFilter] = useState("all");
  const [toppingFilter, setToppingFilter] = useState("all");

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

  // --- จัดการท็อปปิ้ง ---
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
    
    setToppingName(""); setToppingPrice(""); setToppingImage(""); setToppingCategory("beverage"); setEditingToppingId(null);
    fetchData();
  };

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

  // 🌟 ลอจิกการกรองข้อมูล (ถ้าเป็น all ให้โชว์ทั้งหมด ถ้าไม่ ให้กรองตามหมวดหมู่)
  const filteredProducts = productFilter === "all" ? products : products.filter(p => p.category === productFilter);
  const filteredToppings = toppingFilter === "all" ? toppings : toppings.filter(t => t.category === toppingFilter);

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
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col max-h-[85vh]">
            <h2 className="text-xl font-bold mb-4 text-blue-600 shrink-0">📦 จัดการเมนูสินค้า</h2>
            <form onSubmit={handleSaveProduct} className="mb-4 grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-xl shrink-0 border border-gray-200">
              <input type="text" placeholder="ชื่อเมนู" value={name} onChange={e => setName(e.target.value)} required className="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900 bg-white" />
              <input type="number" placeholder="ราคาตั้งต้น (บาท)" value={price} onChange={e => setPrice(e.target.value)} required className="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900 bg-white" />
              <input type="text" placeholder="URL รูปภาพ" value={image} onChange={e => setImage(e.target.value)} required className="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 col-span-2 font-medium text-gray-900 bg-white" />
              <select value={category} onChange={e => setCategory(e.target.value)} className="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 col-span-2 font-bold text-gray-900 bg-white cursor-pointer">
                <option value="beverage">🥤 หมวดหมู่: เครื่องดื่ม</option>
                <option value="dessert">🍰 หมวดหมู่: ขนมหวาน / เบเกอรี่</option>
              </select>
              <button type="submit" className="col-span-2 bg-blue-600 text-white py-2.5 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm">
                {editingId ? "อัปเดตเมนู" : "+ เพิ่มเมนูใหม่"}
              </button>
            </form>

            {/* 🌟 ปุ่ม Filter สำหรับเมนูสินค้า */}
            <div className="flex gap-2 mb-3 shrink-0">
              <button 
                onClick={() => setProductFilter("all")}
                className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${productFilter === "all" ? "bg-blue-600 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                ทั้งหมด
              </button>
              <button 
                onClick={() => setProductFilter("beverage")}
                className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${productFilter === "beverage" ? "bg-blue-600 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                🥤 เครื่องดื่ม
              </button>
              <button 
                onClick={() => setProductFilter("dessert")}
                className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${productFilter === "dessert" ? "bg-blue-600 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                🍰 ขนมหวาน
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto flex-1 pr-2">
              {filteredProducts.length === 0 ? <p className="text-center text-gray-400 py-4 font-medium">ไม่พบเมนูในหมวดหมู่นี้</p> : null}
              {filteredProducts.map(p => (
                <div key={p.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors bg-white shadow-sm">
                  <div className="flex items-center gap-3">
                    <img src={p.image} className="w-12 h-12 object-cover rounded-md bg-gray-100 border border-gray-200" alt={p.name} />
                    <div>
                      <p className="font-bold text-gray-800">{p.name}</p>
                      <p className="text-xs font-medium text-gray-500 mt-0.5">฿{p.price} • {p.category === 'dessert' ? '🍰 ขนม' : '🥤 น้ำ'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditProduct(p)} className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-bold hover:bg-yellow-200 transition-colors">แก้</button>
                    <button onClick={() => handleDeleteProduct(p.id)} className="px-3 py-1.5 bg-red-100 text-red-600 rounded-lg text-xs font-bold hover:bg-red-200 transition-colors">ลบ</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ================= โซนท็อปปิ้ง ================= */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col max-h-[85vh]">
            <h2 className="text-xl font-bold mb-4 text-purple-600 shrink-0">✨ จัดการท็อปปิ้งส่วนกลาง</h2>
            <form onSubmit={handleSaveTopping} className="mb-4 grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-xl shrink-0 border border-gray-200">
              <input type="text" placeholder="ชื่อท็อปปิ้ง" value={toppingName} onChange={e => setToppingName(e.target.value)} required className="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500 font-medium text-gray-900 bg-white" />
              <input type="number" placeholder="ราคา (+บาท)" value={toppingPrice} onChange={e => setToppingPrice(e.target.value)} required className="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500 font-medium text-gray-900 bg-white" />
              <input type="text" placeholder="URL รูปภาพ (ตัวเลือกเสริม)" value={toppingImage} onChange={e => setToppingImage(e.target.value)} className="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500 col-span-2 font-medium text-gray-900 bg-white" />
              <select value={toppingCategory} onChange={e => setToppingCategory(e.target.value)} className="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500 col-span-2 font-bold text-gray-900 bg-white cursor-pointer">
                <option value="beverage">🥤 ใช้สำหรับหมวด: เครื่องดื่ม</option>
                <option value="dessert">🍰 ใช้สำหรับหมวด: ขนมหวาน</option>
              </select>
              <button type="submit" className="col-span-2 bg-purple-600 text-white py-2.5 rounded-lg font-bold hover:bg-purple-700 transition-colors shadow-sm">
                {editingToppingId ? "อัปเดตท็อปปิ้ง" : "+ เพิ่มท็อปปิ้งใหม่"}
              </button>
            </form>

            {/* 🌟 ปุ่ม Filter สำหรับท็อปปิ้ง */}
            <div className="flex gap-2 mb-3 shrink-0">
              <button 
                onClick={() => setToppingFilter("all")}
                className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${toppingFilter === "all" ? "bg-purple-600 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                ทั้งหมด
              </button>
              <button 
                onClick={() => setToppingFilter("beverage")}
                className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${toppingFilter === "beverage" ? "bg-purple-600 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                🥤 ของน้ำ
              </button>
              <button 
                onClick={() => setToppingFilter("dessert")}
                className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${toppingFilter === "dessert" ? "bg-purple-600 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                🍰 ของขนม
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto flex-1 pr-2">
              {filteredToppings.length === 0 ? <p className="text-center text-gray-400 py-4 font-medium">ไม่พบท็อปปิ้งในหมวดหมู่นี้</p> : null}
              {filteredToppings.map(t => (
                <div key={t.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors bg-white shadow-sm">
                  <div className="flex items-center gap-3">
                    {t.image ? (
                      <img src={t.image} className="w-12 h-12 object-cover rounded-full border border-gray-200 bg-white" alt={t.name} />
                    ) : (
                      <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center text-xl font-bold border border-purple-100">✨</div>
                    )}
                    <div>
                      <p className="font-bold text-gray-800">{t.name}</p>
                      <p className="text-xs font-medium text-gray-500 mt-0.5">+{t.price} บาท • {t.category === 'dessert' ? '🍰 ขนม' : '🥤 น้ำ'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditTopping(t)} className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-bold hover:bg-yellow-200 transition-colors">แก้</button>
                    <button onClick={() => handleDeleteTopping(t.id)} className="px-3 py-1.5 bg-red-100 text-red-600 rounded-lg text-xs font-bold hover:bg-red-200 transition-colors">ลบ</button>
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