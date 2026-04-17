"use client";
import { useState } from "react";

export default function ToppingManager({ toppings = [], categories = [], fetchData }: any) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [category, setCategory] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCat, setFilterCat] = useState("all");

  const openAddModal = () => {
    setName(""); setPrice(""); setImage(""); setCategory(""); setIsAvailable(true); setEditingId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (t: any) => {
    setName(t.name); setPrice(t.price); setImage(t.image); setCategory(t.category); setIsAvailable(t.isAvailable ?? true); setEditingId(t.id);
    setIsModalOpen(true);
  };

  const handleSaveTopping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || category === "") return alert("❌ กรุณาเลือกหมวดหมู่ก่อนบันทึกครับ");

    // 🌟 ดักราคาติดลบ
    const numericPrice = Number(price);
    if (numericPrice < 0) {
      alert("❌ ราคาท็อปปิ้งไม่สามารถติดลบได้ครับ (แต่ตั้งเป็น 0 ได้)");
      return;
    }

    const payload = { name, price: Number(price), image, category, isAvailable };
    const url = editingId ? `http://localhost:3001/toppings/${editingId}` : "http://localhost:3001/toppings";
    const method = editingId ? "PUT" : "POST";

    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setIsModalOpen(false);
    fetchData();
  };

  const toggleAvailable = async (t: any) => {
    const payload = { ...t, isAvailable: !(t.isAvailable ?? true) };
    await fetch(`http://localhost:3001/toppings/${t.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    fetchData();
  };

  const toggleActive = async (t: any) => {
    const newActive = !(t.isActive ?? true);
    if (confirm(`ต้องการ ${newActive ? 'เปิด' : 'ปิด'} การขายท็อปปิ้งนี้ใช่หรือไม่?`)) {
      const payload = { ...t, isActive: newActive };
      await fetch(`http://localhost:3001/toppings/${t.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      fetchData();
    }
  };

  const filteredToppings = toppings.filter((t: any) => {
    const matchSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = filterCat === "all" || t.category === filterCat;
    return matchSearch && matchCat;
  });

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[calc(100vh-160px)]">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 shrink-0">
        <div className="relative w-full sm:max-w-md">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
          <input type="text" placeholder="ค้นหาท็อปปิ้ง..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 border-2 rounded-xl outline-none focus:border-purple-500 bg-gray-50 focus:bg-white font-medium text-gray-800 transition-colors" />
        </div>
        <button onClick={openAddModal} className="w-full sm:w-auto bg-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-700 shadow-md active:scale-95 transition-all shrink-0">+ เพิ่มท็อปปิ้ง</button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 shrink-0 border-b border-gray-100 mb-4 custom-scrollbar">
        <button onClick={() => setFilterCat("all")} className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold border transition-colors ${filterCat === "all" ? "bg-gray-800 text-white border-gray-800" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>ทั้งหมด</button>
        {categories.map((c: any) => <button key={c.id} onClick={() => setFilterCat(c.value)} className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold border transition-colors ${filterCat === c.value ? "bg-purple-600 text-white border-purple-600" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>{c.label}</button>)}
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {filteredToppings.length === 0 ? <div className="text-center py-20 text-gray-400 font-medium border-2 border-dashed rounded-xl">ไม่พบท็อปปิ้งที่ค้นหาครับ</div> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pb-8">
            {filteredToppings.map((t: any) => {
              const isActive = t.isActive ?? true; const available = t.isAvailable ?? true;
              return (
                <div key={t.id} className={`p-5 border-2 rounded-2xl flex flex-col gap-4 transition-all duration-300 ${!isActive ? 'bg-gray-50 border-gray-200 opacity-80 grayscale-[30%]' : 'bg-white border-purple-50 hover:shadow-md hover:border-purple-100'}`}>
                  
                  <div className="flex gap-4 items-start">
                    {t.image ? (
                      <img src={t.image} className="w-20 h-20 object-cover rounded-xl border" alt={t.name} />
                    ) : (
                      <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-xs">No Img</div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-800 line-clamp-1">{t.name}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">🗂️ หมวดหมู่: {categories.find((c:any) => c.value === t.category)?.label || t.category}</p>
                      <p className="font-black text-purple-600 text-xl mt-1">+฿{t.price}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 text-sm font-bold mt-auto pt-1">
                    <span className={`px-3 py-1 rounded-lg ${isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{isActive ? '✅ ขายอยู่' : '🛑 ปิดการขาย'}</span>
                    <span className={`px-3 py-1 rounded-lg ${available ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>{available ? '📦 พร้อมขาย' : '⚠️ หมด'}</span>
                  </div>

                  {/* 🌟 ปรับปรุงปุ่มกด Hover, Active Effect และคำศัพท์ */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button onClick={() => openEditModal(t)} className="bg-yellow-50 text-yellow-700 hover:bg-yellow-100 active:scale-95 transition-all py-3 rounded-xl font-bold">✏️ แก้ไข</button>
                    
                    {isActive ? (
                      <button onClick={() => toggleActive(t)} className="bg-red-50 text-red-600 hover:bg-red-100 active:scale-95 transition-all py-3 rounded-xl font-bold">🗑️ ปิดการขาย</button>
                    ) : (
                      <button onClick={() => toggleActive(t)} className="bg-green-600 text-white hover:bg-green-700 active:scale-95 transition-all py-3 rounded-xl font-bold shadow-sm">✅ เปิดขายอีกครั้ง</button>
                    )}
                    
                    {isActive && (
                      <button onClick={() => toggleAvailable(t)} className={`col-span-2 py-3 rounded-xl font-bold border-2 active:scale-[0.98] transition-all ${available ? 'border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300' : 'border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300'}`}>
                        {available ? '🛑 ปรับสถานะเป็น "สินค้าหมด"' : '📦 ปรับสถานะเป็น "พร้อมขาย"'}
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center backdrop-blur-sm p-4 transition-opacity" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl border border-gray-100 transform transition-all" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-black text-gray-800 mb-6 border-b pb-4">{editingId ? '✏️ แก้ไขท็อปปิ้ง' : '+ เพิ่มท็อปปิ้งใหม่'}</h2>
            <form onSubmit={handleSaveTopping} className="flex flex-col gap-4">
              <input type="text" placeholder="ชื่อท็อปปิ้ง" value={name} onChange={e => setName(e.target.value)} required className="p-4 border-2 rounded-xl outline-none focus:border-purple-500 font-bold bg-gray-50 focus:bg-white text-gray-800 transition-colors" />
              <input type="number" min="0" onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }} placeholder="ราคาเพิ่ม (บาท)" value={price} onChange={e => setPrice(e.target.value)} required className="p-4 border-2 rounded-xl outline-none focus:border-purple-500 font-bold text-gray-800 bg-gray-50 focus:bg-white" />
              <input type="text" placeholder="URL รูปท็อปปิ้ง (เลือกได้)" value={image} onChange={e => setImage(e.target.value)} className="p-4 border-2 rounded-xl outline-none focus:border-purple-500 bg-gray-50 focus:bg-white text-gray-800 transition-colors" />
              
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="p-4 border-2 rounded-xl outline-none focus:border-purple-500 font-bold bg-gray-50 focus:bg-white text-gray-800 transition-colors cursor-pointer">
                <option value="" disabled>-- เลือกหมวดหมู่ --</option>
                {categories.map((c:any) => <option key={c.id} value={c.value}>{c.label}</option>)}
              </select>

              <label className="flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer bg-purple-50 border-purple-100 hover:bg-purple-100/50 transition-colors">
                <input type="checkbox" checked={isAvailable} onChange={e => setIsAvailable(e.target.checked)} className="w-6 h-6 accent-purple-600" />
                <span className="font-bold text-purple-900 text-lg">สถานะ: {isAvailable ? '✅ พร้อมขาย' : '❌ หมด'}</span>
              </label>

              <div className="flex gap-4 mt-6 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-100 text-gray-600 hover:bg-gray-200 active:scale-95 transition-all py-4 rounded-xl font-bold">ยกเลิก</button>
                <button type="submit" className="flex-1 bg-purple-600 text-white hover:bg-purple-700 active:scale-95 transition-all py-4 rounded-xl font-bold shadow-md">💾 บันทึก</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}