"use client";

export default function OrderList({ filteredOrders, timeFilter, formatDate }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full min-h-0">
      <h2 className="text-lg font-bold text-gray-700 mb-4 shrink-0">
        📝 ประวัติบิล ({timeFilter === 'all' ? 'ทั้งหมด' : `${timeFilter} วันล่าสุด`})
      </h2>
      
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        {filteredOrders.length === 0 ? (
          <div className="text-center text-gray-400 py-10">ไม่มีบิลในช่วงเวลานี้</div>
        ) : (
          filteredOrders.map((order: any) => {
            const orderTotal = order.items.reduce((sum: number, item: any) => sum + ((item.price || item.product.price) * item.quantity), 0);
            return (
              <div key={order.id} className="border border-gray-100 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all bg-gray-50 shrink-0">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-bold text-gray-700 bg-white px-2 py-1 rounded text-xs border mr-2">
                      #{order.dailyNumber || order.id || "?"}
                    </span>
                    <span className="text-xs text-gray-500">{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="font-bold text-blue-600">฿{orderTotal.toLocaleString()}</div>
                </div>
                <div className="space-y-2 mt-3">
                  {order.items?.map((item: any, index: number) => {
                    const pName = item.product?.name || "สินค้าไม่ทราบชื่อ";
                    const pPrice = item.price || item.product?.price || 0; 
                    const pQty = item.quantity || 1;
                    
                    return (
                      <div key={index} className="flex justify-between text-gray-700 text-xs items-start border-t border-gray-100 pt-2 first:border-0 first:pt-0">
                        <div className="flex-1 pr-4">
                          <span className="font-bold">{pName} <span className="text-gray-400 font-normal ml-1">x{pQty}</span></span>
                          <div className="text-[10px] text-gray-500 mt-0.5 space-y-0.5">
                            {item.size && <p>• {item.size}</p>}
                            
                            {/* 🌟 เปลี่ยน @ เป็น ฿ สำหรับบิลเก่าที่เคยสั่งไปแล้ว */}
                            {item.toppings && <p>• ท็อปปิ้ง: {item.toppings.replace(/@/g, '฿')}</p>}
                            
                            {item.note && <p className="text-orange-500">หมายเหตุ: {item.note}</p>}
                          </div>
                        </div>
                        <span className="font-bold text-gray-800">฿{pPrice * pQty}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}