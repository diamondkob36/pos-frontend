"use client";

import { useState, useEffect } from "react";
import CashierHeader from "./_components/CashierHeader";
import ProductCard from "./_components/ProductCard";
import CartPanel from "./_components/CartPanel";
import CheckoutModal from "./_components/CheckoutModal";
import ProductOptionModal from "./_components/ProductOptionModal";
import ToppingModal from "./_components/ToppingModal";
import ScrollToTop from "./_components/ScrollToTop";

import { useAuth } from "./hooks/useAuth";
import { useCart } from "./hooks/useCart";

const DEFAULT_TYPES = [ { name: "ร้อน", price: -5 }, { name: "เย็น", price: 0 }, { name: "ปั่น", price: 10 } ];
const NORMAL_SIZES = [ { name: "S", price: -5 }, { name: "M", price: 0 }, { name: "L", price: 5 } ];
const HOT_SIZES = [ { name: "ร้อน 8oz", price: 0 }, { name: "ร้อน 12oz", price: 10 } ];

export default function Home() {

  const { currentUser, handleLogout } = useAuth();
  const { cart, addToCart, removeFromCart, clearCart, totalPrice } = useCart();
  
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
  const [adjustToppingName, setAdjustToppingName] = useState<string | null>(null);

useEffect(() => {
    // 🌟 1. ดึง Token จากเครื่อง
    const token = localStorage.getItem("pos_token");
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}` // 🌟 2. แนบกุญแจ
    };

    Promise.all([
      fetch("http://localhost:3001/products", { headers }).then(res => res.json()),
      fetch("http://localhost:3001/toppings", { headers }).then(res => res.json()),
      fetch("http://localhost:3001/categories", { headers }).then(res => res.json())
    ]).then(([productsData, toppingsData, categoriesData]) => {
      // 🌟 3. ป้องกันแอปพัง ดักให้เซ็ตค่าเฉพาะเมื่อข้อมูลเป็น Array เท่านั้น
      setProducts(Array.isArray(productsData) ? productsData : []); 
      setDbToppings(Array.isArray(toppingsData) ? toppingsData : []); 
      setCategories(Array.isArray(categoriesData) ? categoriesData : []); 
      setIsLoading(false);
    }).catch(console.error);
  }, []);

  // 🌟 เช็คก่อนว่าเป็น Array จริงๆ ถึงจะใช้ .find() ได้
  const activeCatObj = Array.isArray(categories) ? categories.find(c => c.value === activeCategory) : undefined;

  const openOptionModal = (product: any) => {
    setSelectedProduct(product);
    const catValue = product.category || "";
    setActiveCategory(catValue);

    const catObj = categories.find(c => c.value === catValue);
    setSelectedType(catObj?.hasType ? DEFAULT_TYPES.find((t: any) => t.name === "เย็น") : null);
    setSelectedSize(catObj?.hasSize ? (NORMAL_SIZES.find((s: any) => s.price === 0) || NORMAL_SIZES[0]) : null);

    setSelectedToppings([]); setNote(""); setCustomToppingName(""); setCustomToppingPrice("");
    setOptionModalOpen(true);
  };

  const handleTypeChange = (type: any) => {
    setSelectedType(type);
    setSelectedSize(type.name === "ร้อน" ? HOT_SIZES[0] : (NORMAL_SIZES.find((s: any) => s.price === 0) || NORMAL_SIZES[0]));
  };

  const handleToppingClick = (topping: {name: string, price: number}) => {
    const isExist = selectedToppings.find(t => t.name === topping.name);
    if (isExist) updateToppingQty(topping.name, 1);
    else setSelectedToppings([...selectedToppings, { ...topping, qty: 1 }]);
  };

  const updateToppingQty = (name: string, delta: number) => {
    setSelectedToppings(selectedToppings.map(t => t.name === name ? { ...t, qty: Math.max(1, t.qty + delta) } : t));
  };

  const removeTopping = (name: string) => setSelectedToppings(selectedToppings.filter(t => t.name !== name));

  const addCustomTopping = () => {
    if (customToppingName && customToppingPrice) {
      setSelectedToppings([...selectedToppings, { name: customToppingName, price: Number(customToppingPrice), qty: 1 }]);
      setCustomToppingName(""); setCustomToppingPrice("");
    }
  };

  const confirmAddToCart = () => {
    const finalPrice = selectedProduct.price + (selectedType?.price || 0) + (selectedSize?.price || 0) + selectedToppings.reduce((sum:any, t:any) => sum + (t.price * t.qty), 0);
    const toppingsString = selectedToppings.map((t:any) => `${t.name} ฿${t.price} x${t.qty}`).join(", ");
    
    const combinedSizeText = `${selectedType ? selectedType.name + " " : ""}${selectedSize ? "(" + selectedSize.name + ")" : ""}`.trim();
    const cartKey = `${selectedProduct.id}-${combinedSizeText}-${toppingsString}-${note}`;

    addToCart({
      cartKey, id: selectedProduct.id, name: selectedProduct.name, basePrice: selectedProduct.price, 
      price: finalPrice, size: combinedSizeText || "-", toppings: toppingsString, note, quantity: 1
    });
    
    setOptionModalOpen(false); 
  };

  const numericAmount = parseFloat(amountReceived) || 0;
  const changeAmount = numericAmount - totalPrice;
  const isEnoughCash = numericAmount >= totalPrice;

  const handleCheckoutClick = async () => {
    if (cart.length === 0) {
      const { toast } = await import("@/lib/toast");
      toast.warning("ยังไม่มีสินค้าในตะกร้า");
      return;
    }
    setAmountReceived(""); setIsConfirming(true);
  };

  const confirmAndSaveOrder = async () => {
    if (!isEnoughCash) return;
    const orderPayload = { items: cart.map(item => ({ productId: item.id, quantity: item.quantity, price: item.price, size: item.size === "-" ? null : item.size, toppings: item.toppings || null, note: item.note || null })) };

    try {
      const token = localStorage.getItem("pos_token");
      const response = await fetch('http://localhost:3001/orders', { 
        method: 'POST', 
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }, 
        body: JSON.stringify(orderPayload) 
      });
      
      if (response.ok) {
        const savedOrder = await response.json();
        setReceiptData({ id: savedOrder.id, dailyNumber: savedOrder.dailyNumber || savedOrder.id || "-", date: new Date().toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }), items: [...cart], total: totalPrice, received: numericAmount, change: changeAmount });
        setIsConfirming(false);
      } else {
        const { toast } = await import("@/lib/toast");
        toast.error("เกิดข้อผิดพลาดในการบันทึกบิล");
      }
    } catch (error) {
      const { toast } = await import("@/lib/toast");
      toast.error("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    }
  };

  const handleBackdropClick = () => {
    if (isConfirming) { setIsConfirming(false); setAmountReceived(""); } 
    else if (receiptData) { setReceiptData(null); setAmountReceived(""); clearCart(); } 
    else if (adjustToppingName) setAdjustToppingName(null); 
    else if (toppingModalOpen) setToppingModalOpen(false); 
    else if (optionModalOpen) setOptionModalOpen(false);
  };

  const currentCategoryToppings = dbToppings.filter(t => t.category === activeCategory);
  const activeProducts = products.filter(p => p.isActive !== false);
  const filteredProducts = productFilter === "all" ? activeProducts : activeProducts.filter(p => p.category === productFilter);

  return (
    // 🌟 1. อนุญาตให้เลื่อนลงได้ (min-h-screen) แต่ถ้าเป็น PC (lg:) ถึงจะล็อกหน้าจอ (h-screen overflow-hidden)
    <div className="flex flex-col min-h-screen lg:h-screen lg:overflow-hidden bg-gray-50 print:bg-white">
      
      <div className="print:hidden flex flex-col flex-1 lg:h-full lg:overflow-hidden">
        <CashierHeader />

        {/* 🌟 2. เปลี่ยน md:flex-row เป็น lg:flex-row เพื่อให้ Tablet เรียงบน-ล่างแล้วเลื่อนเอา */}
        <main className="flex-1 flex flex-col lg:flex-row lg:overflow-hidden p-2 sm:p-4 gap-3 sm:gap-4">
          
          <section className="flex-1 flex flex-col bg-white p-3 sm:p-4 rounded-2xl shadow-sm border border-gray-100 lg:overflow-hidden">
            <div className="flex gap-2 mb-3 sm:mb-4 overflow-x-auto pb-2 custom-scrollbar shrink-0">
              <button onClick={() => setProductFilter("all")} className={`flex-shrink-0 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm border ${productFilter === "all" ? "bg-gray-800 text-white border-gray-800" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>ทั้งหมด</button>
              {categories.map(c => <button key={c.id} onClick={() => setProductFilter(c.value)} className={`flex-shrink-0 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm border ${productFilter === c.value ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>{c.label}</button>)}
            </div>

            {/* 🌟 3. ปลดล็อก overflow ในจอเล็ก เพื่อให้มันยืดความสูงได้ตามธรรมชาติ */}
            <div className="flex-1 lg:overflow-y-auto pr-1 sm:pr-2 custom-scrollbar pb-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 p-1">
                {isLoading ? ( <div className="col-span-full flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div> ) 
                : filteredProducts.length === 0 ? ( <div className="col-span-full text-center py-12 text-gray-600 font-medium bg-gray-50 rounded-2xl border border-gray-100 border-dashed">ไม่มีสินค้าในหมวดหมู่นี้</div> ) 
                : ( filteredProducts.map((product) => ( <ProductCard key={product.id} product={product} onClick={() => openOptionModal(product)} /> )) )}
              </div>
            </div>
          </section>

          {/* ตะกร้าสินค้าจะถูกดันลงไปอยู่ด้านล่างในโหมด Tablet/Mobile ให้เลื่อนลงมาดูได้ */}
          <CartPanel cart={cart} clearCart={clearCart} removeFromCart={removeFromCart} totalPrice={totalPrice} handleCheckoutClick={handleCheckoutClick} />
        </main>
      </div>

      <ProductOptionModal 
        isOpen={optionModalOpen} selectedProduct={selectedProduct} activeCatObj={activeCatObj} 
        selectedType={selectedType} selectedSize={selectedSize} selectedToppings={selectedToppings} 
        note={note} setNote={setNote} setIsOpen={setOptionModalOpen} handleTypeChange={handleTypeChange} 
        setSelectedSize={setSelectedSize} setToppingModalOpen={setToppingModalOpen} 
        removeTopping={removeTopping} setAdjustToppingName={setAdjustToppingName} 
        confirmAddToCart={confirmAddToCart} handleBackdropClick={handleBackdropClick}
        DEFAULT_TYPES={DEFAULT_TYPES} NORMAL_SIZES={NORMAL_SIZES} HOT_SIZES={HOT_SIZES}
      />

      <ToppingModal 
        toppingModalOpen={toppingModalOpen} setToppingModalOpen={setToppingModalOpen} 
        currentCategoryToppings={currentCategoryToppings} selectedToppings={selectedToppings} 
        handleToppingClick={handleToppingClick} setAdjustToppingName={setAdjustToppingName} 
        customToppingName={customToppingName} setCustomToppingName={setCustomToppingName} 
        customToppingPrice={customToppingPrice} setCustomToppingPrice={setCustomToppingPrice} 
        addCustomTopping={addCustomTopping} removeTopping={removeTopping} 
        adjustToppingName={adjustToppingName} updateToppingQty={updateToppingQty} 
        handleBackdropClick={handleBackdropClick}
      />

      <CheckoutModal 
        isConfirming={isConfirming} receiptData={receiptData} cart={cart} 
        totalPrice={totalPrice} amountReceived={amountReceived} setAmountReceived={setAmountReceived} 
        changeAmount={changeAmount} isEnoughCash={isEnoughCash} setIsConfirming={setIsConfirming} 
        confirmAndSaveOrder={confirmAndSaveOrder} setReceiptData={setReceiptData} 
        clearCart={clearCart} handleBackdropClick={handleBackdropClick}
      />

      {/* ปุ่มเลื่อนขึ้นด้านบน */}
      <ScrollToTop />

    </div>
  );
}