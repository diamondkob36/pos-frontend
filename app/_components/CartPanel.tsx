"use client";

export default function CartPanel({ cart, clearCart, removeFromCart, totalPrice, handleCheckoutClick }: { 
  cart: any[], clearCart: () => void, removeFromCart: (key: string) => void, totalPrice: number, handleCheckoutClick: () => void 
}) {
  return (
    // 🌟 ปรับความกว้าง (Width) ให้ Responsive: มือถือ 100%, แท็บแนวตั้ง 300px, แนวนอน 340px, จอคอม 380px
    <aside className="w-full md:w-[300px] lg:w-[340px] xl:w-[380px] bg-white rounded-2xl shadow-sm flex flex-col h-full shrink-0 border border-gray-100 overflow-hidden">
      
      <div className="p-4 sm:p-5 border-b border-gray-100 shrink-0 flex justify-between items-center bg-gray-50/50">
        <h2 className="text-lg sm:text-xl font-black text-gray-800">🛒 ตะกร้าสินค้า</h2>
        {cart.length > 0 && <button onClick={clearCart} className="text-xs sm:text-sm text-red-500 hover:text-red-700 font-bold bg-red-50 px-3 py-1.5 rounded-lg transition-colors">ล้างทั้งหมด</button>}
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 custom-scrollbar bg-white">
        {cart.length === 0 ? <p className="text-gray-400 text-center py-10 text-sm sm:text-base font-medium">ยังไม่มีสินค้าในตะกร้า</p> : (
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.cartKey} className="flex justify-between items-start border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                <div className="flex-1 pr-2 sm:pr-3">
                  <p className="font-bold text-gray-800 leading-tight text-sm sm:text-base">{item.name}</p>
                  <div className="text-[11px] sm:text-[12px] text-gray-500 mt-1.5 space-y-0.5">
                    {item.size !== "-" && <p className="text-blue-600 font-bold">• {item.size}</p>}
                    {item.toppings && <p className="line-clamp-2">• ท็อปปิ้ง: {item.toppings}</p>}
                    {item.note && <p className="text-orange-500 font-bold line-clamp-1">หมายเหตุ: {item.note}</p>}
                  </div>
                  <p className="text-xs sm:text-sm font-black text-gray-800 mt-1.5">฿{item.price} <span className="text-gray-400 font-medium">x {item.quantity}</span></p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <p className="font-black text-blue-600 text-base sm:text-lg">฿{item.price * item.quantity}</p>
                  <button onClick={() => removeFromCart(item.cartKey)} className="bg-red-50 text-red-600 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-[11px] font-bold hover:bg-red-100 transition-colors uppercase tracking-wider">ลบ</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 sm:p-5 border-t border-gray-100 bg-gray-50 shrink-0 mt-auto">
        <div className="flex justify-between items-center mb-4">
          <span className="text-base sm:text-lg font-bold text-gray-500">ยอดรวมสุทธิ</span>
          <span className="text-2xl sm:text-3xl font-black text-blue-600 tracking-tight">฿{totalPrice.toLocaleString()}</span>
        </div>
        <button 
          onClick={handleCheckoutClick} 
          disabled={cart.length === 0}
          className={`w-full py-3 sm:py-4 rounded-xl font-bold text-lg sm:text-xl transition-all shadow-sm ${
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