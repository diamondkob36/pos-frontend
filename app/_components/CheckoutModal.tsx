"use client";

export default function CheckoutModal({
  isConfirming, receiptData, cart, totalPrice, amountReceived, setAmountReceived,
  changeAmount, isEnoughCash, setIsConfirming, confirmAndSaveOrder, setReceiptData, clearCart, handleBackdropClick
}: any) {
  if (!isConfirming && !receiptData) return null;

  return (
    <div className="fixed inset-0 bg-white/60 flex items-center justify-center z-[90] backdrop-blur-md print:static print:bg-white print:block p-4" onClick={handleBackdropClick}>
      {/* 🌟 ขยาย max-w ให้เหมาะกับจอแท็บเล็ต */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-2xl w-full max-w-sm sm:max-w-md border border-gray-100 print:max-w-full print:shadow-none print:p-0 print:m-0 max-h-[95vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        
        {isConfirming && (
          <>
            <div className="text-center mb-4 sm:mb-6 shrink-0"><h2 className="text-xl sm:text-2xl font-black text-gray-800">สรุปยอดชำระเงิน</h2></div>
            
            {/* 🌟 ปรับความสูงรายการบิลให้ขึ้นอยู่กับขนาดหน้าจอจริง (30vh) เพื่อไม่ให้ล้นในแนวนอน */}
            <div className="border-t-2 border-b-2 border-dashed border-gray-200 py-3 sm:py-4 mb-4 space-y-3 max-h-[30vh] overflow-y-auto pr-2 custom-scrollbar shrink-0">
              {cart.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-start text-gray-700 text-xs sm:text-sm">
                  <div className="flex-1 pr-2">
                    <span className="font-bold">{item.name} <span className="text-gray-400 font-normal">x{item.quantity}</span></span>
                    <div className="text-[10px] sm:text-[11px] text-gray-500 mt-0.5">{item.size !== "-" && <span>[{item.size}] </span>}{item.toppings && <span>(+{item.toppings}) </span>}</div>
                  </div>
                  <span className="font-bold text-gray-900">฿{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 p-4 sm:p-5 rounded-2xl mb-5 sm:mb-6 border border-gray-100 shrink-0">
              <div className="flex justify-between items-center mb-3"><span className="text-sm sm:text-base text-gray-600 font-bold">ยอดที่ต้องชำระ</span><span className="text-lg sm:text-xl font-black text-gray-900">฿{totalPrice.toLocaleString()}</span></div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm sm:text-base text-gray-600 font-bold">รับเงินมา (บาท)</span>
                <input type="number" value={amountReceived} onChange={(e) => setAmountReceived(e.target.value)} className="w-24 sm:w-28 p-2 text-right border-2 border-gray-300 rounded-xl bg-white text-blue-700 font-black text-base sm:text-lg placeholder-gray-300 focus:border-blue-500 focus:outline-none" placeholder="0" autoFocus />
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <span className="text-sm sm:text-base text-gray-600 font-bold">เงินทอน</span>
                <span className={`font-black text-lg sm:text-xl ${changeAmount >= 0 ? 'text-green-600' : 'text-red-500'}`}>฿{changeAmount > 0 ? changeAmount.toLocaleString() : 0}</span>
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3 shrink-0">
              <button onClick={() => { setIsConfirming(false); setAmountReceived(""); }} className="flex-1 bg-gray-100 text-gray-600 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base font-bold hover:bg-gray-200 transition-colors">ยกเลิก</button>
              <button onClick={confirmAndSaveOrder} disabled={!isEnoughCash} className={`flex-1 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base font-bold shadow-md transition-all ${isEnoughCash ? 'bg-green-600 text-white hover:bg-green-700 active:scale-95' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>✅ ยืนยันรับเงิน</button>
            </div>
          </>
        )}

        {/* ส่วนใบเสร็จเมื่อชำระเสร็จ (Responsive สำหรับแสดงผล และ Print) */}
        {receiptData && (
          <div className="print:w-[80mm] print:mx-auto print:bg-white print:text-black flex flex-col h-full overflow-hidden">
            <div className="text-center mb-4 sm:mb-6 print:mb-2 shrink-0">
              <h2 className="text-xl sm:text-2xl font-black text-gray-800 print:text-lg print:text-black">ใบเสร็จรับเงิน</h2>
              <p className="text-gray-500 text-xs sm:text-sm mt-1 print:text-[10px] print:text-black font-medium">My POS Store Co., Ltd.</p>
              <div className="text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4 flex justify-between print:text-[10px] print:mt-2 print:text-black"><span>บิล: #{receiptData.dailyNumber}</span><span>{receiptData.date}</span></div>
            </div>

            <div className="border-t-2 border-b-2 border-dashed border-gray-200 py-3 sm:py-4 mb-4 space-y-2 sm:space-y-3 print:py-2 print:mb-2 print:space-y-2 print:border-black overflow-y-auto max-h-[30vh] custom-scrollbar">
              {receiptData.items.map((item: any, index: number) => (
                <div key={index} className="flex justify-between text-gray-700 text-xs sm:text-sm print:text-[12px] print:text-black">
                  <div className="flex-1 pr-2">
                    <span className="font-bold">{item.name} <span className="text-gray-400 font-normal print:text-gray-600">x{item.quantity}</span></span>
                    <div className="text-[10px] text-gray-500 print:text-[10px] print:text-black">{item.size !== "-" && <span>[{item.size}] </span>}{item.toppings && <span>+{item.toppings} </span>}{item.note && <span>({item.note})</span>}</div>
                  </div>
                  <span className="font-bold">฿{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="mb-6 sm:mb-8 print:mb-4 shrink-0">
              <div className="flex justify-between items-center text-base sm:text-lg font-black text-gray-800 mb-2 print:text-sm print:mb-1 print:text-black"><span>ยอดรวมทั้งสิ้น</span><span>฿{receiptData.total.toLocaleString()}</span></div>
              <div className="flex justify-between items-center text-xs sm:text-sm font-medium text-gray-600 mb-1 print:text-[12px] print:text-black"><span>รับเงินมา</span><span>฿{receiptData.received.toLocaleString()}</span></div>
              <div className="flex justify-between items-center text-xs sm:text-sm font-medium text-gray-600 print:text-[12px] print:text-black"><span>เงินทอน</span><span>฿{receiptData.change.toLocaleString()}</span></div>
            </div>

            <div className="text-center text-xs sm:text-sm text-gray-500 mb-5 sm:mb-6 print:text-[10px] print:text-black print:mb-0 font-medium shrink-0">
              <p>ขอบคุณที่ใช้บริการครับ/ค่ะ</p><p className="mt-0.5 sm:mt-1">Please come again</p>
            </div>

            <div className="space-y-2 sm:space-y-3 print:hidden shrink-0 mt-auto">
              <button onClick={() => window.print()} className="w-full bg-blue-600 text-white py-3 sm:py-3.5 rounded-xl font-bold text-sm sm:text-base hover:bg-blue-700 flex justify-center items-center gap-2 shadow-md">🖨️ พิมพ์ใบเสร็จ</button>
              <button onClick={() => {setReceiptData(null); setAmountReceived(""); clearCart()}} className="w-full bg-gray-100 text-gray-700 py-3 sm:py-3.5 rounded-xl font-bold text-sm sm:text-base hover:bg-gray-200 transition-colors">เสร็จสิ้น / คิวต่อไป</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}