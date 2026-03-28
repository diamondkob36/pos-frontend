"use client";

import { useState, useEffect } from "react";

export default function ToppingManager({ toppings, categories, fetchData }: { toppings: any[], categories: any[], fetchData: () => void }) {
  const [toppingName, setToppingName] = useState("");
  const [toppingPrice, setToppingPrice] = useState("");
  const [toppingImage, setToppingImage] = useState("");
  const [toppingCategory, setToppingCategory] = useState("");
  const [editingToppingId, setEditingToppingId] = useState<number | null>(null);
  const [toppingFilter, setToppingFilter] = useState("all");

  useEffect(() => {
    if (categories.length > 0 && !toppingCategory) setToppingCategory(categories[0].value);
  }, [categories]);

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

  const filteredToppings = toppingFilter === "all" ? toppings : toppings.filter(t => t.category === toppingFilter);
  const getCategoryLabel = (val: string) => categories.find(c => c.value === val)?.label || val;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col max-h-[85vh]">
      <h2 className="text-xl font-bold mb-4 text-purple-600 shrink-0">✨ จัดการท็อปปิ้ง</h2>
      <form onSubmit={handleSaveTopping} className="mb-4 grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-xl shrink-0 border border-gray-200">
        <input type="text" placeholder="ชื่อท็อปปิ้ง" value={toppingName} onChange={e => setToppingName(e.target.value)} required className="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500 font-medium bg-white text-gray-900" />
        <input type="number" placeholder="ราคา (+บาท)" value={toppingPrice} onChange={e => setToppingPrice(e.target.value)} required className="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500 font-medium bg-white text-gray-900" />
        <input type="text" placeholder="URL รูปภาพ (เสริม)" value={toppingImage} onChange={e => setToppingImage(e.target.value)} className="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500 col-span-2 font-medium bg-white text-gray-900" />
        
        <select value={toppingCategory} onChange={e => setToppingCategory(e.target.value)} className="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500 col-span-2 font-bold bg-white cursor-pointer text-gray-900">
          {categories.map(c => <option key={c.id} value={c.value}>🗂️ ใช้สำหรับ: {c.label}</option>)}
          {categories.length === 0 && <option value="">(สร้างหมวดหมู่ก่อน)</option>}
        </select>

        <button type="submit" disabled={categories.length === 0} className={`col-span-2 py-2.5 rounded-lg font-bold ${categories.length === 0 ? 'bg-gray-400 text-white' : 'bg-purple-600 text-white hover:bg-purple-700'}`}>
          {editingToppingId ? "อัปเดตท็อปปิ้ง" : "+ เพิ่มท็อปปิ้งใหม่"}
        </button>
      </form>

      <div className="flex gap-2 mb-3 shrink-0 overflow-x-auto pb-2 custom-scrollbar">
        <button onClick={() => setToppingFilter("all")} className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-bold ${toppingFilter === "all" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600"}`}>ทั้งหมด</button>
        {categories.map(c => (
          <button key={c.id} onClick={() => setToppingFilter(c.value)} className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-bold ${toppingFilter === c.value ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600"}`}>ของ {c.label}</button>
        ))}
      </div>

      <div className="space-y-3 overflow-y-auto flex-1 pr-2">
        {filteredToppings.map(t => (
          <div key={t.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-xl hover:bg-gray-50 bg-white">
            <div className="flex items-center gap-3">
              {t.image ? <img src={t.image} className="w-12 h-12 object-cover rounded-full border" alt={t.name} /> : <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center text-xl font-bold">✨</div>}
              <div>
                <p className="font-bold text-gray-800">{t.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">+{t.price} บาท • {getCategoryLabel(t.category)}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEditTopping(t)} className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-bold">แก้</button>
              <button onClick={() => handleDeleteTopping(t.id)} className="px-3 py-1.5 bg-red-100 text-red-600 rounded-lg text-xs font-bold">ลบ</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}