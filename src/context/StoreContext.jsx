import React, { createContext, useContext, useState, useEffect } from "react";
import { INITIAL_PRODUCTS, INITIAL_REVIEWS, INITIAL_ORDERS, APP_SETTINGS } from "../data/initialProducts";
import { decrementStockForOrder, getLowStockAlerts } from "../services/inventoryService";
import { calculateProductRatingMetrics } from "../services/reviewService";
import { 
  firestoreDb, 
  isFirebaseActive 
} from "../config/firebase";
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  deleteDoc 
} from "firebase/firestore";

const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  // 1. Initial State from localStorage or Seeds
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem("aura_products");
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [reviews, setReviews] = useState(() => {
    const saved = localStorage.getItem("aura_reviews");
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem("aura_orders");
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("aura_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
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
    if (!isFirebaseActive) {
      localStorage.setItem("aura_products", JSON.stringify(products));
    }
  }, [products]);

  useEffect(() => {
    if (!isFirebaseActive) {
      localStorage.setItem("aura_reviews", JSON.stringify(reviews));
    }
  }, [reviews]);

  useEffect(() => {
    if (!isFirebaseActive) {
      localStorage.setItem("aura_orders", JSON.stringify(orders));
    }
  }, [orders]);

  useEffect(() => {
    localStorage.setItem("aura_settings", JSON.stringify(settings));
  }, [settings]);

  // 2. Real-time Firestore Listeners (if Firebase is configured)
  useEffect(() => {
    if (!isFirebaseActive || !firestoreDb) return;

    console.log("⚡ [AURA] Attaching real-time Firestore listeners...");
    
    // Products Listener
    const unsubProducts = onSnapshot(collection(firestoreDb, "products"), (snapshot) => {
      if (!snapshot.empty) {
        const cloudProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(cloudProducts);
      }
    }, (error) => console.warn("Firestore products listener notice:", error));

    // Reviews Listener
    const unsubReviews = onSnapshot(collection(firestoreDb, "reviews"), (snapshot) => {
      if (!snapshot.empty) {
        const cloudReviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setReviews(cloudReviews);
      }
    }, (error) => console.warn("Firestore reviews listener notice:", error));

    // Orders Listener
    const unsubOrders = onSnapshot(collection(firestoreDb, "orders"), (snapshot) => {
      if (!snapshot.empty) {
        const cloudOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOrders(cloudOrders);
      }
    }, (error) => console.warn("Firestore orders listener notice:", error));

    return () => {
      unsubProducts();
      unsubReviews();
      unsubOrders();
    };
  }, []);

  // 3. Product Management Operations
  const addProduct = async (newProduct) => {
    const product = {
      ...newProduct,
      id: newProduct.id || `frag-${Date.now()}`,
      createdAt: new Date().toISOString(),
      rating: { average: 5.0, count: 1 }
    };

    if (isFirebaseActive && firestoreDb) {
      await setDoc(doc(firestoreDb, "products", product.id), product);
    } else {
      setProducts(prev => [product, ...prev]);
    }
    return product;
  };

  const updateProduct = async (productId, updatedFields) => {
    if (isFirebaseActive && firestoreDb) {
      await updateDoc(doc(firestoreDb, "products", productId), updatedFields);
    } else {
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, ...updatedFields } : p));
    }
  };

  const deleteProduct = async (productId) => {
    if (isFirebaseActive && firestoreDb) {
      await deleteDoc(doc(firestoreDb, "products", productId));
    } else {
      setProducts(prev => prev.filter(p => p.id !== productId));
    }
  };

  // 4. Inventory System Operations
  const updateStock = async (productId, variationId, newStock) => {
    const numStock = Math.max(0, parseInt(newStock) || 0);
    const targetProduct = products.find(p => p.id === productId);
    if (!targetProduct) return;

    const updatedVariations = targetProduct.variations.map(v => 
      v.id === variationId ? { ...v, stock: numStock } : v
    );

    await updateProduct(productId, { variations: updatedVariations });
  };

  // 5. Order Placement & Automated Stock Decrement
  const placeOrder = async (orderData) => {
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
    
    if (isFirebaseActive && firestoreDb) {
      // Write order to Firestore
      await setDoc(doc(firestoreDb, "orders", newOrder.id), newOrder);
      // Update each affected product
      for (const item of orderData.items) {
        const prod = updatedCatalog.find(p => p.id === item.productId);
        if (prod) {
          await updateDoc(doc(firestoreDb, "products", prod.id), { variations: prod.variations });
        }
      }
    } else {
      setOrders(prev => [newOrder, ...prev]);
      setProducts(updatedCatalog);
    }

    return newOrder;
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    if (isFirebaseActive && firestoreDb) {
      await updateDoc(doc(firestoreDb, "orders", orderId), { 
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
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

    if (isFirebaseActive && firestoreDb) {
      await setDoc(doc(firestoreDb, "reviews", newReview.id), newReview);
      // Recalculate metrics if auto-approved
      if (newReview.status === "approved") {
        const metrics = calculateProductRatingMetrics(newReviewsList, newReview.productId);
        await updateDoc(doc(firestoreDb, "products", newReview.productId), { rating: metrics });
      }
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

    if (isFirebaseActive && firestoreDb) {
      await updateDoc(doc(firestoreDb, "reviews", reviewId), { status: newStatus });
      const metrics = calculateProductRatingMetrics(updatedReviews, targetRev.productId);
      await updateDoc(doc(firestoreDb, "products", targetRev.productId), { rating: metrics });
    } else {
      setReviews(updatedReviews);
      const metrics = calculateProductRatingMetrics(updatedReviews, targetRev.productId);
      setProducts(prev => prev.map(p => p.id === targetRev.productId ? { ...p, rating: metrics } : p));
    }
  };

  const deleteReview = async (reviewId) => {
    const targetRev = reviews.find(r => r.id === reviewId);
    const updatedReviews = reviews.filter(r => r.id !== reviewId);

    if (isFirebaseActive && firestoreDb) {
      await deleteDoc(doc(firestoreDb, "reviews", reviewId));
      if (targetRev) {
        const metrics = calculateProductRatingMetrics(updatedReviews, targetRev.productId);
        await updateDoc(doc(firestoreDb, "products", targetRev.productId), { rating: metrics });
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
        isFirebaseActive
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
