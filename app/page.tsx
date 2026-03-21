"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const [cart, setCart] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State ควบคุมหน้าต่าง
  const [isConfirming, setIsConfirming] = useState(false);
  const [receiptData, setReceiptData] = useState<any | null>(null);

  // 🌟 State ใหม่: สำหรับเก็บจำนวนเงินที่รับมาจากลูกค้า
  const [amountReceived, setAmountReceived] = useState<string>("");

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

  // 🌟 คำนวณเงินทอนแบบ Real-time
  const numericAmount = parseFloat(amountReceived) || 0;
  const changeAmount = numericAmount - totalPrice;
  const isEnoughCash = numericAmount >= totalPrice; // เช็คว่าเงินพอจ่ายไหม

  const handleCheckoutClick = () => {
    if (cart.length === 0) {
      alert("ยังไม่มีสินค้าในตะกร้าครับ!");
      return;
    }
    setAmountReceived(""); // ล้างช่องกรอกเงินทุกครั้งที่เปิดหน้าต่างใหม่
    setIsConfirming(true);
  };

  const confirmAndSaveOrder = async () => {
    if (!isEnoughCash) return;

    const orderPayload = {
      items: cart.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price
      }))
    };

    try {
      const response = await fetch('http://localhost:3001/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      if (response.ok) {
        const savedOrder = await response.json();
        
        // 🌟 ล็อกข้อมูลตะกร้าและยอดเงิน ณ วินาทีนี้ เพื่อป้องกัน undefined
        const finalCart = [...cart];
        const finalTotal = totalPrice;
        
        // 🌟 ตอนเก็บข้อมูลใบเสร็จ ให้เพิ่ม dailyNumber เข้าไปด้วย
        setReceiptData({
          id: savedOrder.id,
          dailyNumber: savedOrder.dailyNumber || savedOrder.id || "-", // 👈 เพิ่มบรรทัดนี้
          date: new Date().toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }),
          items: [...cart],
          total: totalPrice,
          received: numericAmount,
          change: changeAmount
        });
        
        setIsConfirming(false);

      } else {
        alert("เกิดข้อผิดพลาดในการบันทึกบิลครับ ❌");
      }
    } catch (error) {
      console.error("Error saving order:", error);
      alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์หลังบ้านได้ครับ");
    }
  };

  const handleCloseReceiptAndFinish = () => {
    setReceiptData(null);
    setAmountReceived("");
    clearCart();
  };

  // 🌟 ฟังก์ชันจัดการเมื่อคลิกพื้นที่ว่างรอบๆ กล่อง (Backdrop)
  const handleBackdropClick = () => {
    if (isConfirming) {
      setIsConfirming(false);
      setAmountReceived("");
    } else if (receiptData) {
      handleCloseReceiptAndFinish();
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8 print:bg-white print:p-0">
      
      <div className="print:hidden">
        {/* แถบเมนูด้านบน */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-800">ระบบ POS - หน้าจอแคชเชียร์</h1>
          <div className="flex gap-3">
            <Link href="/history" className="bg-white text-blue-600 px-4 py-2 rounded-lg font-bold shadow-sm border border-blue-200 hover:bg-blue-50 transition-colors">
              📊 ประวัติยอดขาย
            </Link>
            <Link href="/admin" className="bg-gray-800 text-white px-4 py-2 rounded-lg font-bold shadow-sm hover:bg-gray-900 transition-colors">
              ⚙️ จัดการหลังร้าน
            </Link>
          </div>
        </div>

        {/* สินค้า และ ตะกร้า */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-700 mb-4">เมนูสินค้า</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {isLoading ? (
                <div className="col-span-full flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                products.map((product) => (
                  <div key={product.id} onClick={() => addToCart(product)} className="bg-white p-4 rounded-xl shadow-sm cursor-pointer transition-all active:scale-95 ring-0 hover:ring-4 hover:ring-blue-500 border border-transparent">
                    <img src={product.image} alt={product.name} className="w-full h-32 object-cover rounded-lg mb-4" />
                    <h3 className="text-md font-semibold text-gray-700">{product.name}</h3>
                    <p className="text-blue-600 font-bold mt-1">฿{product.price}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm min-h-[400px] flex flex-col">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="text-xl font-bold text-gray-800">ออเดอร์ปัจจุบัน</h2>
              {cart.length > 0 && (
                <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors hover:underline">ล้างตะกร้าทั้งหมด</button>
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
                <button 
                  onClick={handleCheckoutClick}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-md flex justify-center items-center gap-2 hover:bg-blue-800 transition-colors duration-300 ease-in-out active:scale-95"
                >
                  ชำระเงิน
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* ส่วนที่ 2: Pop-up ยืนยันชำระเงิน & ใบเสร็จ (Modal) */}
      {/* ========================================== */}
      {(isConfirming || receiptData) && (
        // 🌟 พื้นหลังกระจกฝ้า พร้อม onClick สำหรับปิดเมื่อกดนอกกรอบ
        <div 
          className="fixed inset-0 bg-white/40 flex items-center justify-center z-50 backdrop-blur-md print:static print:bg-white print:block"
          onClick={handleBackdropClick}
        >
          
          {/* 🌟 กล่องเนื้อหาตรงกลาง (ใส่ onClick e.stopPropagation() เพื่อไม่ให้กล่องปิดเวลากดข้างในกล่อง) */}
          <div 
            className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-100 print:max-w-full print:shadow-none print:p-0 print:m-0"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* 🌟 โหมดที่ 1: ตรวจสอบและกรอกเงินรับมา */}
            {isConfirming && (
              <>
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">สรุปยอดชำระเงิน</h2>
                </div>

                <div className="border-t-2 border-b-2 border-gray-100 py-4 mb-4 space-y-3 max-h-40 overflow-y-auto">
                  {cart.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between text-gray-700 text-sm">
                      <span>{item.name} <span className="text-gray-400">x{item.quantity}</span></span>
                      <span>฿{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* ส่วนคำนวณเงิน */}
                <div className="bg-gray-50 p-4 rounded-xl mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-600 font-medium">ยอดที่ต้องชำระ</span>
                    <span className="text-xl font-bold text-gray-800">฿{totalPrice}</span>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-600 font-medium">รับเงินมา (บาท)</span>
                    <input 
                      type="number"
                      value={amountReceived}
                      onChange={(e) => setAmountReceived(e.target.value)}
                      className="w-28 p-2 text-right border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold text-lg text-blue-600"
                      placeholder="0"
                      autoFocus
                    />
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <span className="text-gray-600 font-medium">เงินทอน</span>
                    <span className={`font-bold text-xl ${changeAmount >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      ฿{changeAmount > 0 ? changeAmount : 0}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => { setIsConfirming(false); setAmountReceived(""); }} 
                    className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                  >
                    ยกเลิก
                  </button>
                  {/* 🌟 ปรับปรุงปุ่มยืนยัน: ถ้าเงินรับมาน้อยกว่ายอดรวม จะกดไม่ได้และเป็นสีเทา */}
                  <button 
                    onClick={confirmAndSaveOrder} 
                    disabled={!isEnoughCash}
                    className={`flex-1 py-3 rounded-xl font-bold shadow-md transition-colors ${
                      isEnoughCash 
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-70'
                    }`}
                  >
                    ✅ ยืนยันรับเงิน
                  </button>
                </div>
              </>
            )}

            {/* 🌟 โหมดที่ 2: ใบเสร็จรับเงิน */}
            {receiptData && (
              <div className="print:w-[80mm] print:mx-auto print:bg-white print:text-black">
                
                {/* ส่วนหัวใบเสร็จ */}
                <div className="text-center mb-6 print:mb-2">
                  <h2 className="text-2xl font-bold text-gray-800 print:text-lg print:text-black">ใบเสร็จรับเงิน</h2>
                  <p className="text-gray-500 text-sm mt-1 print:text-[10px] print:text-black">My POS Store Co., Ltd.</p>
                  <div className="text-sm text-gray-500 mt-4 flex justify-between print:text-[10px] print:mt-2 print:text-black">
                    <span>บิลเลขที่: #{receiptData.dailyNumber}</span>
                    <span>{receiptData.date}</span>
                  </div>
                </div>

                {/* ส่วนรายการสินค้า */}
                <div className="border-t-2 border-b-2 border-dashed border-gray-200 py-4 mb-4 space-y-3 print:py-2 print:mb-2 print:space-y-1 print:border-black">
                  {receiptData.items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between text-gray-700 text-sm print:text-[12px] print:text-black">
                      <span>{item.name} <span className="text-gray-400 print:text-gray-600">x{item.quantity}</span></span>
                      <span>฿{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* ส่วนสรุปยอดเงิน */}
                <div className="mb-8 print:mb-4">
                  <div className="flex justify-between items-center text-lg font-bold text-gray-800 mb-2 print:text-sm print:mb-1 print:text-black">
                    <span>ยอดรวมทั้งสิ้น</span>
                    <span>฿{receiptData.total}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-600 mb-1 print:text-[12px] print:text-black">
                    <span>รับเงินมา</span>
                    <span>฿{receiptData.received}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-600 print:text-[12px] print:text-black">
                    <span>เงินทอน</span>
                    <span>฿{receiptData.change}</span>
                  </div>
                </div>

                {/* 🌟 เพิ่มส่วนท้ายบิล (คำขอบคุณ) */}
                <div className="text-center text-sm text-gray-500 mb-6 print:text-[10px] print:text-black print:mb-0">
                  <p>ขอบคุณที่ใช้บริการครับ/ค่ะ</p>
                  <p className="mt-1">Please come again</p>
                </div>

                {/* ปุ่มกด (จะถูกซ่อนไว้ตอนกดปริ้นท์) */}
                <div className="space-y-3 print:hidden">
                  <button 
                    onClick={() => window.print()} 
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors flex justify-center items-center gap-2"
                  >
                    🖨️ พิมพ์ใบเสร็จ
                  </button>
                  
                  <button 
                    onClick={handleCloseReceiptAndFinish} 
                    className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                  >
                    เสร็จสิ้น / คิวต่อไป
                  </button>
                </div>
                
              </div>
            )}

          </div>
        </div>
      )}

    </main>
  );
}