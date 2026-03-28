"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:3001/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        // บันทึกข้อมูลพนักงานลงในเว็บบราวเซอร์
        localStorage.setItem("pos_user", JSON.stringify(data.user));
        // ล็อกอินสำเร็จ ให้เด้งไปหน้าแคชเชียร์
        router.push("/");
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์หลังบ้านได้");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-4xl mx-auto mb-4 shadow-lg">☕</div>
          <h1 className="text-3xl font-black text-gray-800">POS System</h1>
          <p className="text-gray-500 font-medium mt-1">กรุณาเข้าสู่ระบบเพื่อใช้งาน</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold text-center mb-6 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">รหัสผู้ใช้งาน (Username)</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-4 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all font-medium text-gray-700"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">รหัสผ่าน (Password)</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all font-medium text-gray-700"
              required 
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 active:scale-95 transition-all shadow-md mt-4"
          >
            เข้าสู่ระบบ
          </button>
        </form>
      </div>
    </div>
  );
}