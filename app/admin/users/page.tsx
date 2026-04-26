"use client";

import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
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
    const payload = { name, username, password, role };
    const url = editingId ? `http://localhost:3001/users/${editingId}` : "http://localhost:3001/users";
    const method = editingId ? "PUT" : "POST";

    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setIsModalOpen(false);
    fetchUsers();
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
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.username.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a: any, b: any) => {
      const weightA = roleWeight[a.role] || 99;
      const weightB = roleWeight[b.role] || 99;
      return weightA - weightB; // เรียงจากน้อยไปมาก
    });

  return (
    <div className="flex min-h-screen bg-gray-50 h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 p-8 flex flex-col min-w-0">
        <div className="max-w-5xl mx-auto w-full h-full flex flex-col">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 shrink-0">👥 จัดการบัญชีพนักงาน</h1>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col flex-1 min-h-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 border-b pb-4 shrink-0">
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
              <button onClick={openAddModal} className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-md text-lg transition-all shrink-0">
                + เพิ่มพนักงาน
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {sortedAndFilteredUsers.length === 0 ? (
                <div className="text-center py-20 text-gray-400 font-medium border-2 border-dashed rounded-xl">ไม่พบพนักงานที่ค้นหาครับ</div>
              ) : (
                <div className="space-y-4 pb-8">
                  {/* 🌟 วนลูปวาดการ์ดพนักงานที่ถูกจัดเรียงแล้ว */}
                  {sortedAndFilteredUsers.map(u => {
                    const canEdit = currentUser.role === 'manager' || (currentUser.role === 'supervisor' && u.role === 'cashier');

                    return (
                      <div key={u.id} className="p-5 border-2 border-gray-100 rounded-2xl bg-white hover:border-gray-300 hover:shadow-sm transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <p className="font-black text-xl text-gray-800">{u.name}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-sm font-bold">👤 {u.username}</span>
                            <span className={`px-3 py-1 rounded-lg text-sm font-bold ${u.role === 'manager' ? 'bg-purple-100 text-purple-700' : u.role === 'supervisor' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                              {u.role === 'manager' ? '👑 ผู้จัดการ (Manager)' : u.role === 'supervisor' ? '⭐ หัวหน้างาน (Supervisor)' : '🧑‍🍳 แคชเชียร์'}
                            </span>
                          </div>
                        </div>
                        <div className="flex w-full md:w-auto gap-3 shrink-0">
                          {canEdit ? (
                            <button onClick={() => openEditModal(u)} className="flex-1 md:flex-none px-6 py-3 bg-yellow-100 text-yellow-700 rounded-xl font-bold hover:bg-yellow-200 text-md transition-colors">
                              ✏️ แก้ไข
                            </button>
                          ) : (
                            <div className="flex-1 md:flex-none px-6 py-3 bg-gray-50 text-gray-400 rounded-xl font-bold border border-gray-100 text-center text-md cursor-not-allowed">
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
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl border border-gray-100" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-black text-gray-800 mb-6 border-b pb-4">{editingId ? '✏️ แก้ไขข้อมูลพนักงาน' : '+ เพิ่มพนักงานใหม่'}</h2>
            
            <form onSubmit={handleSaveUser} className="flex flex-col gap-4">
              <input type="text" placeholder="ชื่อ - นามสกุล" value={name} onChange={e => setName(e.target.value)} required className="p-4 border-2 rounded-xl outline-none focus:border-blue-500 font-bold text-gray-800 bg-gray-50 focus:bg-white" />
              <input type="text" placeholder="รหัสผู้ใช้งาน (Username)" value={username} onChange={e => setUsername(e.target.value)} required className="p-4 border-2 rounded-xl outline-none focus:border-blue-500 font-bold text-gray-800 bg-gray-50 focus:bg-white"/>
              <input type="password" placeholder={editingId ? "รหัสผ่านใหม่ (เว้นว่างไว้ถ้าไม่เปลี่ยน)" : "รหัสผ่าน"} value={password} onChange={e => setPassword(e.target.value)} required={!editingId} className="p-4 border-2 rounded-xl outline-none focus:border-blue-500 font-bold text-gray-800 bg-gray-50 focus:bg-white" />
              
              <select value={role} onChange={e => setRole(e.target.value)} className="p-4 border-2 rounded-xl outline-none focus:border-blue-500 font-bold text-gray-800 bg-gray-50 focus:bg-white cursor-pointer">
                <option value="cashier">🧑‍🍳 พนักงานหน้าร้าน (Cashier)</option>
                {currentUser.role === 'manager' && (
                  <>
                    <option value="supervisor">⭐ หัวหน้างาน (Supervisor)</option>
                    <option value="manager">👑 ผู้จัดการร้าน (Manager)</option>
                  </>
                )}
              </select>

              <div className="flex gap-4 mt-6 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-100 text-gray-600 py-4 rounded-xl font-bold text-lg hover:bg-gray-200 transition-colors">ยกเลิก</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 shadow-lg border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all">
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