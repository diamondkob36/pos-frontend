"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("cashier");
  const [editingId, setEditingId] = useState<number | null>(null);

  // เช็คสิทธิ์
  useEffect(() => {
    const userStr = localStorage.getItem("pos_user");
    if (!userStr) { router.push("/login"); return; }
    const user = JSON.parse(userStr);
    if (user.role !== "manager") {
      alert("เฉพาะผู้จัดการเท่านั้นครับ!");
      router.push("/");
    } else {
      fetchUsers();
    }
  }, [router]);

  const fetchUsers = async () => {
    const res = await fetch("http://localhost:3001/users");
    setUsers(await res.json());
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name, username, password, role };
    const url = editingId ? `http://localhost:3001/users/${editingId}` : "http://localhost:3001/users";
    const method = editingId ? "PUT" : "POST";

    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setName(""); setUsername(""); setPassword(""); setRole("cashier"); setEditingId(null);
    fetchUsers();
  };

  const handleEdit = (u: any) => {
    setName(u.name); setUsername(u.username); setPassword(""); setRole(u.role); setEditingId(u.id);
  };

  const handleDelete = async (id: number) => {
    if (confirm("ลบพนักงานคนนี้?")) {
      await fetch(`http://localhost:3001/users/${id}`, { method: "DELETE" });
      fetchUsers();
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8 h-screen overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">👥 จัดการบัญชีพนักงาน</h1>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
            <h2 className="text-xl font-bold mb-4">{editingId ? "✏️ แก้ไขข้อมูลพนักงาน" : "+ เพิ่มพนักงานใหม่"}</h2>
            <form onSubmit={handleSaveUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="ชื่อ - นามสกุล" value={name} onChange={e => setName(e.target.value)} required className="p-3 border rounded-xl outline-none focus:border-blue-500" />
              <input type="text" placeholder="รหัสผู้ใช้งาน (Username)" value={username} onChange={e => setUsername(e.target.value)} required className="p-3 border rounded-xl outline-none focus:border-blue-500" />
              <input type="password" placeholder={editingId ? "รหัสผ่านใหม่ (เว้นว่างไว้ถ้าไม่เปลี่ยน)" : "รหัสผ่าน"} value={password} onChange={e => setPassword(e.target.value)} required={!editingId} className="p-3 border rounded-xl outline-none focus:border-blue-500" />
              <select value={role} onChange={e => setRole(e.target.value)} className="p-3 border rounded-xl outline-none focus:border-blue-500 font-bold text-gray-700">
                <option value="cashier">🧑‍🍳 พนักงานหน้าร้าน (Cashier)</option>
                <option value="manager">👑 ผู้จัดการร้าน (Manager)</option>
              </select>
              <button type="submit" className="md:col-span-2 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 shadow-sm">
                {editingId ? "บันทึกข้อมูล" : "สร้างบัญชี"}
              </button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-4">📋 รายชื่อพนักงานทั้งหมด</h2>
            <div className="space-y-3">
              {users.map(u => (
                <div key={u.id} className="flex justify-between items-center p-4 border border-gray-100 rounded-xl hover:bg-gray-50">
                  <div>
                    <p className="font-bold text-gray-800 text-lg">{u.name}</p>
                    <p className="text-sm text-gray-500">Username: {u.username} | สิทธิ์: <span className={u.role === 'manager' ? 'text-purple-600 font-bold' : 'text-blue-600'}>{u.role}</span></p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(u)} className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg font-bold">แก้ไข</button>
                    {u.username !== 'admin' && ( // ซ่อนปุ่มลบสำหรับ admin หลัก
                      <button onClick={() => handleDelete(u.id)} className="px-4 py-2 bg-red-100 text-red-600 rounded-lg font-bold">ลบ</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}