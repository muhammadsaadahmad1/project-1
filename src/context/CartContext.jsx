import React, { createContext, useContext, useState, useEffect } from "react";
import { useStore } from "./StoreContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { products, settings } = useStore();
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem("aura_cart");
    return saved ? JSON.parse(saved) : [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("aura_cart", JSON.stringify(items));
  }, [items]);

  // Add to cart with variation safety
  const addToCart = (product, variation, quantity = 1) => {
    // Current live stock of the variation from the store
    const liveProduct = products.find(p => p.id === product.id) || product;
    const liveVariation = liveProduct.variations?.find(v => v.id === variation.id || v.size === variation.size) || variation;
    const availableStock = liveVariation.stock || 0;

    if (availableStock <= 0) {
      alert(`Pardon, ${product.name} (${variation.size}) is currently out of stock.`);
      return false;
    }

    const itemKey = `${product.id}-${variation.id || variation.size}`;

    setItems(prev => {
      const existing = prev.find(i => i.key === itemKey);
      if (existing) {
        const newQty = Math.min(availableStock, existing.quantity + quantity);
        return prev.map(i => i.key === itemKey ? { ...i, quantity: newQty } : i);
      } else {
        return [
          ...prev,
          {
            key: itemKey,
            productId: product.id,
            productName: product.name,
            brand: product.brand,
            image: product.image,
            variationId: variation.id,
            size: variation.size,
            price: Number(variation.price),
            quantity: Math.min(availableStock, quantity),
            maxStock: availableStock
          }
        ];
      }
    });

    setIsCartOpen(true);
    return true;
  };

  const updateQuantity = (itemKey, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(itemKey);
      return;
    }

    setItems(prev => prev.map(item => {
      if (item.key === itemKey) {
        // Verify current live stock
        const liveProd = products.find(p => p.id === item.productId);
        const liveVar = liveProd?.variations?.find(v => v.id === item.variationId || v.size === item.size);
        const currentMax = liveVar ? liveVar.stock : item.maxStock;

        return {
          ...item,
          quantity: Math.min(currentMax, newQuantity)
        };
      }
      return item;
    }));
  };

  const removeItem = (itemKey) => {
    setItems(prev => prev.filter(i => i.key !== itemKey));
  };

  const clearCart = () => {
    setItems([]);
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const freeShippingThreshold = settings?.freeShippingThreshold || 150;
  const shipping = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 15;
  const total = subtotal + shipping;
  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <CartContext.Provider
      value={{
        items,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        subtotal,
        shipping,
        total,
        totalItemsCount,
        freeShippingThreshold,
        amountToFreeShipping,
        freeShippingProgress
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
