"use client";

export default function ToppingModal({
  toppingModalOpen, setToppingModalOpen, currentCategoryToppings, selectedToppings,
  handleToppingClick, setAdjustToppingName, customToppingName, setCustomToppingName,
  customToppingPrice, setCustomToppingPrice, addCustomTopping, removeTopping,
  adjustToppingName, updateToppingQty, handleBackdropClick
}: any) {
  return (
    <>
      {/* หน้าต่างเลือกท็อปปิ้งหลัก */}
      {toppingModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[50] backdrop-blur-sm print:hidden" onClick={handleBackdropClick}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col h-[85vh] sm:h-auto sm:max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
            <div className="bg-blue-600 p-5 flex justify-between items-center text-white">
              <div>
                <h2 className="text-xl font-bold">✨ เลือกท็อปปิ้ง</h2>
                <p className="text-xs text-blue-100 font-medium mt-1">กดซ้ำที่รูปเพื่อเพิ่มจำนวน / กดที่ป้ายด้านล่างเพื่อแก้จำนวน</p>
              </div>
              <button onClick={() => setToppingModalOpen(false)} className="text-white/80 hover:text-white text-3xl font-bold leading-none">&times;</button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-gray-50 space-y-6">
              {currentCategoryToppings.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                  {currentCategoryToppings.map((t: any) => {
                    const selectedItem = selectedToppings.find((selected:any) => selected.name === t.name);
                    const qty = selectedItem ? selectedItem.qty : 0;
                    
                    return (
                      <button key={t.id} onClick={() => handleToppingClick(t)} className={`relative p-3 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all active:scale-95 ${qty > 0 ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-transparent bg-white shadow-sm hover:border-blue-300 hover:shadow-md'}`}>
                        {qty > 0 && <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-[11px] font-bold border-2 border-white shadow-sm z-10">x{qty}</div>}
                        {t.image ? <img src={t.image} className="w-14 h-14 object-cover rounded-full shadow-sm border border-gray-100 bg-white" alt={t.name} /> : <div className="w-14 h-14 bg-purple-100 text-purple-500 rounded-full flex items-center justify-center text-2xl font-bold shadow-sm">✨</div>}
                        <div className="text-center leading-tight mt-1 w-full">
                          <p className="text-xs font-bold text-gray-800 line-clamp-2 min-h-[2rem] flex items-center justify-center">{t.name}</p>
                          <p className="text-xs text-blue-600 font-extrabold mt-1">+{t.price}฿</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center text-gray-400 font-medium bg-white rounded-2xl border border-dashed border-gray-200">ไม่มีรายการท็อปปิ้งในหมวดหมู่นี้</div>
              )}

              {selectedToppings.length > 0 && (
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
                  <p className="text-sm font-bold text-gray-700 mb-3">ท็อปปิ้งที่เลือกไว้ (กดเพื่อปรับจำนวน)</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedToppings.map((t:any, idx:number) => (
                      <div key={idx} onClick={() => setAdjustToppingName(t.name)} className="bg-blue-50 border border-blue-200 text-blue-800 text-[12px] pl-3 pr-1 py-1.5 rounded-xl flex items-center gap-2 font-bold cursor-pointer hover:bg-blue-100 transition-colors active:scale-95">
                        <span>{t.name}</span>
                        <span className="bg-white text-blue-800 px-2 py-0.5 rounded-md text-xs border border-blue-200">x{t.qty}</span>
                        <button onClick={(e) => { e.stopPropagation(); removeTopping(t.name); }} className="font-black text-red-400 hover:text-red-600 text-base leading-none ml-1 bg-red-50 rounded-full w-6 h-6 flex items-center justify-center">&times;</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
                <p className="text-sm font-bold text-gray-800 mb-3">ไม่เจอท็อปปิ้งที่ต้องการ? (พิมพ์เพิ่มเอง)</p>
                <div className="flex gap-2">
                  <input type="text" placeholder="ชื่อท็อปปิ้ง..." value={customToppingName} onChange={e => setCustomToppingName(e.target.value)} className="flex-1 p-2 border rounded-xl text-sm font-medium text-gray-900 bg-gray-50 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                  <input type="number" placeholder="ราคา" value={customToppingPrice} onChange={e => setCustomToppingPrice(e.target.value)} className="w-20 p-2 border rounded-xl text-sm font-medium text-gray-900 bg-gray-50 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-center" />
                  <button onClick={addCustomTopping} className="bg-gray-800 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-gray-900 transition-colors shadow-sm">เพิ่ม</button>
                </div>
              </div>
            </div>

            <div className="p-5 border-t bg-white">
              <button onClick={() => setToppingModalOpen(false)} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-blue-700 active:scale-95 transition-all shadow-lg text-lg">
                ยืนยันการเลือก ({selectedToppings.reduce((sum:any, t:any) => sum + t.qty, 0)} รายการ)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* หน้าต่างแก้ไขจำนวนท็อปปิ้ง (+/-) */}
      {adjustToppingName && selectedToppings.find((t:any) => t.name === adjustToppingName) && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[80] backdrop-blur-sm print:hidden" onClick={() => setAdjustToppingName(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-[90%] max-w-xs overflow-hidden flex flex-col p-6" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-black text-gray-900">{selectedToppings.find((t:any) => t.name === adjustToppingName)?.name}</h2>
              <p className="text-gray-500 font-medium mt-1">ปรับจำนวนท็อปปิ้ง</p>
            </div>

            <div className="flex items-center justify-center gap-5 mb-8">
              <button onClick={() => updateToppingQty(adjustToppingName, -1)} disabled={selectedToppings.find((t:any) => t.name === adjustToppingName)!.qty <= 1} className="w-16 h-16 rounded-2xl bg-gray-100 text-gray-600 flex items-center justify-center text-4xl font-bold active:scale-90 transition-all disabled:opacity-40 disabled:active:scale-100 shadow-inner">-</button>
              <div className="w-20 text-center text-5xl font-black text-blue-600">{selectedToppings.find((t:any) => t.name === adjustToppingName)?.qty}</div>
              <button onClick={() => updateToppingQty(adjustToppingName, 1)} className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-4xl font-bold active:scale-90 transition-all shadow-sm">+</button>
            </div>

            <div className="bg-blue-50 p-4 rounded-2xl mb-6 text-center border border-blue-100">
              <p className="text-sm font-bold text-gray-500">ราคารวมท็อปปิ้งนี้</p>
              <p className="text-2xl font-black text-blue-700">
                +฿{(selectedToppings.find((t:any) => t.name === adjustToppingName)!.price * selectedToppings.find((t:any) => t.name === adjustToppingName)!.qty).toLocaleString()}
              </p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => { removeTopping(adjustToppingName); setAdjustToppingName(null); }} className="flex-1 bg-red-50 text-red-600 py-3.5 rounded-xl font-bold text-lg hover:bg-red-100 transition-colors">ลบทิ้ง</button>
              <button onClick={() => setAdjustToppingName(null)} className="flex-[2] bg-blue-600 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-blue-700 shadow-md active:scale-95 transition-all">ตกลง</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}