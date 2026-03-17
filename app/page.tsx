"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [cart, setCart] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3001/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("ดึงข้อมูลไม่สำเร็จ:", error);
        setIsLoading(false);
      });
  }, []);

  const addToCart = (product: any) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === productId);
      if (existingItem?.quantity === 1) {
        return prevCart.filter((item) => item.id !== productId);
      } else {
        return prevCart.map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  // ==========================================
  // 🌟 ฟังก์ชันใหม่: จัดการการชำระเงินและยิงเข้า Database
  // ==========================================
  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert("ยังไม่มีสินค้าในตะกร้าครับ!");
      return;
    }

    // 1. แปลงร่างข้อมูลตะกร้า ให้ตรงกับที่ NestJS รอรับ
    const orderPayload = {
      items: cart.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price
      }))
    };

    try {
      // 2. ส่งข้อมูลไปให้ API พอร์ต 3001 จัดการ
      const response = await fetch('http://localhost:3001/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      // 3. เช็คผลลัพธ์
      if (response.ok) {
        const savedOrder = await response.json();
        alert(`🎉 ชำระเงินสำเร็จ!\nยอดรวม: ฿${totalPrice}\nรหัสบิล: ${savedOrder.id}`);
        clearCart(); // ล้างตะกร้าเตรียมรับลูกค้าคนต่อไป
      } else {
        alert("เกิดข้อผิดพลาดในการบันทึกบิลครับ ❌");
      }
    } catch (error) {
      console.error("Error saving order:", error);
      alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์หลังบ้านได้ครับ");
    }
  };
  // ==========================================

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">ระบบ POS - หน้าจอแคชเชียร์</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ฝั่งซ้าย: เมนูสินค้า */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-700 mb-4">เมนูสินค้า</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {isLoading ? (
              <div className="col-span-full flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              products.map((product) => (
                <div 
                  key={product.id} 
                  onClick={() => addToCart(product)}
                  className="bg-white p-4 rounded-xl shadow-sm cursor-pointer transition-all active:scale-95 ring-0 hover:ring-4 hover:ring-blue-500 border border-transparent"
                >
                  <img src={product.image} alt={product.name} className="w-full h-32 object-cover rounded-lg mb-4" />
                  <h3 className="text-md font-semibold text-gray-700">{product.name}</h3>
                  <p className="text-blue-600 font-bold mt-1">฿{product.price}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ฝั่งขวา: ตะกร้าสินค้า */}
        <div className="bg-white p-6 rounded-2xl shadow-sm min-h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h2 className="text-xl font-bold text-gray-800">ออเดอร์ปัจจุบัน</h2>
            {cart.length > 0 && (
              <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors hover:underline">
                ล้างตะกร้าทั้งหมด
              </button>
            )}
          </div>
          
          <div className="space-y-4 mb-6 flex-1 overflow-y-auto">
            {cart.length === 0 ? (
              <p className="text-gray-400 text-center py-4">ยังไม่มีสินค้าในตะกร้า</p>
            ) : (
              cart.map((item, index) => (
                <div key={index} className="flex justify-between items-center border-b pb-3 border-gray-100 last:border-0">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-700">{item.name}</p>
                    <p className="text-sm text-gray-500">฿{item.price} x {item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-bold text-gray-800">฿{item.price * item.quantity}</p>
                    <button onClick={() => removeFromCart(item.id)} className="bg-red-50 text-red-500 px-3 py-1 rounded-lg text-sm font-medium hover:bg-red-100 hover:text-red-600 transition-colors active:scale-95">ลบ</button>
                  </div>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div className="mt-auto pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-bold text-gray-700">ยอดรวมสุทธิ</span>
                <span className="text-3xl font-bold text-blue-600">฿{totalPrice}</span>
              </div>
              {/* 🌟 เปลี่ยน onClick ตรงนี้ให้ไปเรียกใช้ handleCheckout */}
              <button 
                onClick={handleCheckout}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-md flex justify-center items-center gap-2 hover:bg-blue-800 transition-colors duration-300 ease-in-out active:scale-95"
              >
                ชำระเงิน
              </button>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}