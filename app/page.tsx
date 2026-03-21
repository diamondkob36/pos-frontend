"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// 🌟 กฎพื้นฐาน (Structure) ของแต่ละหมวดหมู่
const MENU_CONFIG: Record<string, any> = {
  beverage: {
    label: "เครื่องดื่ม",
    hasType: true, 
    types: [
      { name: "ร้อน", price: -5 },
      { name: "เย็น", price: 0 },
      { name: "ปั่น", price: 10 },
    ],
    hasSize: true,
    sizes: {
      normal: [
        { name: "S", price: -5 },
        { name: "M", price: 0 },
        { name: "L", price: 5 },
      ],
      hot: [
        { name: "ร้อน 8oz", price: 0 },
        { name: "ร้อน 12oz", price: 10 },
      ]
    }
  },
  dessert: {
    label: "ขนมหวาน",
    hasType: false,
    types: [], 
    hasSize: true, 
    sizes: {
      normal: [
        { name: "ขนาดปกติ", price: 0 },
        { name: "ชิ้นใหญ่พิเศษ", price: 20 },
      ],
      hot: [] 
    }
  }
};

export default function Home() {
  const [cart, setCart] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [dbToppings, setDbToppings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State Checkout
  const [isConfirming, setIsConfirming] = useState(false);
  const [receiptData, setReceiptData] = useState<any | null>(null);
  const [amountReceived, setAmountReceived] = useState<string>("");

  // State Modal หลัก
  const [optionModalOpen, setOptionModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [activeCategory, setActiveCategory] = useState<string>("beverage");
  
  const [selectedType, setSelectedType] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState<any>(null);
  const [selectedToppings, setSelectedToppings] = useState<{name: string, price: number}[]>([]);
  
  const [note, setNote] = useState("");
  const [customToppingName, setCustomToppingName] = useState("");
  const [customToppingPrice, setCustomToppingPrice] = useState("");

  // 🌟 State ใหม่: สำหรับ Popup เลือกท็อปปิ้งโดยเฉพาะ
  const [toppingModalOpen, setToppingModalOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:3001/products").then(res => res.json()),
      fetch("http://localhost:3001/toppings").then(res => res.json())
    ]).then(([productsData, toppingsData]) => {
      setProducts(productsData);
      setDbToppings(toppingsData);
      setIsLoading(false);
    }).catch(console.error);
  }, []);

  const openOptionModal = (product: any) => {
    setSelectedProduct(product);
    const category = product.category || "beverage";
    setActiveCategory(category);
    const config = MENU_CONFIG[category];

    if (config.hasType) {
      setSelectedType(config.types.find((t: any) => t.name === "เย็น")); 
    } else {
      setSelectedType(null);
    }

    if (config.hasSize) {
      setSelectedSize(config.sizes.normal.find((s: any) => s.price === 0) || config.sizes.normal[0]);
    } else {
      setSelectedSize(null);
    }

    setSelectedToppings([]);
    setNote("");
    setCustomToppingName("");
    setCustomToppingPrice("");
    setOptionModalOpen(true);
  };

  const handleTypeChange = (type: any) => {
    setSelectedType(type);
    const config = MENU_CONFIG[activeCategory];
    if (type.name === "ร้อน") {
      setSelectedSize(config.sizes.hot[0]); 
    } else {
      setSelectedSize(config.sizes.normal.find((s: any) => s.price === 0) || config.sizes.normal[0]);
    }
  };

  const toggleTopping = (topping: {name: string, price: number}) => {
    const isExist = selectedToppings.find(t => t.name === topping.name);
    if (isExist) {
      setSelectedToppings(selectedToppings.filter(t => t.name !== topping.name));
    } else {
      setSelectedToppings([...selectedToppings, topping]);
    }
  };

  const addCustomTopping = () => {
    if (customToppingName && customToppingPrice) {
      setSelectedToppings([...selectedToppings, { name: customToppingName, price: Number(customToppingPrice) }]);
      setCustomToppingName(""); setCustomToppingPrice("");
    }
  };

  const confirmAddToCart = () => {
    const typePrice = selectedType ? selectedType.price : 0;
    const sizePrice = selectedSize ? selectedSize.price : 0;
    const toppingsPrice = selectedToppings.reduce((sum, t) => sum + t.price, 0);
    
    const finalPrice = selectedProduct.price + typePrice + sizePrice + toppingsPrice;
    const toppingsString = selectedToppings.map(t => t.name).join(", ");
    
    let combinedSizeText = "";
    if (selectedType) combinedSizeText += `${selectedType.name} `;
    if (selectedSize) combinedSizeText += `(${selectedSize.name})`;
    combinedSizeText = combinedSizeText.trim();

    const cartKey = `${selectedProduct.id}-${combinedSizeText}-${toppingsString}-${note}`;

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.cartKey === cartKey);
      if (existingItem) {
        return prevCart.map((item) => item.cartKey === cartKey ? { ...item, quantity: item.quantity + 1 } : item);
      } else {
        return [...prevCart, { 
          cartKey, id: selectedProduct.id, name: selectedProduct.name,
          basePrice: selectedProduct.price, price: finalPrice, 
          size: combinedSizeText || "-", toppings: toppingsString, note, quantity: 1
        }];
      }
    });
    setOptionModalOpen(false); 
  };

  const removeFromCart = (cartKey: string) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.cartKey === cartKey);
      if (existingItem?.quantity === 1) return prevCart.filter((item) => item.cartKey !== cartKey);
      return prevCart.map((item) => item.cartKey === cartKey ? { ...item, quantity: item.quantity - 1 } : item);
    });
  };

  const clearCart = () => setCart([]);
  const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const numericAmount = parseFloat(amountReceived) || 0;
  const changeAmount = numericAmount - totalPrice;
  const isEnoughCash = numericAmount >= totalPrice;

  const handleCheckoutClick = () => {
    if (cart.length === 0) return alert("ยังไม่มีสินค้าในตะกร้าครับ!");
    setAmountReceived(""); setIsConfirming(true);
  };

  const confirmAndSaveOrder = async () => {
    if (!isEnoughCash) return;
    const orderPayload = {
      items: cart.map((item) => ({
        productId: item.id, quantity: item.quantity, price: item.price, 
        size: item.size === "-" ? null : item.size, toppings: item.toppings || null, note: item.note || null,
      }))
    };

    try {
      const response = await fetch('http://localhost:3001/orders', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(orderPayload),
      });

      if (response.ok) {
        const savedOrder = await response.json();
        setReceiptData({
          id: savedOrder.id, dailyNumber: savedOrder.dailyNumber || savedOrder.id || "-", 
          date: new Date().toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }),
          items: [...cart], total: totalPrice, received: numericAmount, change: changeAmount
        });
        setIsConfirming(false);
      } else alert("เกิดข้อผิดพลาดในการบันทึกบิลครับ ❌");
    } catch (error) {
      alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์หลังบ้านได้ครับ");
    }
  };

  const currentCategoryToppings = dbToppings.filter(t => t.category === activeCategory);

  // การคลิกพื้นที่ว่างด้านนอกเพื่อปิด Modal
  const handleBackdropClick = () => {
    if (isConfirming) {
      setIsConfirming(false);
      setAmountReceived("");
    } else if (receiptData) {
      setReceiptData(null);
      setAmountReceived("");
      clearCart();
    } else if (toppingModalOpen) {
      setToppingModalOpen(false); // ถ้าเปิดหน้าต่างท็อปปิ้งอยู่ ให้ปิดแค่หน้าต่างท็อปปิ้ง
    } else if (optionModalOpen) {
      setOptionModalOpen(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8 print:bg-white print:p-0">
      <div className="print:hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-800">ระบบ POS - หน้าจอแคชเชียร์</h1>
          <div className="flex gap-3">
            <Link href="/history" className="bg-white text-blue-600 px-4 py-2 rounded-lg font-bold shadow-sm border border-blue-200 hover:bg-blue-50 transition-colors">📊 ประวัติยอดขาย</Link>
            <Link href="/admin" className="bg-gray-800 text-white px-4 py-2 rounded-lg font-bold shadow-sm hover:bg-gray-900 transition-colors">⚙️ จัดการหลังร้าน</Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-700 mb-4">เมนูสินค้า</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {isLoading ? (
                <div className="col-span-full flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
              ) : (
                products.map((product) => (
                  <div key={product.id} onClick={() => openOptionModal(product)} className="bg-white p-4 rounded-xl shadow-sm cursor-pointer transition-all active:scale-95 hover:ring-4 hover:ring-blue-500 border border-transparent">
                    <img src={product.image} alt={product.name} className="w-full h-32 object-cover rounded-lg mb-4" />
                    <h3 className="text-md font-semibold text-gray-700">{product.name}</h3>
                    <div className="flex justify-between items-end mt-1">
                      <p className="text-blue-600 font-bold">เริ่มต้น ฿{product.price}</p>
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{product.category === 'dessert' ? '🍰' : '🥤'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm min-h-[400px] flex flex-col">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="text-xl font-bold text-gray-800">ออเดอร์ปัจจุบัน</h2>
              {cart.length > 0 && <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-700 font-medium">ล้างตะกร้าทั้งหมด</button>}
            </div>
            <div className="space-y-4 mb-6 flex-1 overflow-y-auto pr-2">
              {cart.length === 0 ? <p className="text-gray-400 text-center py-4">ยังไม่มีสินค้าในตะกร้า</p> : cart.map((item) => (
                <div key={item.cartKey} className="flex justify-between items-start border-b pb-3 border-gray-100 last:border-0">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{item.name}</p>
                    <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                      {item.size !== "-" && <p>• {item.size}</p>}
                      {item.toppings && <p>• ท็อปปิ้ง: {item.toppings}</p>}
                      {item.note && <p className="text-orange-600 font-medium">หมายเหตุ: {item.note}</p>}
                    </div>
                    <p className="text-sm text-blue-600 font-medium mt-1">฿{item.price} x {item.quantity}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <p className="font-bold text-gray-800">฿{item.price * item.quantity}</p>
                    <button onClick={() => removeFromCart(item.cartKey)} className="bg-red-50 text-red-500 px-3 py-1 rounded-lg text-xs font-medium hover:bg-red-100">ลบออก</button>
                  </div>
                </div>
              ))}
            </div>
            {cart.length > 0 && (
              <div className="mt-auto pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center mb-6"><span className="text-lg font-bold text-gray-700">ยอดรวมสุทธิ</span><span className="text-3xl font-bold text-blue-600">฿{totalPrice}</span></div>
                <button onClick={handleCheckoutClick} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-md hover:bg-blue-800 active:scale-95 transition-all">ชำระเงิน</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* 🌟 1. Modal หลัก: เลือกประเภท/ไซส์/หมายเหตุ */}
      {/* ========================================== */}
      {optionModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 backdrop-blur-sm print:hidden" onClick={handleBackdropClick}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-gray-800">{selectedProduct.name}</h2>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">หมวดหมู่: {MENU_CONFIG[activeCategory]?.label || "เครื่องดื่ม"}</span>
              </div>
              <button onClick={() => setOptionModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">&times;</button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-6">
              {/* เลือกประเภท (ร้อน/เย็น/ปั่น) */}
              {MENU_CONFIG[activeCategory]?.hasType && (
                <div>
                  <h3 className="font-bold text-gray-700 mb-3 flex justify-between"><span>ประเภทเมนู</span><span className="text-xs text-gray-400 font-normal">เลือก 1 อย่าง</span></h3>
                  <div className="grid grid-cols-3 gap-2">
                    {MENU_CONFIG[activeCategory].types.map((type: any) => (
                      <button key={type.name} onClick={() => handleTypeChange(type)} className={`py-2 px-1 rounded-lg text-sm font-medium border-2 transition-all ${selectedType?.name === type.name ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'}`}>
                        {type.name} <br/><span className="text-xs font-normal">฿{selectedProduct.price + type.price}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* เลือกขนาดแก้ว/ชิ้น */}
              {MENU_CONFIG[activeCategory]?.hasSize && (
                <div>
                  <h3 className="font-bold text-gray-700 mb-3 flex justify-between"><span>ขนาด/ไซส์</span><span className="text-xs text-gray-400 font-normal">เลือก 1 อย่าง</span></h3>
                  <div className={`grid gap-2 ${selectedType?.name === "ร้อน" ? "grid-cols-2" : "grid-cols-3"}`}>
                    {(selectedType?.name === "ร้อน" ? MENU_CONFIG[activeCategory].sizes.hot : MENU_CONFIG[activeCategory].sizes.normal).map((size: any) => (
                      <button key={size.name} onClick={() => setSelectedSize(size)} className={`py-2 px-1 rounded-lg text-sm font-medium border-2 transition-all ${selectedSize?.name === size.name ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'}`}>
                        {size.name} <br/><span className="text-xs font-normal">{size.price > 0 ? `+฿${size.price}` : size.price < 0 ? `-฿${Math.abs(size.price)}` : 'ฟรี'}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 🌟 ปรับโซนท็อปปิ้งให้เป็นแค่ "ปุ่มเรียก Popup" และ "แสดงรายการที่เลือก" */}
              <div>
                <h3 className="font-bold text-gray-700 mb-3 flex justify-between">
                  <span>ท็อปปิ้งเพิ่มเติม</span>
                  <span className="text-xs text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-md">เลือกแล้ว {selectedToppings.length} อย่าง</span>
                </h3>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  {/* ปุ่มกดเปิด Popup ท็อปปิ้ง */}
                  <button 
                    onClick={() => setToppingModalOpen(true)}
                    className="w-full py-3 bg-white border-2 border-dashed border-blue-400 text-blue-600 font-bold rounded-xl hover:bg-blue-50 hover:border-blue-500 transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <span className="text-xl leading-none">+</span>
                    <span>กดเพื่อเพิ่ม / จัดการท็อปปิ้ง</span>
                  </button>

                  {/* แสดงป้ายท็อปปิ้งที่เลือกไว้แล้ว */}
                  {selectedToppings.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-4 mt-2 border-t border-gray-200">
                      {selectedToppings.map((t, idx) => (
                        <span key={idx} className="bg-white border border-blue-300 text-blue-700 text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm font-medium">
                          {t.name} (+฿{t.price})
                          <button onClick={() => toggleTopping(t)} className="font-bold text-red-500 hover:text-red-700 text-sm leading-none ml-1">&times;</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* หมายเหตุ */}
              <div>
                <h3 className="font-bold text-gray-700 mb-2">หมายเหตุ</h3>
                <textarea 
                  value={note} onChange={(e) => setNote(e.target.value)} 
                  placeholder="เช่น หวานน้อย 50%, ไม่รับหลอด" 
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm font-medium text-gray-900 bg-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none resize-none shadow-sm" 
                  rows={2}
                ></textarea>
              </div>
            </div>

            <div className="p-4 border-t bg-white">
              <button onClick={confirmAddToCart} className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold flex justify-between items-center px-5 hover:bg-blue-700 active:scale-95 transition-all shadow-md">
                <span className="text-lg">เพิ่มลงออเดอร์</span>
                <span className="bg-white/20 px-3 py-1 rounded-lg text-lg">฿{selectedProduct.price + (selectedType?.price || 0) + (selectedSize?.price || 0) + selectedToppings.reduce((sum, t) => sum + t.price, 0)}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 🌟 2. Modal ท็อปปิ้ง (เด้งซ้อนขึ้นมาเมื่อกดปุ่ม) */}
      {/* ========================================== */}
      {toppingModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm print:hidden" onClick={handleBackdropClick}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col h-[80vh] sm:h-auto sm:max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
            
            <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
              <div>
                <h2 className="text-lg font-bold">✨ เลือกท็อปปิ้ง</h2>
                <p className="text-xs text-blue-100 font-medium">เลือกได้หลายอย่างตามต้องการ</p>
              </div>
              <button onClick={() => setToppingModalOpen(false)} className="text-white/80 hover:text-white text-3xl font-bold leading-none">&times;</button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 bg-gray-50 space-y-6">
              
              {/* 🌟 Grid ท็อปปิ้งแบบเต็มจอ (เลื่อนแนวตั้ง) */}
              {currentCategoryToppings.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                  {currentCategoryToppings.map((t: any) => {
                    const isSelected = selectedToppings.some(selected => selected.name === t.name);
                    return (
                      <button
                        key={t.id}
                        onClick={() => toggleTopping(t)}
                        className={`relative p-3 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all active:scale-95 ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50 shadow-md' 
                            : 'border-transparent bg-white shadow-sm hover:border-blue-300 hover:shadow-md'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold border-2 border-white shadow-sm z-10">✓</div>
                        )}
                        
                        {t.image ? (
                          <img src={t.image} className="w-14 h-14 object-cover rounded-full shadow-sm border border-gray-100 bg-white" alt={t.name} />
                        ) : (
                          <div className="w-14 h-14 bg-purple-100 text-purple-400 rounded-full flex items-center justify-center text-2xl font-bold shadow-sm">✨</div>
                        )}
                        
                        <div className="text-center leading-tight mt-1 w-full">
                          <p className="text-xs font-bold text-gray-800 line-clamp-2 min-h-[2rem] flex items-center justify-center">{t.name}</p>
                          <p className="text-xs text-blue-600 font-bold mt-1">+{t.price}฿</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center text-gray-400 font-medium">
                  ไม่มีรายการท็อปปิ้งในระบบ
                </div>
              )}

              {/* 🌟 กล่องสำหรับเพิ่มท็อปปิ้งเอง */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <p className="text-sm font-bold text-gray-700 mb-2">ไม่เจอท็อปปิ้งที่ต้องการ? (พิมพ์เพิ่มเอง)</p>
                <div className="flex gap-2">
                  <input 
                    type="text" placeholder="ชื่อท็อปปิ้ง..." 
                    value={customToppingName} onChange={e => setCustomToppingName(e.target.value)} 
                    className="flex-1 p-2 border rounded-lg text-sm font-medium text-gray-900 bg-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none" 
                  />
                  <input 
                    type="number" placeholder="ราคา" 
                    value={customToppingPrice} onChange={e => setCustomToppingPrice(e.target.value)} 
                    className="w-20 p-2 border rounded-lg text-sm font-medium text-gray-900 bg-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none text-center" 
                  />
                  <button onClick={addCustomTopping} className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-900 transition-colors">เพิ่ม</button>
                </div>
              </div>
            </div>

            <div className="p-4 border-t bg-white">
              <button onClick={() => setToppingModalOpen(false)} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-blue-700 active:scale-95 transition-all shadow-md text-lg">
                ยืนยันการเลือก ({selectedToppings.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 3. Pop-up Checkout (เหมือนเดิม) */}
      {/* ========================================== */}
      {(isConfirming || receiptData) && (
        <div className="fixed inset-0 bg-white/40 flex items-center justify-center z-[60] backdrop-blur-md print:static print:bg-white print:block" onClick={() => {if(isConfirming){setIsConfirming(false); setAmountReceived("")} else if(receiptData) {setReceiptData(null); setAmountReceived(""); clearCart()}}}>
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-100 print:max-w-full print:shadow-none print:p-0 print:m-0" onClick={(e) => e.stopPropagation()}>
            {isConfirming && (
              <>
                <div className="text-center mb-6"><h2 className="text-2xl font-bold text-gray-800">สรุปยอดชำระเงิน</h2></div>
                <div className="border-t-2 border-b-2 border-gray-100 py-4 mb-4 space-y-3 max-h-40 overflow-y-auto pr-2">
                  {cart.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-start text-gray-700 text-sm">
                      <div className="flex-1">
                        <span className="font-bold">{item.name} <span className="text-gray-400 font-normal">x{item.quantity}</span></span>
                        <div className="text-[10px] text-gray-500">{item.size !== "-" && <span>[{item.size}] </span>}{item.toppings && <span>(+{item.toppings}) </span>}</div>
                      </div>
                      <span className="font-bold text-gray-800">฿{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-gray-50 p-4 rounded-xl mb-6">
                  <div className="flex justify-between items-center mb-3"><span className="text-gray-600 font-medium">ยอดที่ต้องชำระ</span><span className="text-xl font-bold text-gray-800">฿{totalPrice}</span></div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-600 font-medium">รับเงินมา (บาท)</span>
                    <input 
                      type="number" value={amountReceived} onChange={(e) => setAmountReceived(e.target.value)} 
                      className="w-28 p-2 text-right border border-gray-300 rounded-lg bg-white text-blue-700 font-bold text-lg placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                      placeholder="0" autoFocus 
                    />
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <span className="text-gray-600 font-medium">เงินทอน</span>
                    <span className={`font-bold text-xl ${changeAmount >= 0 ? 'text-green-600' : 'text-red-500'}`}>฿{changeAmount > 0 ? changeAmount : 0}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => { setIsConfirming(false); setAmountReceived(""); }} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-200">ยกเลิก</button>
                  <button onClick={confirmAndSaveOrder} disabled={!isEnoughCash} className={`flex-1 py-3 rounded-xl font-bold shadow-md transition-colors ${isEnoughCash ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-70'}`}>✅ ยืนยันรับเงิน</button>
                </div>
              </>
            )}

            {receiptData && (
              <div className="print:w-[80mm] print:mx-auto print:bg-white print:text-black">
                <div className="text-center mb-6 print:mb-2">
                  <h2 className="text-2xl font-bold text-gray-800 print:text-lg print:text-black">ใบเสร็จรับเงิน</h2>
                  <p className="text-gray-500 text-sm mt-1 print:text-[10px] print:text-black">My POS Store Co., Ltd.</p>
                  <div className="text-sm text-gray-500 mt-4 flex justify-between print:text-[10px] print:mt-2 print:text-black"><span>บิลเลขที่: #{receiptData.dailyNumber}</span><span>{receiptData.date}</span></div>
                </div>
                <div className="border-t-2 border-b-2 border-dashed border-gray-200 py-4 mb-4 space-y-3 print:py-2 print:mb-2 print:space-y-2 print:border-black">
                  {receiptData.items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between text-gray-700 text-sm print:text-[12px] print:text-black">
                      <div className="flex-1">
                        <span className="font-bold">{item.name} <span className="text-gray-400 font-normal print:text-gray-600">x{item.quantity}</span></span>
                        <div className="text-[10px] text-gray-500 print:text-[10px] print:text-black">{item.size !== "-" && <span>[{item.size}] </span>}{item.toppings && <span>+{item.toppings} </span>}{item.note && <span>({item.note})</span>}</div>
                      </div>
                      <span className="font-bold pl-2">฿{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="mb-8 print:mb-4">
                  <div className="flex justify-between items-center text-lg font-bold text-gray-800 mb-2 print:text-sm print:mb-1 print:text-black"><span>ยอดรวมทั้งสิ้น</span><span>฿{receiptData.total}</span></div>
                  <div className="flex justify-between items-center text-sm text-gray-600 mb-1 print:text-[12px] print:text-black"><span>รับเงินมา</span><span>฿{receiptData.received}</span></div>
                  <div className="flex justify-between items-center text-sm text-gray-600 print:text-[12px] print:text-black"><span>เงินทอน</span><span>฿{receiptData.change}</span></div>
                </div>
                <div className="text-center text-sm text-gray-500 mb-6 print:text-[10px] print:text-black print:mb-0">
                  <p>ขอบคุณที่ใช้บริการครับ/ค่ะ</p><p className="mt-1">Please come again</p>
                </div>
                <div className="space-y-3 print:hidden">
                  <button onClick={() => window.print()} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 flex justify-center items-center gap-2">🖨️ พิมพ์ใบเสร็จ</button>
                  <button onClick={() => {setReceiptData(null); setAmountReceived(""); clearCart()}} className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200">เสร็จสิ้น / คิวต่อไป</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}