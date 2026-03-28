"use client";

export default function ProductOptionModal({
  isOpen, selectedProduct, activeCatObj, selectedType, selectedSize,
  selectedToppings, note, setNote, setIsOpen, handleTypeChange, setSelectedSize,
  setToppingModalOpen, removeTopping, setAdjustToppingName, confirmAddToCart, handleBackdropClick,
  DEFAULT_TYPES, NORMAL_SIZES, HOT_SIZES
}: any) {
  if (!isOpen || !selectedProduct) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-40 backdrop-blur-sm print:hidden" onClick={handleBackdropClick}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gray-50 p-5 border-b flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{selectedProduct.name}</h2>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-md font-bold mt-1 inline-block">หมวดหมู่: {activeCatObj?.label || "ไม่ได้ระบุ"}</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-800 text-3xl font-bold transition-colors">&times;</button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeCatObj?.hasType && (
            <div>
              <h3 className="font-bold text-gray-800 mb-3 flex justify-between"><span>ประเภทเมนู</span><span className="text-xs text-gray-400 font-medium">เลือก 1 อย่าง</span></h3>
              <div className="grid grid-cols-3 gap-3">
                {DEFAULT_TYPES.map((type: any) => (
                  <button key={type.name} onClick={() => handleTypeChange(type)} className={`py-3 px-2 rounded-xl text-sm font-bold border-2 transition-all ${selectedType?.name === type.name ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    {type.name} <br/><span className="text-xs font-medium">฿{selectedProduct.price + type.price}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeCatObj?.hasSize && (
            <div>
              <h3 className="font-bold text-gray-800 mb-3 flex justify-between"><span>ขนาด/ไซส์</span><span className="text-xs text-gray-400 font-medium">เลือก 1 อย่าง</span></h3>
              <div className={`grid gap-3 ${selectedType?.name === "ร้อน" ? "grid-cols-2" : "grid-cols-3"}`}>
                {(selectedType?.name === "ร้อน" ? HOT_SIZES : NORMAL_SIZES).map((size: any) => (
                  <button key={size.name} onClick={() => setSelectedSize(size)} className={`py-3 px-2 rounded-xl text-sm font-bold border-2 transition-all ${selectedSize?.name === size.name ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    {size.name} <br/><span className="text-xs font-medium">{size.price > 0 ? `+฿${size.price}` : size.price < 0 ? `-฿${Math.abs(size.price)}` : 'ฟรี'}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="font-bold text-gray-800 mb-3 flex justify-between">
              <span>ท็อปปิ้งเพิ่มเติม</span>
              <span className="text-xs text-blue-700 font-bold bg-blue-100 px-2 py-0.5 rounded-md">เลือกแล้ว {selectedToppings.reduce((sum:any, t:any) => sum + t.qty, 0)} อย่าง</span>
            </h3>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <button onClick={() => setToppingModalOpen(true)} className="w-full py-3.5 bg-white border-2 border-dashed border-blue-400 text-blue-600 font-bold rounded-xl hover:bg-blue-50 hover:border-blue-500 transition-colors flex items-center justify-center gap-2 shadow-sm">
                <span className="text-xl leading-none">+</span><span>กดเพื่อเลือกท็อปปิ้ง</span>
              </button>

              {selectedToppings.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-4 mt-3 border-t border-gray-200">
                  {selectedToppings.map((t:any, idx:number) => (
                    <div key={idx} onClick={() => setAdjustToppingName(t.name)} className="bg-white border border-blue-300 text-blue-800 text-[12px] pl-3 pr-1 py-1.5 rounded-xl flex items-center gap-2 shadow-sm font-bold cursor-pointer hover:bg-blue-50 transition-colors active:scale-95">
                      <span>{t.name}</span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md text-xs border border-blue-200">x{t.qty}</span>
                      <span className="text-gray-500 font-medium">(+฿{t.price * t.qty})</span>
                      <button onClick={(e) => { e.stopPropagation(); removeTopping(t.name); }} className="font-black text-red-400 hover:text-red-600 text-base leading-none ml-1 bg-red-50 rounded-full w-6 h-6 flex items-center justify-center">&times;</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-gray-800 mb-2">หมายเหตุ</h3>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="เช่น หวานน้อย 50%, ไม่รับหลอด" className="w-full border border-gray-300 rounded-xl p-4 text-sm font-medium text-gray-900 bg-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none resize-none shadow-sm" rows={2}></textarea>
          </div>
        </div>

        <div className="p-5 border-t bg-white">
          <button onClick={confirmAddToCart} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold flex justify-between items-center px-6 hover:bg-blue-700 active:scale-95 transition-all shadow-lg">
            <span className="text-lg">เพิ่มลงออเดอร์</span>
            <span className="bg-white/20 px-3 py-1 rounded-lg text-lg">฿{selectedProduct.price + (selectedType?.price || 0) + (selectedSize?.price || 0) + selectedToppings.reduce((sum:any, t:any) => sum + t.price * t.qty, 0)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}