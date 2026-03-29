"use client";
import { useState } from "react";

export default function ProductManager({ products, categories, fetchData }: any) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [category, setCategory] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);

  // 🌟 State สำหรับระบบค้นหาและกรอง
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCat, setFilterCat] = useState("all");

  const openAddModal = () => {
    setName(""); setPrice(""); setImage(""); setCategory(""); setIsAvailable(true); setEditingId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p: any) => {
    setName(p.name); setPrice(p.price); setImage(p.image); setCategory(p.category); setIsAvailable(p.isAvailable ?? true); setEditingId(p.id);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || category === "") return alert("❌ กรุณาเลือกหมวดหมู่สินค้าก่อนบันทึกครับ");

    const payload = { name, price: Number(price), image, category, isAvailable };
    const url = editingId ? `http://localhost:3001/products/${editingId}` : "http://localhost:3001/products";
    const method = editingId ? "PUT" : "POST";

    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setIsModalOpen(false);
    fetchData();
  };

  const toggleAvailable = async (p: any) => {
    const payload = { ...p, isAvailable: !(p.isAvailable ?? true) };
    await fetch(`http://localhost:3001/products/${p.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    fetchData();
  };

  const toggleActive = async (p: any) => {
    const newActive = !(p.isActive ?? true);
    if (confirm(`ต้องการ ${newActive ? 'เปิด' : 'ปิด'} การขายเมนูนี้ใช่หรือไม่?`)) {
      const payload = { ...p, isActive: newActive };
      await fetch(`http://localhost:3001/products/${p.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      fetchData();
    }
  };

  // 🌟 ลอจิกการกรองข้อมูล (Search + Category)
  const filteredProducts = products.filter((p: any) => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = filterCat === "all" || p.category === filterCat;
    return matchSearch && matchCat;
  });

  return (
    // 🌟 กำหนดความสูงแบบ Fixed และให้แสดง Scroll เฉพาะเนื้อหาด้านใน
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[calc(100vh-160px)]">
      
      {/* 🌟 Header: ช่องค้นหา และปุ่มเพิ่มรายการ (ไม่เลื่อนตามหน้า) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 shrink-0">
        <div className="relative w-full sm:max-w-md">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
          <input 
            type="text" 
            placeholder="ค้นหาชื่อเมนู..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            className="w-full pl-12 pr-4 py-3 border-2 rounded-xl outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors font-medium text-gray-800"
          />
        </div>
        <button onClick={openAddModal} className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-md transition-all text-lg shrink-0">
          + เพิ่มเมนูใหม่
        </button>
      </div>

      {/* 🌟 ตัวกรองหมวดหมู่ (ไม่เลื่อนตามหน้า) */}
      <div className="flex gap-2 overflow-x-auto pb-4 shrink-0 border-b border-gray-100 mb-4 custom-scrollbar">
        <button onClick={() => setFilterCat("all")} className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm border ${filterCat === "all" ? "bg-gray-800 text-white border-gray-800" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>ทั้งหมด</button>
        {categories.map((c: any) => (
          <button key={c.id} onClick={() => setFilterCat(c.value)} className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm border ${filterCat === c.value ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>{c.label}</button>
        ))}
      </div>

      {/* 🌟 พื้นที่รายการสินค้า (Scroll ได้) */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {filteredProducts.length === 0 ? (
           <div className="text-center py-20 text-gray-400 font-medium border-2 border-dashed rounded-xl">ไม่พบเมนูที่ค้นหาครับ</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pb-8">
            {filteredProducts.map((p: any) => {
              const isActive = p.isActive ?? true;
              const available = p.isAvailable ?? true;
              return (
                <div key={p.id} className={`p-5 border-2 rounded-2xl flex flex-col gap-4 transition-all ${!isActive ? 'bg-gray-50 border-gray-200 opacity-80 grayscale-[30%]' : 'bg-white border-blue-50 hover:border-blue-200 hover:shadow-md'}`}>
                  
                  <div className="flex gap-4 items-start">
                    {p.image ? <img src={p.image} className="w-20 h-20 object-cover rounded-xl shadow-sm border" alt={p.name} /> : <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-xs font-medium">No Img</div>}
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-800 line-clamp-1">{p.name}</h3>
                      <p className="text-sm text-gray-500 font-medium">{categories.find((c:any) => c.value === p.category)?.label || p.category}</p>
                      <p className="font-black text-blue-600 text-xl mt-1">฿{p.price}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 text-sm font-bold">
                    <span className={`px-3 py-1 rounded-lg ${isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{isActive ? '✅ กำลังขาย' : '🛑 ปิดการขายแล้ว'}</span>
                    <span className={`px-3 py-1 rounded-lg ${available ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>{available ? '📦 พร้อมขาย' : '⚠️ สินค้าหมด'}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-auto pt-2">
                    <button onClick={() => openEditModal(p)} className="bg-yellow-100 text-yellow-700 py-3 rounded-xl font-bold hover:bg-yellow-200 transition-colors text-md">✏️ แก้ไข</button>
                    {isActive ? (
                      <button onClick={() => toggleActive(p)} className="bg-red-100 text-red-600 py-3 rounded-xl font-bold hover:bg-red-200 transition-colors text-md">🗑️ ปิดการขาย</button>
                    ) : (
                      <button onClick={() => toggleActive(p)} className="bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-colors text-md shadow-sm border-b-4 border-green-800 active:border-b-0 active:translate-y-1">✅ เปิดขายอีกครั้ง</button>
                    )}
                    {isActive && (
                      <button onClick={() => toggleAvailable(p)} className={`col-span-2 py-3 rounded-xl font-bold transition-colors border-2 ${available ? 'border-orange-200 text-orange-600 hover:bg-orange-50' : 'border-blue-200 text-blue-600 hover:bg-blue-50'}`}>
                        {available ? '👇 กดเพื่อตั้งว่า "สินค้าหมด"' : '📦 กดเพื่อตั้งว่า "พร้อมขาย"'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 🌟 Pop-up Form (เหมือนเดิม) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center backdrop-blur-sm p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl border border-gray-100" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-black text-gray-800 mb-6 border-b pb-4">{editingId ? '✏️ แก้ไขข้อมูลเมนู' : '+ สร้างเมนูสินค้าใหม่'}</h2>
            
            <form onSubmit={handleSaveProduct} className="flex flex-col gap-4">
              <input type="text" placeholder="ชื่อเมนู" value={name} onChange={e => setName(e.target.value)} required className="p-4 border-2 rounded-xl outline-none focus:border-blue-500 font-bold text-gray-800 bg-gray-50 focus:bg-white" />
              <input type="number" placeholder="ราคา (บาท)" value={price} onChange={e => setPrice(e.target.value)} required className="p-4 border-2 rounded-xl outline-none focus:border-blue-500 font-bold text-gray-800 bg-gray-50 focus:bg-white" />
              <input type="text" placeholder="URL รูปภาพ (วางลิงก์รูป)" value={image} onChange={e => setImage(e.target.value)} className="p-4 border-2 rounded-xl outline-none focus:border-blue-500 text-gray-800 bg-gray-50 focus:bg-white" />
              
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="p-4 border-2 rounded-xl outline-none focus:border-blue-500 font-bold text-gray-800 bg-gray-50 focus:bg-white cursor-pointer">
                <option value="" disabled>-- เลือกหมวดหมู่ --</option>
                {categories.map((c:any) => <option key={c.id} value={c.value}>{c.label}</option>)}
              </select>

              <label className="flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer bg-blue-50 border-blue-100 hover:bg-blue-100 transition-colors">
                <input type="checkbox" checked={isAvailable} onChange={e => setIsAvailable(e.target.checked)} className="w-6 h-6 accent-blue-600" />
                <span className="font-bold text-blue-800 text-lg">สถานะ: {isAvailable ? '✅ พร้อมขาย' : '❌ สินค้าหมด (ซ่อนชั่วคราว)'}</span>
              </label>

              <div className="flex gap-4 mt-6 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-100 text-gray-600 py-4 rounded-xl font-bold text-lg hover:bg-gray-200 transition-colors">ยกเลิก</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 shadow-lg border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all">
                  💾 บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}