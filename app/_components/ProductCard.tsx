"use client";

export default function ProductCard({ product, onClick }: { product: any, onClick: () => void }) {
  // ตรวจสอบสถานะว่าพร้อมขายหรือไม่ (ถ้าไม่มีค่าให้ถือว่าพร้อมขายเป็นค่าเริ่มต้น)
  const isAvailable = product.isAvailable ?? true;

  return (
    <div 
      onClick={isAvailable ? onClick : undefined} // 🌟 ถ้าสินค้าหมด จะไม่เรียก onClick
      className={`relative p-4 rounded-xl flex flex-col transition-all border border-transparent 
        ${isAvailable 
          ? 'bg-white shadow-sm cursor-pointer active:scale-95 hover:ring-4 hover:ring-blue-500' 
          : 'bg-gray-100 opacity-75 grayscale cursor-not-allowed border-gray-200' // 🌟 สีเทาและเมาส์กากบาทเมื่อสินค้าหมด
        }`}
    >
      <div className="relative">
        <img src={product.image} alt={product.name} className="w-full h-32 object-cover rounded-lg mb-4 bg-gray-200" />
        
        {/* 🌟 ป้ายทับรูปภาพเมื่อสินค้าหมด */}
        {!isAvailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[2px] rounded-lg">
            <span className="bg-red-600 text-white font-bold px-4 py-1.5 rounded-full text-sm shadow-md border-2 border-white transform -rotate-12">
              หมดชั่วคราว
            </span>
          </div>
        )}
      </div>

      <h3 className={`text-md font-bold line-clamp-2 leading-tight flex-1 ${isAvailable ? 'text-gray-800' : 'text-gray-500'}`}>
        {product.name}
      </h3>
      
      <div className="flex justify-between items-end mt-2 pt-2 border-t border-gray-50">
        <p className={`${isAvailable ? 'text-blue-600' : 'text-gray-400'} font-extrabold text-lg`}>
          ฿{product.price}
        </p>
      </div>
    </div>
  );
}