"use client";

export default function ProductCard({ product, onClick }: { product: any, onClick: () => void }) {
  return (
    <div onClick={onClick} className="bg-white p-4 rounded-xl shadow-sm cursor-pointer transition-all active:scale-95 hover:ring-4 hover:ring-blue-500 border border-transparent flex flex-col">
      <img src={product.image} alt={product.name} className="w-full h-32 object-cover rounded-lg mb-4 bg-gray-100" />
      <h3 className="text-md font-bold text-gray-800 line-clamp-2 leading-tight flex-1">{product.name}</h3>
      <div className="flex justify-between items-end mt-2 pt-2 border-t border-gray-50">
        <p className="text-blue-600 font-extrabold text-lg">฿{product.price}</p>
      </div>
    </div>
  );
}