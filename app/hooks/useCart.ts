import { useState } from "react";

export function useCart() {
  const [cart, setCart] = useState<any[]>([]);

  // เพิ่มสินค้าลงตะกร้า
  const addToCart = (payload: any) => {
    setCart(prev => {
      const existing = prev.find(i => i.cartKey === payload.cartKey);
      if (existing) {
        return prev.map(i => i.cartKey === payload.cartKey ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, payload];
    });
  };

  // ลด/ลบสินค้าออกจากตะกร้า
  const removeFromCart = (cartKey: string) => {
    setCart(prev => {
      const existing = prev.find(i => i.cartKey === cartKey);
      if (existing?.quantity === 1) {
        return prev.filter(i => i.cartKey !== cartKey);
      }
      return prev.map(i => i.cartKey === cartKey ? { ...i, quantity: i.quantity - 1 } : i);
    });
  };

  // ล้างตะกร้า
  const clearCart = () => setCart([]);

  // คำนวณยอดรวม
  const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  return { cart, addToCart, removeFromCart, clearCart, totalPrice };
}