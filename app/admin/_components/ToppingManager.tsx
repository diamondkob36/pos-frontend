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
  const [showHidden, setShowHidden] = useState(false);
  const hiddenCount = toppings.filter((t: any) => t.isActive === false).length;

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
    
    if (!category || category === "") {
      const { toast } = await import("@/lib/toast");
      toast.warning("กรุณาเลือกหมวดหมู่ก่อนบันทึก");
      return;
    }

    // ดักราคาติดลบ
    const numericPrice = Number(price);
    if (numericPrice < 0) {
      const { toast } = await import("@/lib/toast");
      toast.error("ราคาท็อปปิ้งไม่สามารถติดลบได้ (แต่ตั้งเป็น 0 ได้)");
      return;
    }

    try {
      const payload: any = { 
        name, 
        price: Number(price), 
        category, 
        isAvailable 
      };
      
      // เพิ่ม image เฉพาะเมื่อมีค่า
      if (image && image.trim() !== '') {
        payload.image = image;
      }
      
      const url = editingId ? `http://localhost:3001/toppings/${editingId}` : "http://localhost:3001/toppings";
      const method = editingId ? "PUT" : "POST";

      const token = localStorage.getItem("pos_token");

      await fetch(url, { 
        method, 
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }, 
        body: JSON.stringify(payload) 
      });
      
      setIsModalOpen(false);
      fetchData();
      
      // แสดง Toast สำเร็จ
      const { toast } = await import("@/lib/toast");
      toast.success(editingId ? 'แก้ไขท็อปปิ้งสำเร็จ!' : 'เพิ่มท็อปปิ้งใหม่สำเร็จ!');
    } catch (error) {
      const { toast } = await import("@/lib/toast");
      toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    }
  };

  const toggleAvailable = async (t: any) => {
    try {
      // ส่งเฉพาะ field ที่ต้องการอัพเดท
      const payload = { isAvailable: !(t.isAvailable ?? true) };
      const token = localStorage.getItem("pos_token");

      await fetch(`http://localhost:3001/toppings/${t.id}`, { 
        method: "PUT", 
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }, 
        body: JSON.stringify(payload) 
      });
      
      fetchData();
    } catch (error) {
      const { toast } = await import("@/lib/toast");
      toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    }
  };

  const toggleActive = async (t: any) => {
    const { confirm, toast } = await import("@/lib/toast");
    
    const newActive = !(t.isActive ?? true);
    const confirmed = await confirm(
      `ต้องการ ${newActive ? 'เปิด' : 'ปิด'} การขายท็อปปิ้งนี้ใช่หรือไม่?`,
      newActive ? 'เปิดการขาย' : 'ปิดการขาย'
    );
    
    if (confirmed) {
      try {
        // ส่งเฉพาะ field ที่ต้องการอัพเดท
        const payload = { isActive: newActive };
        const token = localStorage.getItem("pos_token");

        await fetch(`http://localhost:3001/toppings/${t.id}`, { 
          method: "PUT", 
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }, 
          body: JSON.stringify(payload) 
        });
        
        fetchData();
        toast.success(newActive ? 'เปิดการขายสำเร็จ!' : 'ปิดการขายสำเร็จ!');
      } catch (error) {
        toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
      }
    }
  };

  const filteredToppings = toppings.filter((t: any) => {
    const matchSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = filterCat === "all" || t.category === filterCat;
    
    // 🌟 เพิ่มเงื่อนไขเช็คสถานะการระงับ
    const matchActive = showHidden || t.isActive !== false; 
    
    // เอาทั้ง 3 เงื่อนไขมาบังคับรวมกัน
    return matchSearch && matchCat && matchActive;
  });

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col lg:h-[calc(100vh-160px)]">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 shrink-0">
        <div className="relative w-full sm:max-w-md">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
          <input type="text" placeholder="ค้นหาท็อปปิ้ง..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 border-2 rounded-xl outline-none focus:border-purple-500 bg-gray-50 focus:bg-white font-medium text-gray-800 transition-colors" />
        </div>
        <div className="flex gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
          {/* 🌟 ปุ่มแสดง/ซ่อนรายการที่ระงับ */}
          {hiddenCount > 0 && (
            <button 
              onClick={() => setShowHidden(!showHidden)}
              className={`px-3 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all border-2 flex-1 sm:flex-none ${
                showHidden 
                  ? 'bg-gray-800 text-white border-gray-800' 
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
              }`}
            >
              <span className="hidden sm:inline">{showHidden ? '🙈 ซ่อนรายการที่ปิดการขาย' : `👁️ แสดงรายการที่ปิดการขาย (${hiddenCount})`}</span>
              <span className="sm:hidden">{showHidden ? '🙈 ซ่อน' : `👁️ แสดง (${hiddenCount})`}</span>
            </button>
          )}

          <button onClick={openAddModal} className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-xl font-bold hover:bg-blue-700 shadow-md transition-all text-sm sm:text-base flex-1 sm:flex-none">
            + เพิ่มท็อปปิ้ง
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 shrink-0 border-b border-gray-100 mb-4 custom-scrollbar">
        <button onClick={() => setFilterCat("all")} className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold border transition-colors ${filterCat === "all" ? "bg-gray-800 text-white border-gray-800" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>ทั้งหมด</button>
        {categories.map((c: any) => <button key={c.id} onClick={() => setFilterCat(c.value)} className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold border transition-colors ${filterCat === c.value ? "bg-purple-600 text-white border-purple-600" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>{c.label}</button>)}
      </div>

      <div className="lg:flex-1 lg:overflow-y-auto pr-2 custom-scrollbar">
        {filteredToppings.length === 0 ? <div className="text-center py-12 sm:py-20 text-gray-400 font-medium border-2 border-dashed rounded-xl text-sm sm:text-base">ไม่พบท็อปปิ้งที่ค้นหาครับ</div> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 pb-4 sm:pb-8">
            {filteredToppings.map((t: any) => {
              const isActive = t.isActive ?? true; const available = t.isAvailable ?? true;
              return (
                <div key={t.id} className={`p-4 sm:p-5 border-2 rounded-2xl flex flex-col gap-3 sm:gap-4 transition-all duration-300 ${!isActive ? 'bg-gray-50 border-gray-200 opacity-80 grayscale-30' : 'bg-white border-purple-50 hover:shadow-md hover:border-purple-100'}`}>
                  
                  <div className="flex gap-3 sm:gap-4 items-start">
                    {t.image ? (
                      <img src={t.image} className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border" alt={t.name} />
                    ) : (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-xs">No Img</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base sm:text-lg text-gray-800 line-clamp-1">{t.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-500 mt-0.5 truncate">🗂️ หมวดหมู่: {categories.find((c:any) => c.value === t.category)?.label || t.category}</p>
                      <p className="font-black text-purple-600 text-lg sm:text-xl mt-1">+฿{t.price}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 text-xs sm:text-sm font-bold mt-auto pt-1 flex-wrap">
                    <span className={`px-2 sm:px-3 py-1 rounded-lg ${isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{isActive ? '✅ ขายอยู่' : '🛑 ปิดการขาย'}</span>
                    <span className={`px-2 sm:px-3 py-1 rounded-lg ${available ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>{available ? '📦 พร้อมขาย' : '⚠️ หมด'}</span>
                  </div>

                  {/* 🌟 ปรับปรุงปุ่มกด Hover, Active Effect และคำศัพท์ */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button onClick={() => openEditModal(t)} className="bg-yellow-50 text-yellow-700 hover:bg-yellow-100 active:scale-95 transition-all py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base">✏️ แก้ไข</button>
                    
                    {isActive ? (
                      <button onClick={() => toggleActive(t)} className="bg-red-50 text-red-600 hover:bg-red-100 active:scale-95 transition-all py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base">🗑️ ปิดการขาย</button>
                    ) : (
                      <button onClick={() => toggleActive(t)} className="bg-green-600 text-white hover:bg-green-700 active:scale-95 transition-all py-2.5 sm:py-3 rounded-xl font-bold shadow-sm text-sm sm:text-base">✅ เปิดขายอีกครั้ง</button>
                    )}
                    
                    {isActive && (
                      <button onClick={() => toggleAvailable(t)} className={`col-span-2 py-2.5 sm:py-3 rounded-xl font-bold border-2 active:scale-[0.98] transition-all text-xs sm:text-sm ${available ? 'border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300' : 'border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300'}`}>
                        <span className="hidden sm:inline">{available ? '🛑 ปรับสถานะเป็น "สินค้าหมด"' : '📦 ปรับสถานะเป็น "พร้อมขาย"'}</span>
                        <span className="sm:hidden">{available ? '🛑 สินค้าหมด' : '📦 พร้อมขาย'}</span>
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
        <div className="fixed inset-0 bg-black/60 z-100 flex items-center justify-center backdrop-blur-sm p-4 transition-opacity" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl border border-gray-100 transform transition-all" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl sm:text-2xl font-black text-gray-800 mb-4 sm:mb-6 border-b pb-3 sm:pb-4">{editingId ? '✏️ แก้ไขท็อปปิ้ง' : '+ เพิ่มท็อปปิ้งใหม่'}</h2>
            <form onSubmit={handleSaveTopping} className="flex flex-col gap-3 sm:gap-4">
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

              <div className="flex gap-3 sm:gap-4 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-100 text-gray-600 hover:bg-gray-200 active:scale-95 transition-all py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base">ยกเลิก</button>
                <button type="submit" className="flex-1 bg-purple-600 text-white hover:bg-purple-700 active:scale-95 transition-all py-3 sm:py-4 rounded-xl font-bold shadow-md text-sm sm:text-base">💾 บันทึก</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}