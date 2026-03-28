"use client";

import { useState } from "react";

export default function CategoryManager({ categories, fetchData }: { categories: any[], fetchData: () => void }) {
  const [catValue, setCatValue] = useState("");
  const [catLabel, setCatLabel] = useState("");
  const [catHasType, setCatHasType] = useState(false);
  const [catHasSize, setCatHasSize] = useState(false);
  const [editingCatId, setEditingCatId] = useState<number | null>(null);

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
    if (confirm("แน่ใจหรือไม่ที่จะลบหมวดหมู่นี้?")) {
      await fetch(`http://localhost:3001/categories/${id}`, { method: "DELETE" });
      fetchData();
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col max-h-[85vh]">
      <h2 className="text-xl font-bold mb-4 text-emerald-600 shrink-0">🗂️ จัดการหมวดหมู่เมนู</h2>
      
      <form onSubmit={handleSaveCategory} className="mb-4 flex flex-col gap-3 bg-gray-50 p-4 rounded-xl shrink-0 border border-gray-200">
        <input type="text" placeholder="ชื่อที่แสดงผล (เช่น อาหารคาว)" value={catLabel} onChange={e => setCatLabel(e.target.value)} required className="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-gray-900 bg-white" />
        <input type="text" placeholder="รหัสอ้างอิง (เช่น food)" value={catValue} onChange={e => setCatValue(e.target.value)} required className="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-gray-900 bg-white" />
        
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
        {categories.length === 0 && <p className="text-center text-gray-400 py-4 font-medium">ยังไม่มีข้อมูล</p>}
        {categories.map(c => (
          <div key={c.id} className="p-3 border border-gray-100 rounded-xl hover:bg-gray-50 bg-white shadow-sm flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold text-gray-800">{c.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">รหัส: {c.value}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEditCategory(c)} className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-bold">แก้</button>
                <button onClick={() => handleDeleteCategory(c.id)} className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-xs font-bold">ลบ</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}