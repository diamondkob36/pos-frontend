"use client";

import { useState, useEffect } from "react";

export default function ProductManager({ products, categories, fetchData }: { products: any[], categories: any[], fetchData: () => void }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [category, setCategory] = useState(""); 
  const [editingId, setEditingId] = useState<number | null>(null);
  const [productFilter, setProductFilter] = useState("all");
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    if (categories.length > 0 && !category) setCategory(categories[0].value);
  }, [categories]);

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🌟 1. ดักจับ: ถ้ายังไม่เลือกหมวดหมู่ ให้เด้งเตือนและหยุดการทำงานทันที
    if (!category || category === "") {
      alert("❌ กรุณาเลือกหมวดหมู่สินค้าก่อนบันทึกครับ");
      return; 
    }

    // 🌟 2. เพิ่ม isAvailable เข้าไปใน Payload เพื่อส่งไปบอก Database ว่าของหมดหรือยัง
    const payload = { 
      name, 
      price: Number(price), 
      image, 
      category,
      isAvailable // <-- เพิ่มตัวนี้เข้ามา
    };
    
    const url = editingId ? `http://localhost:3001/products/${editingId}` : "http://localhost:3001/products";
    const method = editingId ? "PUT" : "POST";

    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    
    // 🌟 3. ตอนล้างค่าในฟอร์ม (Reset) ให้เซ็ต category กลับเป็นค่าว่าง ("") แทนการดึงค่าตัวแรก
    setName(""); 
    setPrice(""); 
    setImage(""); 
    setCategory(""); // <-- แก้ตรงนี้เป็นค่าว่าง
    setIsAvailable(true); // <-- รีเซ็ตให้กลับมาเป็นพร้อมขาย
    setEditingId(null);
    
    fetchData();
  };

  const handleEditProduct = (p: any) => {
    setName(p.name); setPrice(p.price); setImage(p.image); setCategory(p.category || categories[0]?.value); setEditingId(p.id);
  };

  const handleDeleteProduct = async (id: number) => {
    if (confirm("ลบสินค้านี้?")) {
      await fetch(`http://localhost:3001/products/${id}`, { method: "DELETE" });
      fetchData();
    }
  };

  const filteredProducts = productFilter === "all" ? products : products.filter(p => p.category === productFilter);
  const getCategoryLabel = (val: string) => categories.find(c => c.value === val)?.label || val;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col max-h-[85vh]">
      <h2 className="text-xl font-bold mb-4 text-blue-600 shrink-0">📦 จัดการเมนูสินค้า</h2>
      <form onSubmit={handleSaveProduct} className="mb-4 grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-xl shrink-0 border border-gray-200">
        <input type="text" placeholder="ชื่อเมนู" value={name} onChange={e => setName(e.target.value)} required className="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-medium bg-white text-gray-900" />
        <input type="number" placeholder="ราคา" value={price} onChange={e => setPrice(e.target.value)} required className="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-medium bg-white text-gray-900" />
        <input type="text" placeholder="URL รูปภาพ" value={image} onChange={e => setImage(e.target.value)} required className="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 col-span-2 font-medium bg-white text-gray-900" />
        
        <select value={category} onChange={e => setCategory(e.target.value)} className="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 col-span-2 font-bold bg-white cursor-pointer text-gray-900">
          <option value="" disabled>-- ยังไม่ได้เลือกหมวดหมู่ --</option>
          {categories.map(c => <option key={c.id} value={c.value}>🗂️ {c.label}</option>)}
          {categories.length === 0 && <option value="">(สร้างหมวดหมู่ก่อน)</option>}
        </select>

        <button type="submit" disabled={categories.length === 0} className={`col-span-2 py-2.5 rounded-lg font-bold ${categories.length === 0 ? 'bg-gray-400 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
          {editingId ? "อัปเดตเมนู" : "+ เพิ่มเมนูใหม่"}
        </button>
      </form>

      <div className="flex gap-2 mb-3 shrink-0 overflow-x-auto pb-2 custom-scrollbar">
        <button onClick={() => setProductFilter("all")} className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-bold ${productFilter === "all" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}>ทั้งหมด</button>
        {categories.map(c => (
          <button key={c.id} onClick={() => setProductFilter(c.value)} className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-bold ${productFilter === c.value ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}>{c.label}</button>
        ))}
      </div>

      <div className="space-y-3 overflow-y-auto flex-1 pr-2">
        {filteredProducts.map(p => (
          <div key={p.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-xl hover:bg-gray-50 bg-white">
            <div className="flex items-center gap-3">
              <img src={p.image} className="w-12 h-12 object-cover rounded-md border" alt={p.name} />
              <div>
                <p className="font-bold text-gray-800">{p.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">฿{p.price} • {getCategoryLabel(p.category)}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEditProduct(p)} className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-bold">แก้</button>
              <button onClick={() => handleDeleteProduct(p.id)} className="px-3 py-1.5 bg-red-100 text-red-600 rounded-lg text-xs font-bold">ลบ</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}