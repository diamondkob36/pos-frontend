"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State สำหรับฟอร์มกรอกข้อมูล
  const [formData, setFormData] = useState({ name: "", price: "", image: "" });
  const [editingId, setEditingId] = useState<number | null>(null);

  // ดึงข้อมูลสินค้าทั้งหมดมาโชว์
  const fetchProducts = () => {
    setIsLoading(true);
    fetch("http://localhost:3001/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setIsLoading(false);
      })
      .catch((error) => console.error("Error fetching products:", error));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ฟังก์ชันจัดการตอนพิมพ์ข้อความลงฟอร์ม
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // ฟังก์ชันกดปุ่ม "บันทึกข้อมูล" (ครอบคลุมทั้ง สร้างใหม่ และ แก้ไข)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // เตรียมข้อมูล (แปลง price จากตัวหนังสือเป็นตัวเลข)
    const payload = {
      name: formData.name,
      price: Number(formData.price),
      image: formData.image,
    };

    try {
      let url = "http://localhost:3001/products";
      let method = "POST"; // ค่าเริ่มต้นคือสร้างใหม่

      // ถ้ามี editingId แปลว่าเป็นการ "แก้ไข"
      if (editingId) {
        url = `http://localhost:3001/products/${editingId}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert(editingId ? "อัปเดตสินค้าสำเร็จ! ✅" : "เพิ่มสินค้าใหม่สำเร็จ! 🎉");
        setFormData({ name: "", price: "", image: "" }); // ล้างฟอร์ม
        setEditingId(null); // ล้างสถานะการแก้ไข
        fetchProducts(); // โหลดข้อมูลตารางใหม่
      } else {
        alert("เกิดข้อผิดพลาดในการบันทึก ❌");
      }
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  // ฟังก์ชันกดปุ่ม "แก้ไข" (ดึงข้อมูลมาแปะลงฟอร์ม)
  const handleEdit = (product: any) => {
    setFormData({
      name: product.name,
      price: product.price.toString(),
      image: product.image,
    });
    setEditingId(product.id);
    window.scrollTo({ top: 0, behavior: "smooth" }); // เลื่อนจอกลับขึ้นไปที่ฟอร์ม
  };

  // ฟังก์ชันกดปุ่ม "ลบ"
  const handleDelete = async (id: number, name: string) => {
    const confirmDelete = window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบ "${name}"?`);
    if (!confirmDelete) return;

    try {
      const res = await fetch(`http://localhost:3001/products/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("ลบสินค้าเรียบร้อย 🗑️");
        fetchProducts(); // โหลดข้อมูลตารางใหม่
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* หัวหน้าเว็บ */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">⚙️ ระบบจัดการหลังร้าน (Admin)</h1>
          <Link href="/" className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
            ← กลับไปหน้าแคชเชียร์
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ฝั่งซ้าย: ฟอร์มเพิ่ม/แก้ไขสินค้า */}
          <div className="bg-white p-6 rounded-2xl shadow-sm h-fit border-t-4 border-blue-600">
            <h2 className="text-xl font-bold text-gray-700 mb-4">
              {editingId ? "✏️ แก้ไขข้อมูลสินค้า" : "➕ เพิ่มสินค้าใหม่"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">ชื่อสินค้า</label>
                <input 
                  type="text" name="name" required
                  value={formData.name} onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-black"
                  placeholder="เช่น ชาเขียวเย็น"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">ราคา (บาท)</label>
                <input 
                  type="number" name="price" required min="0"
                  value={formData.price} onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-black"
                  placeholder="เช่น 60"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 ">URL รูปภาพ</label>
                <input 
                  type="text" name="image" required
                  value={formData.image} onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-black"
                  placeholder="วางลิงก์รูปภาพที่นี่"
                />
              </div>
              
              {/* แสดงตัวอย่างรูปภาพ */}
              {formData.image && (
                <div className="mt-2 flex justify-center border rounded-lg p-2 bg-gray-50">
                  <img src={formData.image} alt="Preview" className="h-32 object-contain rounded" 
                       onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150?text=Invalid+Image')} 
                  />
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors">
                  {editingId ? "บันทึกการเปลี่ยนแปลง" : "เพิ่มสินค้า"}
                </button>
                {editingId && (
                  <button 
                    type="button" 
                    onClick={() => { setEditingId(null); setFormData({ name: "", price: "", image: "" }); }}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-bold hover:bg-gray-300 transition-colors"
                  >
                    ยกเลิก
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* ฝั่งขวา: ตารางแสดงสินค้าทั้งหมด */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm">
            <h2 className="text-xl font-bold text-gray-700 mb-4">📋 รายการสินค้าปัจจุบัน</h2>
            
            {isLoading ? (
              <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 text-sm border-b-2 border-gray-200">
                      <th className="p-3">รูปภาพ</th>
                      <th className="p-3">ชื่อสินค้า</th>
                      <th className="p-3">ราคา</th>
                      <th className="p-3 text-center">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-3">
                          <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded-md border" />
                        </td>
                        <td className="p-3 font-medium text-gray-700">{product.name}</td>
                        <td className="p-3 text-blue-600 font-bold">฿{product.price}</td>
                        <td className="p-3 text-center space-x-2">
                          <button 
                            onClick={() => handleEdit(product)}
                            className="bg-yellow-50 text-yellow-600 px-3 py-1 rounded-md text-sm font-medium hover:bg-yellow-100 transition-colors"
                          >
                            แก้ไข
                          </button>
                          <button 
                            onClick={() => handleDelete(product.id, product.name)}
                            className="bg-red-50 text-red-600 px-3 py-1 rounded-md text-sm font-medium hover:bg-red-100 transition-colors"
                          >
                            ลบ
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}