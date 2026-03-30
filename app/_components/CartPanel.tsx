"use client";

export default function CartPanel({ cart, clearCart, removeFromCart, totalPrice, handleCheckoutClick }: { 
  cart: any[], clearCart: () => void, removeFromCart: (key: string) => void, totalPrice: number, handleCheckoutClick: () => void 
}) {
  return (
    // 🌟 1. ล็อกความสูงตะกร้าให้เต็มพื้นที่ของ flex-1 และกำหนดความกว้าง
    <aside className="w-full md:w-[350px] xl:w-[400px] bg-white rounded-2xl shadow-sm flex flex-col h-full shrink-0 border border-gray-100 overflow-hidden">
      
      {/* 🌟 2. ส่วนหัวตะกร้า (ห้ามบีบ) */}
      <div className="p-5 border-b border-gray-100 shrink-0 flex justify-between items-center bg-gray-50/50">
        <h2 className="text-xl font-black text-gray-800">🛒 ตะกร้าสินค้า</h2>
        {cart.length > 0 && <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-700 font-bold bg-red-50 px-3 py-1.5 rounded-lg transition-colors">ล้างทั้งหมด</button>}
      </div>
      
      {/* 🌟 3. ส่วนรายการที่เลือก (เลื่อนได้เฉพาะกล่องนี้) */}
      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-white">
        {cart.length === 0 ? <p className="text-gray-400 text-center py-10 font-medium">ยังไม่มีสินค้าในตะกร้า</p> : (
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.cartKey} className="flex justify-between items-start border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                <div className="flex-1 pr-3">
                  <p className="font-bold text-gray-800 leading-tight">{item.name}</p>
                  <div className="text-[12px] text-gray-500 mt-1.5 space-y-0.5">
                    {item.size !== "-" && <p className="text-blue-600 font-bold">• {item.size}</p>}
                    {item.toppings && <p>• ท็อปปิ้ง: {item.toppings}</p>}
                    {item.note && <p className="text-orange-500 font-bold">หมายเหตุ: {item.note}</p>}
                  </div>
                  <p className="text-sm font-black text-gray-800 mt-1.5">฿{item.price} <span className="text-gray-400 font-medium">x {item.quantity}</span></p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <p className="font-black text-blue-600 text-lg">฿{item.price * item.quantity}</p>
                  <button onClick={() => removeFromCart(item.cartKey)} className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-[11px] font-bold hover:bg-red-100 transition-colors uppercase tracking-wider">ลบ</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🌟 4. โซนสรุปยอดและปุ่มชำระเงิน (ถูกล็อกไว้ด้านล่างสุดเสมอ) */}
      <div className="p-5 border-t border-gray-100 bg-gray-50 shrink-0 mt-auto">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-bold text-gray-500">ยอดรวมสุทธิ</span>
          <span className="text-3xl font-black text-blue-600 tracking-tight">฿{totalPrice.toLocaleString()}</span>
        </div>
        <button 
          onClick={handleCheckoutClick} 
          disabled={cart.length === 0}
          className={`w-full py-4 rounded-xl font-bold text-xl transition-all shadow-sm ${
            cart.length > 0 
              ? "bg-blue-600 text-white hover:bg-blue-700 border-b-4 border-blue-800 active:border-b-0 active:translate-y-1" 
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          {cart.length > 0 ? '💰 ชำระเงิน' : 'เลือกสินค้าก่อน'}
        </button>
      </div>

    </aside>
  );
}