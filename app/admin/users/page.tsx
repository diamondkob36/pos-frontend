"use client";

import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import ScrollToTop from "../../_components/ScrollToTop";
import { useAuth } from "../../hooks/useAuth";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const { currentUser } = useAuth(["manager", "supervisor"]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("cashier");
  const [searchTerm, setSearchTerm] = useState("");
  const [showHidden, setShowHidden] = useState(false);
  const hiddenCount = users.filter(u => u.isActive === false).length;

  useEffect(() => {
    if (currentUser && (currentUser.role === "manager" || currentUser.role === "supervisor")) {
      fetchUsers();
    }
  }, [currentUser]);

  const fetchUsers = async () => {
    try {
      // 🌟 1. ดึง Token จากตู้เซฟ
      const token = localStorage.getItem("pos_token"); 
      
      // 🌟 2. แนบกุญแจไปกับ fetch
      const res = await fetch("http://localhost:3001/users", {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        }
      });
      
      const data = await res.json();
      
      // 🌟 3. ดักจับ Array ป้องกันหน้าจอขาวเวลา Token หมดอายุ
      setUsers(Array.isArray(data) ? data : []); 
      
    } catch (error) {
      console.error("ดึงข้อมูลพนักงานไม่สำเร็จ:", error);
      setUsers([]);
    }
  };

  const openAddModal = () => {
    setName(""); setUsername(""); setPassword(""); setRole("cashier"); setEditingId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (u: any) => {
    setName(u.name); setUsername(u.username); setPassword(""); setRole(u.role); setEditingId(u.id);
    setIsModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // สร้าง payload โดยเช็คว่ามี password หรือไม่
    const payload: any = { name, username, role };
    
    // เพิ่ม password เฉพาะเมื่อมีค่า (สำหรับการสร้างใหม่หรือการแก้ไขที่ต้องการเปลี่ยนรหัส)
    if (password && password.trim() !== '') {
      payload.password = password;
    }
    
    const url = editingId ? `http://localhost:3001/users/${editingId}` : "http://localhost:3001/users";
    const method = editingId ? "PUT" : "POST";

    const token = localStorage.getItem("pos_token");

    try {
      const response = await fetch(url, { 
        method, 
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }, 
        body: JSON.stringify(payload) 
      });
      
      if (!response.ok) {
        throw new Error('Failed to save user');
      }
      
      setIsModalOpen(false);
      fetchUsers();
      
      // แสดง Toast แทน Alert
      const { toast } = await import("@/lib/toast");
      toast.success(editingId ? 'แก้ไขข้อมูลสำเร็จ!' : 'เพิ่มพนักงานสำเร็จ!');
    } catch (error) {
      const { toast } = await import("@/lib/toast");
      toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    }
  };

  const handleToggleStatus = async (u: any) => {
    const { confirm, toast } = await import("@/lib/toast");
    
    const newStatus = !u.isActive;
    const confirmed = await confirm(
      `ต้องการ ${newStatus ? 'เปิดสิทธิ์' : 'ระงับสิทธิ์'} คุณ ${u.name} ใช่หรือไม่?`,
      newStatus ? 'เปิดการใช้งาน' : 'ระงับการใช้งาน'
    );
    
    if (confirmed) {
      try {
        const token = localStorage.getItem("pos_token");
        
        // ส่งเฉพาะ field ที่ต้องการอัพเดท
        const payload = { isActive: newStatus };
        
        await fetch(`http://localhost:3001/users/${u.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        
        fetchUsers();
        toast.success(newStatus ? 'เปิดการใช้งานสำเร็จ!' : 'ระงับการใช้งานสำเร็จ!');
      } catch (error) {
        toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
      }
    }
  };

  if (!currentUser || !["manager", "supervisor"].includes(currentUser.role)) return null;

  // 🌟 ลอจิกการให้คะแนนตำแหน่ง (ค่าน้อย = อยู่บนสุด)
  const roleWeight: Record<string, number> = {
    manager: 1,
    supervisor: 2,
    cashier: 3
  };

  // 🌟 กรองข้อมูลตามคำค้นหา แล้วนำมาเรียงลำดับ (Sort) ตามน้ำหนักตำแหน่ง
  const sortedAndFilteredUsers = users
    .filter((u: any) => 
      (showHidden || u.isActive !== false) && // 🌟 เพิ่มเงื่อนไขซ่อน/แสดง
      (u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.username.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a: any, b: any) => {
      const weightA = roleWeight[a.role] || 99;
      const weightB = roleWeight[b.role] || 99;
      return weightA - weightB;
    });

  return (
    <div className="flex min-h-screen lg:h-screen bg-gray-50 lg:overflow-hidden">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col min-w-0 lg:h-screen lg:overflow-hidden">
        <div className="max-w-5xl mx-auto w-full lg:h-full flex flex-col">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8 shrink-0">👥 จัดการบัญชีพนักงาน</h1>
          
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col lg:flex-1 lg:min-h-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 border-b pb-4 shrink-0">
              <div className="relative w-full sm:max-w-md">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
                <input 
                  type="text" 
                  placeholder="ค้นหาชื่อ หรือ Username..." 
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)} 
                  className="w-full pl-12 pr-4 py-3 border-2 rounded-xl outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors font-medium text-gray-800"
                />
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                {/* 🌟 ปุ่มแสดงรายการที่ซ่อน */}
                {hiddenCount > 0 && (
                  <button 
                    onClick={() => setShowHidden(!showHidden)}
                    className={`px-4 py-3 rounded-xl font-bold transition-all border-2 ${
                      showHidden 
                      ? 'bg-gray-800 text-white border-gray-800' 
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {showHidden ? '🙈 ซ่อนบัญชีที่ถูกระงับ' : `👁️ แสดงบัญชีที่ถูกระงับ (${hiddenCount})`}
                  </button>
                )}
                
                <button onClick={openAddModal} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-md transition-all">
                  + เพิ่มพนักงาน
                </button>
              </div>
            </div>

            <div className="lg:flex-1 lg:overflow-y-auto pr-2 custom-scrollbar">
              {sortedAndFilteredUsers.length === 0 ? (
                <div className="text-center py-12 sm:py-20 text-gray-400 font-medium border-2 border-dashed rounded-xl text-sm sm:text-base">ไม่พบพนักงานที่ค้นหาครับ</div>
              ) : (
                <div className="space-y-3 sm:space-y-4 pb-4 sm:pb-8">
                  {/* 🌟 วนลูปวาดการ์ดพนักงานที่ถูกจัดเรียงแล้ว */}
                  {sortedAndFilteredUsers.map(u => {
                    const canEdit = currentUser.role === 'manager' || (currentUser.role === 'supervisor' && u.role === 'cashier');

                    return (
                      <div key={u.id} className="p-4 sm:p-5 border-2 border-gray-100 rounded-2xl bg-white hover:border-gray-300 hover:shadow-sm transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4">
                        <div>
                          <p className="font-black text-lg sm:text-xl text-gray-800">{u.name}</p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap text-xs sm:text-sm">
                            <span className={`px-3 py-1 rounded-lg text-sm font-bold ${u.role === 'manager' ? 'bg-purple-100 text-purple-700' : u.role === 'supervisor' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                              {u.role === 'manager' ? '👑 ผู้จัดการ (Manager)' : u.role === 'supervisor' ? '⭐ หัวหน้างาน (Supervisor)' : '🧑‍🍳 แคชเชียร์'}
                            </span>

                            {/* 🌟 เพิ่มแถบแสดงสถานะตรงนี้ครับ */}
                            <span className={`px-3 py-1 rounded-lg text-sm font-bold border ${
                              u.isActive !== false 
                                ? 'bg-green-50 text-green-700 border-green-200' 
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}>
                              {u.isActive !== false ? '● กำลังใช้งาน' : '● ปิดการใช้งาน'}
                            </span>
                          </div>
                        </div>
                        <div className="flex w-full md:w-auto gap-2 sm:gap-3 shrink-0">
                          {canEdit ? (
                            <>
                              <button onClick={() => openEditModal(u)} className="flex-1 md:flex-none px-4 sm:px-6 py-2.5 sm:py-3 bg-yellow-100 text-yellow-700 rounded-xl font-bold hover:bg-yellow-200 text-sm sm:text-md transition-colors">
                                ✏️ แก้ไข
                              </button>
                              
                              {/* 🌟 เช็คว่าบัญชีในการ์ดนี้ ตรงกับคนที่ล็อกอินอยู่หรือไม่ */}
                              {currentUser?.id !== u.id ? (
                                <button 
                                  onClick={() => handleToggleStatus(u)} 
                                  className={`flex-1 md:flex-none px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-md transition-colors ${
                                    u.isActive !== false // ดักค่า null ให้มองว่าเป็น true (เปิดสิทธิ์) ไว้ก่อน
                                      ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                                  }`}
                                >
                                  <span className="hidden sm:inline">{u.isActive !== false ? '🚫 ระงับการใช้งาน' : '✅ เปิดการใช้งาน'}</span>
                                  <span className="sm:hidden">{u.isActive !== false ? '🚫 ระงับ' : '✅ เปิด'}</span>
                                </button>
                              ) : (
                                /* 🌟 ถ้าเป็นบัญชีตัวเอง ให้แสดงกล่องข้อความแทนปุ่มกด เพื่อป้องกันการล็อคตัวเอง */
                                <div className="flex-1 md:flex-none px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-100 text-gray-500 rounded-xl font-bold border border-gray-200 text-center text-sm sm:text-md cursor-not-allowed">
                                  👑 บัญชีของคุณ
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="flex-1 md:flex-none px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-50 text-gray-400 rounded-xl font-bold border border-gray-100 text-center text-sm sm:text-md cursor-not-allowed">
                              🔒 ไม่มีสิทธิ์
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center backdrop-blur-sm p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-gray-100" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl sm:text-2xl font-black text-gray-800 mb-4 sm:mb-6 border-b pb-3 sm:pb-4">{editingId ? '✏️ แก้ไขข้อมูลพนักงาน' : '+ เพิ่มพนักงานใหม่'}</h2>
            
            <form onSubmit={handleSaveUser} className="flex flex-col gap-3 sm:gap-4">
              <input type="text" placeholder="ชื่อ - นามสกุล" value={name} onChange={e => setName(e.target.value)} required className="p-3 sm:p-4 border-2 rounded-xl outline-none focus:border-blue-500 font-bold text-gray-800 bg-gray-50 focus:bg-white text-sm sm:text-base" />
              <input type="text" placeholder="รหัสผู้ใช้งาน (Username)" value={username} onChange={e => setUsername(e.target.value)} required className="p-3 sm:p-4 border-2 rounded-xl outline-none focus:border-blue-500 font-bold text-gray-800 bg-gray-50 focus:bg-white text-sm sm:text-base"/>
              <input type="password" placeholder={editingId ? "รหัสผ่านใหม่ (เว้นว่างไว้ถ้าไม่เปลี่ยน)" : "รหัสผ่าน"} value={password} onChange={e => setPassword(e.target.value)} required={!editingId} className="p-3 sm:p-4 border-2 rounded-xl outline-none focus:border-blue-500 font-bold text-gray-800 bg-gray-50 focus:bg-white text-sm sm:text-base" />
              
              <select value={role} onChange={e => setRole(e.target.value)} className="p-3 sm:p-4 border-2 rounded-xl outline-none focus:border-blue-500 font-bold text-gray-800 bg-gray-50 focus:bg-white cursor-pointer text-sm sm:text-base">
                <option value="cashier">🧑‍🍳 พนักงานหน้าร้าน (Cashier)</option>
                {currentUser.role === 'manager' && (
                  <>
                    <option value="supervisor">⭐ หัวหน้างาน (Supervisor)</option>
                    <option value="manager">👑 ผู้จัดการร้าน (Manager)</option>
                  </>
                )}
              </select>

              <div className="flex gap-3 sm:gap-4 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-100 text-gray-600 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-gray-200 transition-colors">ยกเลิก</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-blue-700 shadow-lg border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all">
                  💾 บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ปุ่มเลื่อนขึ้นด้านบน */}
      <ScrollToTop />
    </div>
  );
}