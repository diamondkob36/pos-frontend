"use client";
import { useState } from "react";

export default function CategoryManager({ categories, fetchData }: any) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [value, setValue] = useState("");
  const [label, setLabel] = useState("");
  const [hasType, setHasType] = useState(false);
  const [hasSize, setHasSize] = useState(false);

  // 🌟 State สำหรับค้นหาหมวดหมู่
  const [searchTerm, setSearchTerm] = useState("");

  const openAddModal = () => {
    setValue(""); setLabel(""); setHasType(false); setHasSize(false); setEditingId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (c: any) => {
    setValue(c.value); setLabel(c.label); setHasType(c.hasType); setHasSize(c.hasSize); setEditingId(c.id);
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { value, label, hasType, hasSize };
    const url = editingId ? `http://localhost:3001/categories/${editingId}` : "http://localhost:3001/categories";
    const method = editingId ? "PUT" : "POST";

    // 🌟 1. ดึง Token จากกระเป๋า
    const token = localStorage.getItem("pos_token");

    await fetch(url, { 
      method, 
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` // 🌟 2. แนบกุญแจเข้าไปใน Headers
      }, 
      body: JSON.stringify(payload) 
    });
    
    setIsModalOpen(false);
    fetchData();
  };

  const handleDeleteCategory = async (id: number) => {
    if (confirm("ต้องการลบหมวดหมู่นี้ใช่หรือไม่? (ระบบจะลบได้ก็ต่อเมื่อไม่มีเมนูค้างอยู่เท่านั้น)")) {
      
      const token = localStorage.getItem("pos_token");

      const response = await fetch(`http://localhost:3001/categories/${id}`, { 
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}` 
        }
      });
      
      // 🌟 ถ้าหลังบ้านเตะ Error กลับมา (เช่น ติดเงื่อนไขสินค้าค้างอยู่)
      if (!response.ok) {
        const errorData = await response.json();
        alert(`❌ ${errorData.message}`); // โชว์ข้อความแจ้งเตือน
        return; // หยุดทำงาน ไม่ต้องโหลดข้อมูลใหม่
      }
      
      fetchData(); // ถ้าลบสำเร็จ ค่อยโหลดข้อมูลมาแสดงใหม่
    }
  };

  // 🌟 ลอจิกการค้นหา
  const filteredCategories = categories.filter((c: any) => 
    c.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[calc(100vh-160px)]">
      
      {/* 🌟 Header: ช่องค้นหา และปุ่มเพิ่มรายการ */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 border-b pb-4 shrink-0">
        <div className="relative w-full sm:max-w-md">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
          <input 
            type="text" 
            placeholder="ค้นหาหมวดหมู่ (ชื่อ หรือ ID)..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            className="w-full pl-12 pr-4 py-3 border-2 rounded-xl outline-none focus:border-gray-800 bg-gray-50 focus:bg-white transition-colors font-medium text-gray-800"
          />
        </div>
        <button onClick={openAddModal} className="w-full sm:w-auto bg-gray-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-900 shadow-md text-lg transition-all shrink-0">
          + เพิ่มหมวดหมู่
        </button>
      </div>

      {/* 🌟 พื้นที่รายการหมวดหมู่ (Scroll ได้) */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-20 text-gray-400 font-medium border-2 border-dashed rounded-xl">ไม่พบหมวดหมู่ที่ค้นหาครับ</div>
        ) : (
          <div className="space-y-4 pb-8">
            {filteredCategories.map((c: any) => (
              <div key={c.id} className="p-5 border-2 border-gray-100 rounded-2xl bg-white hover:border-gray-300 hover:shadow-sm transition-all flex flex-col gap-4">
                <div>
                  <p className="font-black text-xl text-gray-800">{c.label}</p>
                  <p className="text-sm font-medium text-gray-500 mt-1 bg-gray-100 inline-block px-2 py-1 rounded-md">ID: {c.value}</p>
                </div>
                
                <div className="flex flex-wrap gap-2 text-sm font-bold">
                  {c.hasType ? <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg">❄️ เลือกร้อน/เย็น/ปั่น</span> : <span className="bg-gray-100 text-gray-400 px-3 py-1 rounded-lg">เมนูเดี่ยว</span>}
                  {c.hasSize && <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg">📏 เลือกไซส์ได้</span>}
                </div>

                <div className="grid grid-cols-2 gap-3 mt-2">
                  <button onClick={() => openEditModal(c)} className="bg-yellow-100 text-yellow-700 py-3 rounded-xl font-bold hover:bg-yellow-200 text-md">
                    ✏️ แก้ไข
                  </button>
                  <button onClick={() => handleDeleteCategory(c.id)} className="bg-red-100 text-red-600 py-3 rounded-xl font-bold hover:bg-red-200 text-md">
                    🗑️ ลบทิ้ง
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🌟 Pop-up Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center backdrop-blur-sm p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl border border-gray-100" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-black text-gray-800 mb-6 border-b pb-4">{editingId ? '✏️ แก้ไขหมวดหมู่' : '+ สร้างหมวดหมู่ใหม่'}</h2>
            
            <form onSubmit={handleSaveCategory} className="flex flex-col gap-5">
              <input type="text" placeholder="ชื่อหมวดหมู่ภาษาไทย (เช่น เครื่องดื่ม)" value={label} onChange={e => setLabel(e.target.value)} required className="p-4 border-2 rounded-xl outline-none focus:border-gray-800 font-bold text-gray-800 bg-gray-50 focus:bg-white" />
              <input type="text" placeholder="รหัสภาษาอังกฤษ (เช่น beverage)" value={value} onChange={e => setValue(e.target.value)} required className="p-4 border-2 rounded-xl outline-none focus:border-gray-800 font-bold text-gray-800 bg-gray-50 focus:bg-white" />
              
              <div className="flex flex-col gap-3 p-4 border-2 rounded-xl bg-gray-50">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">ตัวเลือกเสริมของหมวดหมู่นี้</p>
                <label className="flex items-center gap-3 cursor-pointer font-bold text-gray-800 bg-white p-3 rounded-lg border shadow-sm">
                  <input type="checkbox" checked={hasType} onChange={e => setHasType(e.target.checked)} className="w-5 h-5 accent-gray-800" />
                  เปิดให้เลือกร้อน/เย็น/ปั่น
                </label>
                <label className="flex items-center gap-3 cursor-pointer font-bold text-gray-800 bg-white p-3 rounded-lg border shadow-sm">
                  <input type="checkbox" checked={hasSize} onChange={e => setHasSize(e.target.checked)} className="w-5 h-5 accent-gray-800" />
                  เปิดให้เลือกไซส์แก้ว (S/M/L)
                </label>
              </div>

              <div className="flex gap-4 mt-4 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-100 text-gray-600 py-4 rounded-xl font-bold text-lg hover:bg-gray-200">ยกเลิก</button>
                <button type="submit" className="flex-1 bg-gray-800 text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-900 shadow-lg border-b-4 border-black active:border-b-0 active:translate-y-1 transition-all">
                  💾 บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}