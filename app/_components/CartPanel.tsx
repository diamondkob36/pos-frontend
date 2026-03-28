"use client";

export default function CartPanel({ cart, clearCart, removeFromCart, totalPrice, handleCheckoutClick }: { 
  cart: any[], clearCart: () => void, removeFromCart: (key: string) => void, totalPrice: number, handleCheckoutClick: () => void 
}) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm h-[calc(100vh-140px)] flex flex-col border border-gray-100">
      <div className="flex justify-between items-center mb-4 border-b pb-3">
        <h2 className="text-xl font-bold text-gray-800">🛒 ออเดอร์ปัจจุบัน</h2>
        {cart.length > 0 && <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-700 font-medium bg-red-50 px-3 py-1 rounded-lg">ล้างทั้งหมด</button>}
      </div>
      
      <div className="space-y-4 mb-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {cart.length === 0 ? <p className="text-gray-600 text-center py-10 font-medium">ยังไม่มีสินค้าในตะกร้า</p> : cart.map((item) => (
          <div key={item.cartKey} className="flex justify-between items-start border-b pb-4 border-gray-100 last:border-0 last:pb-0">
            <div className="flex-1 pr-3">
              <p className="font-bold text-gray-800">{item.name}</p>
              <div className="text-[11px] text-gray-700 mt-1 space-y-0.5">
                {item.size !== "-" && <p className="text-blue-600 font-medium">• {item.size}</p>}
                {item.toppings && <p>• ท็อปปิ้ง: {item.toppings}</p>}
                {item.note && <p className="text-orange-500 font-medium">หมายเหตุ: {item.note}</p>}
              </div>
              <p className="text-sm font-bold text-gray-600 mt-1">฿{item.price} x {item.quantity}</p>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <p className="font-extrabold text-gray-900 text-lg">฿{item.price * item.quantity}</p>
              <button onClick={() => removeFromCart(item.cartKey)} className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors">ลบ</button>
            </div>
          </div>
        ))}
      </div>

      {cart.length > 0 && (
        <div className="mt-auto pt-4 border-t-2 border-dashed border-gray-200 shrink-0">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-bold text-gray-600">ยอดรวมสุทธิ</span>
            <span className="text-4xl font-black text-blue-600 tracking-tight">฿{totalPrice.toLocaleString()}</span>
          </div>
          <button onClick={handleCheckoutClick} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-xl shadow-md hover:bg-blue-700 active:scale-95 transition-all">
            ชำระเงิน
          </button>
        </div>
      )}
    </div>
  );
}