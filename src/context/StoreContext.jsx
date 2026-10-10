import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { INITIAL_PRODUCTS, INITIAL_REVIEWS, INITIAL_ORDERS, APP_SETTINGS } from "../data/initialProducts";
import { decrementStockForOrder, getLowStockAlerts } from "../services/inventoryService";
import { calculateProductRatingMetrics } from "../services/reviewService";
import {
  addProduct as addSupabaseProduct,
  addReview as addSupabaseReview,
  deleteProduct as deleteSupabaseProduct,
  deleteReview as deleteSupabaseReview,
  fetchOrders,
  fetchProducts,
  fetchReviews,
  fetchStoreSettings,
  isSupabaseConfigured,
  placeOrder as placeSupabaseOrder,
  saveStoreSettings,
  subscribeStoreChanges,
  updateOrderStatus as updateSupabaseOrderStatus,
  updateProduct as updateSupabaseProduct,
  updateReviewStatus as updateSupabaseReviewStatus,
  updateStock as updateSupabaseStock
} from "../services/storeApi";

const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  const { currentAdmin } = useAuth();
  const isAdmin = currentAdmin?.role === "admin";
  // 1. Initial State from localStorage or Seeds
  const [products, setProducts] = useState(() => {
    if (isSupabaseConfigured) return INITIAL_PRODUCTS;
    const saved = localStorage.getItem("aura_products");
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [reviews, setReviews] = useState(() => {
    if (isSupabaseConfigured) return [];
    const saved = localStorage.getItem("aura_reviews");
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  const [orders, setOrders] = useState(() => {
    if (isSupabaseConfigured) return [];
    const saved = localStorage.getItem("aura_orders");
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [settings, setSettings] = useState(() => {
    if (isSupabaseConfigured) {
      localStorage.removeItem("aura_settings");
      return APP_SETTINGS;
    }
    const saved = localStorage.getItem("aura_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        delete parsed.adminPasscode;
        if (parsed.adminWhatsappNumber === "+14155552671" || !parsed.adminWhatsappNumber) {
          parsed.adminWhatsappNumber = "+923159146234";
        }
        return parsed;
      } catch (e) {}
    }
    return APP_SETTINGS;
  });

  // Sync to local storage on local mode
  useEffect(() => {
    if (!isSupabaseConfigured) {
      localStorage.setItem("aura_products", JSON.stringify(products));
    }
  }, [products]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      localStorage.setItem("aura_reviews", JSON.stringify(reviews));
    }
  }, [reviews]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      localStorage.setItem("aura_orders", JSON.stringify(orders));
    }
  }, [orders]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      localStorage.setItem("aura_settings", JSON.stringify(settings));
    }
  }, [settings]);

  const [settingsHydrated, setSettingsHydrated] = useState(!isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let active = true;
    if (!isAdmin) setOrders([]);
    const refresh = async (table) => {
      try {
        if (table === "products") setProducts(await fetchProducts());
        if (table === "reviews") setReviews(await fetchReviews());
        if (table === "orders" && isAdmin) setOrders(await fetchOrders());
      } catch (error) {
        console.warn(`Supabase ${table} load failed:`, error.message);
      }
    };

    Promise.all([
      fetchProducts(),
      fetchReviews(),
      isAdmin ? fetchOrders() : Promise.resolve([]),
      fetchStoreSettings()
    ])
      .then(([remoteProducts, remoteReviews, remoteOrders, remoteSettings]) => {
        if (!active) return;
        setProducts(remoteProducts);
        if (remoteReviews.length) setReviews(remoteReviews);
        setOrders(remoteOrders);
        if (remoteSettings) {
          delete remoteSettings.adminPasscode;
          setSettings(prev => ({ ...prev, ...remoteSettings }));
        }
        setSettingsHydrated(true);
      })
      .catch(error => {
        console.warn("Supabase initial data load failed:", error.message);
        if (active) setSettingsHydrated(true);
      });

    const unsubscribe = subscribeStoreChanges(table => { void refresh(table); }, isAdmin);
    return () => {
      active = false;
      unsubscribe();
    };
  }, [isAdmin]);

  useEffect(() => {
    if (!isSupabaseConfigured || !settingsHydrated || !isAdmin) return;
    void saveStoreSettings(settings).catch(error => console.warn("Supabase settings save failed:", error.message));
  }, [settings, settingsHydrated, isAdmin]);

  // Supabase Realtime keeps separate browser sessions in sync.

  // 3. Product Management Operations
  const addProduct = async (newProduct) => {
    const product = {
      ...newProduct,
      id: newProduct.id || `frag-${Date.now()}`,
      createdAt: new Date().toISOString(),
      rating: { average: 5.0, count: 1 }
    };

    if (isSupabaseConfigured) {
      await addSupabaseProduct(product);
      setProducts(prev => [product, ...prev.filter(existing => existing.id !== product.id)]);
    } else {
      setProducts(prev => [product, ...prev]);
    }
    return product;
  };

  const updateProduct = async (productId, updatedFields) => {
    if (isSupabaseConfigured) {
      await updateSupabaseProduct(productId, updatedFields);
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, ...updatedFields } : p));
    } else {
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, ...updatedFields } : p));
    }
  };

  const deleteProduct = async (productId) => {
    if (isSupabaseConfigured) {
      await deleteSupabaseProduct(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
    } else {
      setProducts(prev => prev.filter(p => p.id !== productId));
    }
  };

  // 4. Inventory System Operations
  const updateStock = async (productId, variationId, newStock) => {
    const numStock = Math.max(0, parseInt(newStock) || 0);
    const targetProduct = products.find(p => p.id === productId);
    if (!targetProduct) return;

    if (isSupabaseConfigured) {
      await updateSupabaseStock(productId, variationId, numStock);
      setProducts(prev => prev.map(product => product.id !== productId ? product : {
        ...product,
        variations: product.variations.map(variation => variation.id === variationId ? { ...variation, stock: numStock } : variation)
      }));
      return;
    }

    const updatedVariations = targetProduct.variations.map(v => 
      v.id === variationId ? { ...v, stock: numStock } : v
    );

    await updateProduct(productId, { variations: updatedVariations });
  };

  // 5. Order Placement & Automated Stock Decrement
  const placeOrder = async (orderData) => {
    if (isSupabaseConfigured) {
      const savedOrder = await placeSupabaseOrder(orderData);
      setOrders(prev => [savedOrder, ...prev.filter(order => order.id !== savedOrder.id)]);
      setProducts(await fetchProducts());
      return savedOrder;
    }

    const newOrderId = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    const newOrder = {
      ...orderData,
      id: newOrderId,
      status: "pending",
      createdAt: new Date().toISOString(),
      whatsappNotified: false
    };

    // Decrement stock in real-time
    const updatedCatalog = decrementStockForOrder(products, orderData.items);
    
    setOrders(prev => [newOrder, ...prev]);
    setProducts(updatedCatalog);

    return newOrder;
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    if (isSupabaseConfigured) {
      await updateSupabaseOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus, updatedAt: new Date().toISOString() } : o));
    } else {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus, updatedAt: new Date().toISOString() } : o));
    }
  };

  // 6. Real-time Reviews & Star Rating System
  const addReview = async (reviewData) => {
    const newReview = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: settings.requireReviewModeration ? "pending" : "approved"
    };

    const newReviewsList = [newReview, ...reviews];

    if (isSupabaseConfigured) {
      const savedReview = await addSupabaseReview(newReview);
      setReviews(prev => [savedReview, ...prev]);
      if (savedReview.status === "approved") {
        const updatedReviews = [savedReview, ...reviews];
        const metrics = calculateProductRatingMetrics(updatedReviews, savedReview.productId);
        await updateSupabaseProduct(savedReview.productId, { rating: metrics });
        setProducts(prev => prev.map(product => product.id === savedReview.productId ? { ...product, rating: metrics } : product));
      }
      return savedReview;
    } else {
      setReviews(newReviewsList);
      if (newReview.status === "approved") {
        const metrics = calculateProductRatingMetrics(newReviewsList, newReview.productId);
        setProducts(prev => prev.map(p => p.id === newReview.productId ? { ...p, rating: metrics } : p));
      }
    }

    return newReview;
  };

  const updateReviewStatus = async (reviewId, newStatus) => {
    const targetRev = reviews.find(r => r.id === reviewId);
    if (!targetRev) return;

    const updatedReviews = reviews.map(r => r.id === reviewId ? { ...r, status: newStatus } : r);

    if (isSupabaseConfigured) {
      await updateSupabaseReviewStatus(reviewId, newStatus);
      setReviews(updatedReviews);
      const metrics = calculateProductRatingMetrics(updatedReviews, targetRev.productId);
      await updateSupabaseProduct(targetRev.productId, { rating: metrics });
      setProducts(prev => prev.map(p => p.id === targetRev.productId ? { ...p, rating: metrics } : p));
    } else {
      setReviews(updatedReviews);
      const metrics = calculateProductRatingMetrics(updatedReviews, targetRev.productId);
      setProducts(prev => prev.map(p => p.id === targetRev.productId ? { ...p, rating: metrics } : p));
    }
  };

  const deleteReview = async (reviewId) => {
    const targetRev = reviews.find(r => r.id === reviewId);
    const updatedReviews = reviews.filter(r => r.id !== reviewId);

    if (isSupabaseConfigured) {
      await deleteSupabaseReview(reviewId);
      setReviews(updatedReviews);
      if (targetRev) {
        const metrics = calculateProductRatingMetrics(updatedReviews, targetRev.productId);
        await updateSupabaseProduct(targetRev.productId, { rating: metrics });
        setProducts(prev => prev.map(p => p.id === targetRev.productId ? { ...p, rating: metrics } : p));
      }
    } else {
      setReviews(updatedReviews);
      if (targetRev) {
        const metrics = calculateProductRatingMetrics(updatedReviews, targetRev.productId);
        setProducts(prev => prev.map(p => p.id === targetRev.productId ? { ...p, rating: metrics } : p));
      }
    }
  };

  // 7. Low Stock Alerts Derived State
  const lowStockAlerts = getLowStockAlerts(products, settings.lowStockThreshold);

  return (
    <StoreContext.Provider
      value={{
        products,
        reviews,
        orders,
        settings,
        lowStockAlerts,
        setSettings,
        addProduct,
        updateProduct,
        deleteProduct,
        updateStock,
        placeOrder,
        updateOrderStatus,
        addReview,
        updateReviewStatus,
        deleteReview,
        isSupabaseActive: isSupabaseConfigured
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within a StoreProvider");
  return context;
};
