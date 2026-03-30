"use client";

export default function ToppingModal({
  toppingModalOpen, setToppingModalOpen, currentCategoryToppings, selectedToppings,
  handleToppingClick, setAdjustToppingName, customToppingName, setCustomToppingName,
  customToppingPrice, setCustomToppingPrice, addCustomTopping, removeTopping,
  adjustToppingName, updateToppingQty, handleBackdropClick
}: any) {
  return (
    <>
      {toppingModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[50] backdrop-blur-sm print:hidden p-4" onClick={handleBackdropClick}>
          {/* 🌟 ขยายกล่องเป็น max-w-xl สำหรับแท็บเล็ต */}
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col h-[85vh] sm:h-auto sm:max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="bg-blue-600 p-4 sm:p-5 flex justify-between items-center text-white shrink-0">
              <div>
                <h2 className="text-lg sm:text-xl font-bold">✨ เลือกท็อปปิ้ง</h2>
                <p className="text-[10px] sm:text-xs text-blue-100 font-medium mt-0.5 sm:mt-1">กดซ้ำที่รูปเพื่อเพิ่มจำนวน / กดที่ป้ายด้านล่างเพื่อแก้จำนวน</p>
              </div>
              <button onClick={() => setToppingModalOpen(false)} className="text-white/80 hover:text-white text-2xl sm:text-3xl font-bold leading-none shrink-0 ml-2">&times;</button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-gray-50 space-y-4 sm:space-y-6 custom-scrollbar">
              {currentCategoryToppings.length > 0 ? (
                // 🌟 ปรับคอลัมน์ให้อิงตามขนาดจอ (มือถือ 3 -> แท็บ 4 -> จอใหญ่ 5)
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-4">
                  {currentCategoryToppings.map((t: any) => {
                    const selectedItem = selectedToppings.find((selected:any) => selected.name === t.name);
                    const qty = selectedItem ? selectedItem.qty : 0;
                    const isAvailable = t.isAvailable ?? true;
                    
                    return (
                      <button 
                        key={t.id} 
                        onClick={isAvailable ? () => handleToppingClick(t) : undefined} 
                        disabled={!isAvailable} 
                        className={`relative p-2 sm:p-3 rounded-2xl border-2 flex flex-col items-center gap-1 sm:gap-2 transition-all 
                          ${!isAvailable ? 'opacity-70 grayscale cursor-not-allowed bg-gray-100 border-gray-200' 
                          : qty > 0 ? 'border-blue-500 bg-blue-50 shadow-md active:scale-95' 
                          : 'border-transparent bg-white shadow-sm hover:border-blue-300 hover:shadow-md active:scale-95'}`}
                      >
                        {qty > 0 && isAvailable && <div className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-blue-500 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-[10px] sm:text-[11px] font-bold border-2 border-white shadow-sm z-10">x{qty}</div>}
                        
                        <div className="relative">
                          {/* 🌟 ปรับขนาดรูปให้เล็กลงนิดหน่อยในจอมือถือ */}
                          {t.image ? <img src={t.image} className="w-10 h-10 sm:w-14 sm:h-14 object-cover rounded-full shadow-sm border border-gray-100 bg-white" alt={t.name} /> : <div className="w-10 h-10 sm:w-14 sm:h-14 bg-purple-100 text-purple-500 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold shadow-sm">✨</div>}
                          
                          {!isAvailable && (
                            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] rounded-full flex items-center justify-center border border-red-100">
                              <span className="bg-red-600 text-white text-[8px] sm:text-[10px] font-bold px-1 py-0.5 sm:px-1.5 rounded-md -rotate-[15deg] shadow-sm border border-white">หมด</span>
                            </div>
                          )}
                        </div>

                        <div className="text-center leading-tight mt-1 w-full">
                          <p className={`text-[10px] sm:text-xs font-bold line-clamp-2 min-h-[1.75rem] sm:min-h-[2rem] flex items-center justify-center ${isAvailable ? 'text-gray-800' : 'text-gray-500'}`}>{t.name}</p>
                          <p className={`text-[10px] sm:text-xs font-extrabold mt-0.5 sm:mt-1 ${isAvailable ? 'text-blue-600' : 'text-gray-400'}`}>+{t.price}฿</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="py-10 sm:py-12 text-center text-gray-400 font-medium bg-white rounded-2xl border border-dashed border-gray-200 text-sm sm:text-base">ไม่มีรายการท็อปปิ้งในหมวดหมู่นี้</div>
              )}

              {selectedToppings.length > 0 && (
                <div className="bg-white p-3 sm:p-4 rounded-2xl shadow-sm border border-gray-200">
                  <p className="text-xs sm:text-sm font-bold text-gray-700 mb-2 sm:mb-3">ท็อปปิ้งที่เลือกไว้ (กดเพื่อปรับจำนวน)</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedToppings.map((t:any, idx:number) => (
                      <div key={idx} onClick={() => setAdjustToppingName(t.name)} className="bg-blue-50 border border-blue-200 text-blue-800 text-[11px] sm:text-[12px] pl-2 sm:pl-3 pr-1 py-1 sm:py-1.5 rounded-xl flex items-center gap-1.5 sm:gap-2 font-bold cursor-pointer hover:bg-blue-100 transition-colors active:scale-95">
                        <span>{t.name}</span>
                        <span className="bg-white text-blue-800 px-1.5 sm:px-2 py-0.5 rounded-md text-[10px] sm:text-xs border border-blue-200">x{t.qty}</span>
                        <button onClick={(e) => { e.stopPropagation(); removeTopping(t.name); }} className="font-black text-red-400 hover:text-red-600 text-sm sm:text-base leading-none ml-0.5 sm:ml-1 bg-red-50 rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center">&times;</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-200">
                <p className="text-xs sm:text-sm font-bold text-gray-800 mb-2 sm:mb-3">ไม่เจอท็อปปิ้งที่ต้องการ? (พิมพ์เพิ่มเอง)</p>
                <div className="flex gap-2">
                  <input type="text" placeholder="ชื่อท็อปปิ้ง..." value={customToppingName} onChange={e => setCustomToppingName(e.target.value)} className="flex-1 p-2 border rounded-xl text-xs sm:text-sm font-medium text-gray-900 bg-gray-50 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                  <input type="number" placeholder="ราคา" value={customToppingPrice} onChange={e => setCustomToppingPrice(e.target.value)} className="w-16 sm:w-20 p-2 border rounded-xl text-xs sm:text-sm font-medium text-gray-900 bg-gray-50 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-center" />
                  <button onClick={addCustomTopping} className="bg-gray-800 text-white px-3 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold hover:bg-gray-900 transition-colors shadow-sm whitespace-nowrap">เพิ่ม</button>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-5 border-t bg-white shrink-0">
              <button onClick={() => setToppingModalOpen(false)} className="w-full bg-blue-600 text-white py-3.5 sm:py-4 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-blue-700 active:scale-95 transition-all shadow-lg text-base sm:text-lg">
                ยืนยันการเลือก ({selectedToppings.reduce((sum:any, t:any) => sum + t.qty, 0)} รายการ)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* หน้าต่างแก้ไขจำนวนท็อปปิ้ง (+/-) */}
      {adjustToppingName && selectedToppings.find((t:any) => t.name === adjustToppingName) && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[80] backdrop-blur-sm print:hidden p-4" onClick={() => setAdjustToppingName(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xs overflow-hidden flex flex-col p-5 sm:p-6" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-5 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">{selectedToppings.find((t:any) => t.name === adjustToppingName)?.name}</h2>
              <p className="text-gray-500 text-xs sm:text-sm font-medium mt-1">ปรับจำนวนท็อปปิ้ง</p>
            </div>

            <div className="flex items-center justify-center gap-4 sm:gap-5 mb-6 sm:mb-8">
              <button onClick={() => updateToppingQty(adjustToppingName, -1)} disabled={selectedToppings.find((t:any) => t.name === adjustToppingName)!.qty <= 1} className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gray-100 text-gray-600 flex items-center justify-center text-3xl sm:text-4xl font-bold active:scale-90 transition-all disabled:opacity-40 disabled:active:scale-100 shadow-inner">-</button>
              <div className="w-16 sm:w-20 text-center text-4xl sm:text-5xl font-black text-blue-600">{selectedToppings.find((t:any) => t.name === adjustToppingName)?.qty}</div>
              <button onClick={() => updateToppingQty(adjustToppingName, 1)} className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-3xl sm:text-4xl font-bold active:scale-90 transition-all shadow-sm">+</button>
            </div>

            <div className="bg-blue-50 p-3 sm:p-4 rounded-2xl mb-5 sm:mb-6 text-center border border-blue-100">
              <p className="text-xs sm:text-sm font-bold text-gray-500">ราคารวมท็อปปิ้งนี้</p>
              <p className="text-xl sm:text-2xl font-black text-blue-700 mt-1">
                +฿{(selectedToppings.find((t:any) => t.name === adjustToppingName)!.price * selectedToppings.find((t:any) => t.name === adjustToppingName)!.qty).toLocaleString()}
              </p>
            </div>

            <div className="flex gap-2 sm:gap-3">
              <button onClick={() => { removeTopping(adjustToppingName); setAdjustToppingName(null); }} className="flex-1 bg-red-50 text-red-600 py-3 sm:py-3.5 rounded-xl font-bold text-sm sm:text-lg hover:bg-red-100 transition-colors">ลบทิ้ง</button>
              <button onClick={() => setAdjustToppingName(null)} className="flex-[2] bg-blue-600 text-white py-3 sm:py-3.5 rounded-xl font-bold text-sm sm:text-lg hover:bg-blue-700 shadow-md active:scale-95 transition-all">ตกลง</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}