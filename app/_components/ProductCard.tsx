"use client";

export default function ProductCard({ product, onClick }: { product: any, onClick: () => void }) {
  const isAvailable = product.isAvailable ?? true;

  return (
    <div 
      onClick={isAvailable ? onClick : undefined} 
      className={`relative p-3 sm:p-4 rounded-xl flex flex-col transition-all border border-transparent 
        ${isAvailable 
          ? 'bg-white shadow-sm cursor-pointer active:scale-95 hover:ring-4 hover:ring-blue-500' 
          : 'bg-gray-100 opacity-75 grayscale cursor-not-allowed border-gray-200'
        }`}
    >
      <div className="relative">
        {/* 🌟 ลดความสูงรูปในจอเล็กเป็น h-24 และจอใหญ่เป็น h-32 */}
        <img src={product.image} alt={product.name} className="w-full h-24 sm:h-32 object-cover rounded-lg mb-3 sm:mb-4 bg-gray-200" />
        
        {!isAvailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[2px] rounded-lg">
            <span className="bg-red-600 text-white font-bold px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-xs sm:text-sm shadow-md border-2 border-white transform -rotate-12">
              หมดชั่วคราว
            </span>
          </div>
        )}
      </div>

      {/* 🌟 ปรับขนาดฟอนต์ให้สมส่วน */}
      <h3 className={`text-sm sm:text-md font-bold line-clamp-2 leading-tight flex-1 ${isAvailable ? 'text-gray-800' : 'text-gray-500'}`}>
        {product.name}
      </h3>
      
      <div className="flex justify-between items-end mt-2 pt-2 border-t border-gray-50">
        <p className={`${isAvailable ? 'text-blue-600' : 'text-gray-400'} font-extrabold text-base sm:text-lg`}>
          ฿{product.price}
        </p>
      </div>
    </div>
  );
}