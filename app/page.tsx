"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const DEFAULT_TYPES = [
  { name: "ร้อน", price: -5 },
  { name: "เย็น", price: 0 },
  { name: "ปั่น", price: 10 },
];

const NORMAL_SIZES = [
  { name: "S", price: -5 },
  { name: "M", price: 0 },
  { name: "L", price: 5 },
];

const HOT_SIZES = [
  { name: "ร้อน 8oz", price: 0 },
  { name: "ร้อน 12oz", price: 10 },
];

export default function Home() {
  const [cart, setCart] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [dbToppings, setDbToppings] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]); 
  const [isLoading, setIsLoading] = useState(true);

  const [isConfirming, setIsConfirming] = useState(false);
  const [receiptData, setReceiptData] = useState<any | null>(null);
  const [amountReceived, setAmountReceived] = useState<string>("");

  const [optionModalOpen, setOptionModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [activeCategory, setActiveCategory] = useState<string>("");
  
  const [selectedType, setSelectedType] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState<any>(null);
  
  const [selectedToppings, setSelectedToppings] = useState<{name: string, price: number, qty: number}[]>([]);
  
  const [note, setNote] = useState("");
  const [customToppingName, setCustomToppingName] = useState("");
  const [customToppingPrice, setCustomToppingPrice] = useState("");

  const [toppingModalOpen, setToppingModalOpen] = useState(false);
  const [productFilter, setProductFilter] = useState("all"); 

  // 🌟 State ใหม่: สำหรับเปิด Popup ปรับจำนวนท็อปปิ้ง (เก็บชื่อท็อปปิ้งที่กำลังปรับ)
  const [adjustToppingName, setAdjustToppingName] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:3001/products").then(res => res.json()),
      fetch("http://localhost:3001/toppings").then(res => res.json()),
      fetch("http://localhost:3001/categories").then(res => res.json())
    ]).then(([productsData, toppingsData, categoriesData]) => {
      setProducts(productsData);
      setDbToppings(toppingsData);
      setCategories(categoriesData);
      setIsLoading(false);
    }).catch(console.error);
  }, []);

  const activeCatObj = categories.find(c => c.value === activeCategory);

  const openOptionModal = (product: any) => {
    setSelectedProduct(product);
    const catValue = product.category || "";
    setActiveCategory(catValue);

    const catObj = categories.find(c => c.value === catValue);
    
    if (catObj?.hasType) {
      setSelectedType(DEFAULT_TYPES.find((t: any) => t.name === "เย็น")); 
    } else {
      setSelectedType(null);
    }

    if (catObj?.hasSize) {
      setSelectedSize(NORMAL_SIZES.find((s: any) => s.price === 0) || NORMAL_SIZES[0]);
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
    if (type.name === "ร้อน") {
      setSelectedSize(HOT_SIZES[0]); 
    } else {
      setSelectedSize(NORMAL_SIZES.find((s: any) => s.price === 0) || NORMAL_SIZES[0]);
    }
  };

  const handleToppingClick = (topping: {name: string, price: number}) => {
    const isExist = selectedToppings.find(t => t.name === topping.name);
    if (isExist) {
      updateToppingQty(topping.name, 1);
    } else {
      setSelectedToppings([...selectedToppings, { ...topping, qty: 1 }]);
    }
  };

  const updateToppingQty = (name: string, delta: number) => {
    setSelectedToppings(selectedToppings.map(t => {
      if (t.name === name) {
        const newQty = t.qty + delta;
        return { ...t, qty: newQty < 1 ? 1 : newQty };
      }
      return t;
    }));
  };

  const removeTopping = (name: string) => {
    setSelectedToppings(selectedToppings.filter(t => t.name !== name));
  };

  const addCustomTopping = () => {
    if (customToppingName && customToppingPrice) {
      setSelectedToppings([...selectedToppings, { name: customToppingName, price: Number(customToppingPrice), qty: 1 }]);
      setCustomToppingName(""); setCustomToppingPrice("");
    }
  };

  const confirmAddToCart = () => {
    const typePrice = selectedType ? selectedType.price : 0;
    const sizePrice = selectedSize ? selectedSize.price : 0;
    const toppingsPrice = selectedToppings.reduce((sum, t) => sum + (t.price * t.qty), 0);
    
    const finalPrice = selectedProduct.price + typePrice + sizePrice + toppingsPrice;
    const toppingsString = selectedToppings.map(t => `${t.name} @${t.price} x${t.qty}`).join(", ");
    
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

  const handleBackdropClick = () => {
    if (isConfirming) {
      setIsConfirming(false); setAmountReceived("");
    } else if (receiptData) {
      setReceiptData(null); setAmountReceived(""); clearCart();
    } else if (adjustToppingName) { // 🌟 ปิด Popup ปรับจำนวนได้ด้วยการคลิกพื้นหลัง
      setAdjustToppingName(null);
    } else if (toppingModalOpen) {
      setToppingModalOpen(false);
    } else if (optionModalOpen) {
      setOptionModalOpen(false);
    }
  };

  const currentCategoryToppings = dbToppings.filter(t => t.category === activeCategory);
  const filteredProducts = productFilter === "all" ? products : products.filter(p => p.category === productFilter);

  return (
    <main className="min-h-screen bg-gray-100 p-8 print:bg-white print:p-0">
      <div className="print:hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-800">ระบบ POS - หน้าจอแคชเชียร์</h1>
          <div className="flex gap-3">
            <Link href="/history" className="bg-white text-blue-600 px-5 py-2.5 rounded-xl font-bold shadow-sm border border-blue-200 hover:bg-blue-50 transition-colors flex items-center gap-2">
              📊 ดูยอดขาย / หลังร้าน
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col h-[calc(100vh-140px)]">
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 custom-scrollbar shrink-0">
              <button onClick={() => setProductFilter("all")} className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm border ${productFilter === "all" ? "bg-gray-800 text-white border-gray-800" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>ทั้งหมด</button>
              {categories.map(c => (
                <button key={c.id} onClick={() => setProductFilter(c.value)} className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm border ${productFilter === c.value ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>{c.label}</button>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto pb-8 p-2">
              {isLoading ? (
                <div className="col-span-full flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
              ) : filteredProducts.length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-400 font-medium bg-white rounded-2xl border border-gray-100 border-dashed">ไม่มีสินค้าในหมวดหมู่นี้</div>
              ) : (
                filteredProducts.map((product) => (
                  <div key={product.id} onClick={() => openOptionModal(product)} className="bg-white p-4 rounded-xl shadow-sm cursor-pointer transition-all active:scale-95 hover:ring-4 hover:ring-blue-500 border border-transparent flex flex-col">
                    <img src={product.image} alt={product.name} className="w-full h-32 object-cover rounded-lg mb-4 bg-gray-100" />
                    <h3 className="text-md font-bold text-gray-800 line-clamp-2 leading-tight flex-1">{product.name}</h3>
                    <div className="flex justify-between items-end mt-2 pt-2 border-t border-gray-50">
                      <p className="text-blue-600 font-extrabold text-lg">฿{product.price}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm h-[calc(100vh-140px)] flex flex-col border border-gray-100">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h2 className="text-xl font-bold text-gray-800">🛒 ออเดอร์ปัจจุบัน</h2>
              {cart.length > 0 && <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-700 font-medium bg-red-50 px-3 py-1 rounded-lg">ล้างทั้งหมด</button>}
            </div>
            
            <div className="space-y-4 mb-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {cart.length === 0 ? <p className="text-gray-400 text-center py-10 font-medium">ยังไม่มีสินค้าในตะกร้า</p> : cart.map((item) => (
                <div key={item.cartKey} className="flex justify-between items-start border-b pb-4 border-gray-100 last:border-0 last:pb-0">
                  <div className="flex-1 pr-3">
                    <p className="font-bold text-gray-800">{item.name}</p>
                    <div className="text-[11px] text-gray-500 mt-1 space-y-0.5">
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
        </div>
      </div>

      {optionModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-40 backdrop-blur-sm print:hidden" onClick={handleBackdropClick}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gray-50 p-5 border-b flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedProduct.name}</h2>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-md font-bold mt-1 inline-block">หมวดหมู่: {activeCatObj?.label || "ไม่ได้ระบุ"}</span>
              </div>
              <button onClick={() => setOptionModalOpen(false)} className="text-gray-400 hover:text-gray-800 text-3xl font-bold transition-colors">&times;</button>
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
                  <span className="text-xs text-blue-700 font-bold bg-blue-100 px-2 py-0.5 rounded-md">เลือกแล้ว {selectedToppings.reduce((sum, t) => sum + t.qty, 0)} อย่าง</span>
                </h3>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <button 
                    onClick={() => setToppingModalOpen(true)}
                    className="w-full py-3.5 bg-white border-2 border-dashed border-blue-400 text-blue-600 font-bold rounded-xl hover:bg-blue-50 hover:border-blue-500 transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <span className="text-xl leading-none">+</span>
                    <span>กดเพื่อเลือกท็อปปิ้ง</span>
                  </button>

                  {selectedToppings.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-4 mt-3 border-t border-gray-200">
                      {selectedToppings.map((t, idx) => (
                        // 🌟 ปรับให้กดที่ป้ายเพื่อเปิด Popup แก้ไขจำนวนได้
                        <div 
                          key={idx} 
                          onClick={() => setAdjustToppingName(t.name)}
                          className="bg-white border border-blue-300 text-blue-800 text-[12px] pl-3 pr-1 py-1.5 rounded-xl flex items-center gap-2 shadow-sm font-bold cursor-pointer hover:bg-blue-50 transition-colors active:scale-95"
                        >
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
                <textarea 
                  value={note} onChange={(e) => setNote(e.target.value)} 
                  placeholder="เช่น หวานน้อย 50%, ไม่รับหลอด" 
                  className="w-full border border-gray-300 rounded-xl p-4 text-sm font-medium text-gray-900 bg-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none resize-none shadow-sm" 
                  rows={2}
                ></textarea>
              </div>
            </div>

            <div className="p-5 border-t bg-white">
              <button onClick={confirmAddToCart} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold flex justify-between items-center px-6 hover:bg-blue-700 active:scale-95 transition-all shadow-lg">
                <span className="text-lg">เพิ่มลงออเดอร์</span>
                <span className="bg-white/20 px-3 py-1 rounded-lg text-lg">฿{selectedProduct.price + (selectedType?.price || 0) + (selectedSize?.price || 0) + selectedToppings.reduce((sum, t) => sum + t.price * t.qty, 0)}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 🌟 2. Modal หน้าต่างเลือกท็อปปิ้งหลัก */}
      {/* ========================================== */}
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
                    const selectedItem = selectedToppings.find(selected => selected.name === t.name);
                    const qty = selectedItem ? selectedItem.qty : 0;
                    
                    return (
                      <button 
                        key={t.id} 
                        onClick={() => handleToppingClick(t)} 
                        className={`relative p-3 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all active:scale-95 ${qty > 0 ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-transparent bg-white shadow-sm hover:border-blue-300 hover:shadow-md'}`}
                      >
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

              {/* ป้ายแสดงสิ่งที่เลือก (กดแก้ได้) */}
              {selectedToppings.length > 0 && (
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
                  <p className="text-sm font-bold text-gray-700 mb-3">ท็อปปิ้งที่เลือกไว้ (กดเพื่อปรับจำนวน)</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedToppings.map((t, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => setAdjustToppingName(t.name)}
                        className="bg-blue-50 border border-blue-200 text-blue-800 text-[12px] pl-3 pr-1 py-1.5 rounded-xl flex items-center gap-2 font-bold cursor-pointer hover:bg-blue-100 transition-colors active:scale-95"
                      >
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
                ยืนยันการเลือก ({selectedToppings.reduce((sum, t) => sum + t.qty, 0)} รายการ)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 🌟 2.5 Modal Popup ปรับจำนวนท็อปปิ้ง (ปุ่มเบิ้มๆ) */}
      {/* ========================================== */}
      {adjustToppingName && selectedToppings.find(t => t.name === adjustToppingName) && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[80] backdrop-blur-sm print:hidden" onClick={() => setAdjustToppingName(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-[90%] max-w-xs overflow-hidden flex flex-col p-6" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-black text-gray-900">{selectedToppings.find(t => t.name === adjustToppingName)?.name}</h2>
              <p className="text-gray-500 font-medium mt-1">ปรับจำนวนท็อปปิ้ง</p>
            </div>

            <div className="flex items-center justify-center gap-5 mb-8">
              <button 
                onClick={() => updateToppingQty(adjustToppingName, -1)}
                disabled={selectedToppings.find(t => t.name === adjustToppingName)!.qty <= 1}
                className="w-16 h-16 rounded-2xl bg-gray-100 text-gray-600 flex items-center justify-center text-4xl font-bold active:scale-90 transition-all disabled:opacity-40 disabled:active:scale-100 shadow-inner"
              >-</button>
              
              <div className="w-20 text-center text-5xl font-black text-blue-600">
                {selectedToppings.find(t => t.name === adjustToppingName)?.qty}
              </div>
              
              <button 
                onClick={() => updateToppingQty(adjustToppingName, 1)}
                className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-4xl font-bold active:scale-90 transition-all shadow-sm"
              >+</button>
            </div>

            <div className="bg-blue-50 p-4 rounded-2xl mb-6 text-center border border-blue-100">
              <p className="text-sm font-bold text-gray-500">ราคารวมท็อปปิ้งนี้</p>
              <p className="text-2xl font-black text-blue-700">
                +฿{(selectedToppings.find(t => t.name === adjustToppingName)!.price * selectedToppings.find(t => t.name === adjustToppingName)!.qty).toLocaleString()}
              </p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => { removeTopping(adjustToppingName); setAdjustToppingName(null); }} className="flex-1 bg-red-50 text-red-600 py-3.5 rounded-xl font-bold text-lg hover:bg-red-100 transition-colors">ลบทิ้ง</button>
              <button onClick={() => setAdjustToppingName(null)} className="flex-[2] bg-blue-600 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-blue-700 shadow-md active:scale-95 transition-all">ตกลง</button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 3. Pop-up Checkout (จ่ายเงิน/ใบเสร็จ) */}
      {/* ========================================== */}
      {(isConfirming || receiptData) && (
        <div className="fixed inset-0 bg-white/60 flex items-center justify-center z-[90] backdrop-blur-md print:static print:bg-white print:block" onClick={handleBackdropClick}>
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm border border-gray-100 print:max-w-full print:shadow-none print:p-0 print:m-0" onClick={(e) => e.stopPropagation()}>
            {isConfirming && (
              <>
                <div className="text-center mb-6"><h2 className="text-2xl font-black text-gray-800">สรุปยอดชำระเงิน</h2></div>
                <div className="border-t-2 border-b-2 border-dashed border-gray-200 py-4 mb-4 space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {cart.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-start text-gray-700 text-sm">
                      <div className="flex-1 pr-2">
                        <span className="font-bold">{item.name} <span className="text-gray-400 font-normal">x{item.quantity}</span></span>
                        <div className="text-[10px] text-gray-500">{item.size !== "-" && <span>[{item.size}] </span>}{item.toppings && <span>(+{item.toppings}) </span>}</div>
                      </div>
                      <span className="font-bold text-gray-900">฿{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-gray-50 p-5 rounded-2xl mb-6 border border-gray-100">
                  <div className="flex justify-between items-center mb-3"><span className="text-gray-600 font-bold">ยอดที่ต้องชำระ</span><span className="text-xl font-black text-gray-900">฿{totalPrice.toLocaleString()}</span></div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-600 font-bold">รับเงินมา (บาท)</span>
                    <input type="number" value={amountReceived} onChange={(e) => setAmountReceived(e.target.value)} className="w-28 p-2 text-right border-2 border-gray-300 rounded-xl bg-white text-blue-700 font-black text-lg placeholder-gray-300 focus:border-blue-500 focus:outline-none" placeholder="0" autoFocus />
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <span className="text-gray-600 font-bold">เงินทอน</span>
                    <span className={`font-black text-xl ${changeAmount >= 0 ? 'text-green-600' : 'text-red-500'}`}>฿{changeAmount > 0 ? changeAmount.toLocaleString() : 0}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => { setIsConfirming(false); setAmountReceived(""); }} className="flex-1 bg-gray-100 text-gray-600 py-3.5 rounded-xl font-bold hover:bg-gray-200 transition-colors">ยกเลิก</button>
                  <button onClick={confirmAndSaveOrder} disabled={!isEnoughCash} className={`flex-1 py-3.5 rounded-xl font-bold shadow-md transition-all ${isEnoughCash ? 'bg-green-600 text-white hover:bg-green-700 active:scale-95' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>✅ ยืนยันรับเงิน</button>
                </div>
              </>
            )}

            {receiptData && (
              <div className="print:w-[80mm] print:mx-auto print:bg-white print:text-black">
                <div className="text-center mb-6 print:mb-2">
                  <h2 className="text-2xl font-black text-gray-800 print:text-lg print:text-black">ใบเสร็จรับเงิน</h2>
                  <p className="text-gray-500 text-sm mt-1 print:text-[10px] print:text-black font-medium">My POS Store Co., Ltd.</p>
                  <div className="text-sm text-gray-500 mt-4 flex justify-between print:text-[10px] print:mt-2 print:text-black"><span>บิล: #{receiptData.dailyNumber}</span><span>{receiptData.date}</span></div>
                </div>
                <div className="border-t-2 border-b-2 border-dashed border-gray-200 py-4 mb-4 space-y-3 print:py-2 print:mb-2 print:space-y-2 print:border-black">
                  {receiptData.items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between text-gray-700 text-sm print:text-[12px] print:text-black">
                      <div className="flex-1 pr-2">
                        <span className="font-bold">{item.name} <span className="text-gray-400 font-normal print:text-gray-600">x{item.quantity}</span></span>
                        <div className="text-[10px] text-gray-500 print:text-[10px] print:text-black">{item.size !== "-" && <span>[{item.size}] </span>}{item.toppings && <span>+{item.toppings} </span>}{item.note && <span>({item.note})</span>}</div>
                      </div>
                      <span className="font-bold">฿{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="mb-8 print:mb-4">
                  <div className="flex justify-between items-center text-lg font-black text-gray-800 mb-2 print:text-sm print:mb-1 print:text-black"><span>ยอดรวมทั้งสิ้น</span><span>฿{receiptData.total.toLocaleString()}</span></div>
                  <div className="flex justify-between items-center text-sm font-medium text-gray-600 mb-1 print:text-[12px] print:text-black"><span>รับเงินมา</span><span>฿{receiptData.received.toLocaleString()}</span></div>
                  <div className="flex justify-between items-center text-sm font-medium text-gray-600 print:text-[12px] print:text-black"><span>เงินทอน</span><span>฿{receiptData.change.toLocaleString()}</span></div>
                </div>
                <div className="text-center text-sm text-gray-500 mb-6 print:text-[10px] print:text-black print:mb-0 font-medium">
                  <p>ขอบคุณที่ใช้บริการครับ/ค่ะ</p><p className="mt-1">Please come again</p>
                </div>
                <div className="space-y-3 print:hidden">
                  <button onClick={() => window.print()} className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 flex justify-center items-center gap-2 shadow-md">🖨️ พิมพ์ใบเสร็จ</button>
                  <button onClick={() => {setReceiptData(null); setAmountReceived(""); clearCart()}} className="w-full bg-gray-100 text-gray-700 py-3.5 rounded-xl font-bold hover:bg-gray-200 transition-colors">เสร็จสิ้น / คิวต่อไป</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}