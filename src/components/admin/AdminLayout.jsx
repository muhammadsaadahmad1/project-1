import React, { useState } from "react";
import { 
  X, 
  Package, 
  Layers, 
  ShoppingBag, 
  Star, 
  Settings, 
  AlertTriangle, 
  Sparkles, 
  LogOut, 
  Smartphone,
  ExternalLink
} from "lucide-react";
import { useStore } from "../../context/StoreContext";
import { useAuth } from "../../context/AuthContext";
import { ProductManager } from "./ProductManager";
import { InventoryManager } from "./InventoryManager";
import { OrderManager } from "./OrderManager";
import { ReviewModerator } from "./ReviewModerator";
import { FirebaseSettingsModal } from "./FirebaseSettingsModal";

import { AdminPasscodeModal } from "../AdminPasscodeModal";

export const AdminLayout = ({ isOpen, onClose }) => {
  const { products, orders, reviews, lowStockAlerts, isFirebaseActive } = useStore();
  const { isAdmin, logoutAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState("orders"); // orders | inventory | products | reviews | settings

  if (!isOpen) return null;

  // Enforce passcode protection
  if (!isAdmin) {
    return <AdminPasscodeModal isOpen={true} onClose={onClose} onSuccess={() => {}} />;
  }

  // Key KPI metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== "rejected" ? o.total : 0), 0);
  const pendingOrdersCount = orders.filter(o => o.status === "pending").length;
  const lowStockCount = lowStockAlerts.length;
  const pendingReviewsCount = reviews.filter(r => r.status === "pending").length;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 200,
      background: "#09090b",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden"
    }}>
      {/* Top Admin Header */}
      <header style={{
        background: "#111114",
        borderBottom: "1px solid var(--border-gold)",
        padding: "0.85rem 1.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "1rem"
      }}>
        {/* Brand / Admin Title */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{
            background: "var(--gold-gradient)",
            color: "#000",
            fontWeight: 700,
            padding: "0.25rem 0.6rem",
            borderRadius: "4px",
            fontSize: "0.75rem",
            letterSpacing: "0.1em"
          }}>
            ATELIER ADMIN
          </div>

          <div>
            <h2 style={{ fontSize: "1.2rem", color: "#fff", margin: 0, lineHeight: 1.1 }}>
              AURA PARFUMS Command Portal
            </h2>
            <span style={{ fontSize: "0.72rem", color: "#71717a" }}>
              Backend: {isFirebaseActive ? <strong style={{ color: "#34d399" }}>⚡ Cloud Firestore Live</strong> : <span style={{ color: "var(--gold-300)" }}>Local Reactive Engine</span>}
            </span>
          </div>
        </div>

        {/* Live KPI Metric Pills */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
          <div style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            padding: "0.35rem 0.75rem",
            borderRadius: "6px",
            fontSize: "0.78rem"
          }}>
            <span style={{ color: "#71717a" }}>Revenue: </span>
            <strong style={{ color: "var(--gold-300)" }}>${totalRevenue.toLocaleString()}</strong>
          </div>

          <div 
            onClick={() => setActiveTab("orders")}
            style={{
              background: pendingOrdersCount > 0 ? "rgba(245, 158, 11, 0.15)" : "rgba(255, 255, 255, 0.03)",
              border: `1px solid ${pendingOrdersCount > 0 ? "rgba(245, 158, 11, 0.4)" : "rgba(255, 255, 255, 0.08)"}`,
              padding: "0.35rem 0.75rem",
              borderRadius: "6px",
              fontSize: "0.78rem",
              cursor: "pointer"
            }}
          >
            <span style={{ color: pendingOrdersCount > 0 ? "#fbbf24" : "#71717a" }}>Orders: </span>
            <strong style={{ color: pendingOrdersCount > 0 ? "#fbbf24" : "#fff" }}>
              {orders.length} ({pendingOrdersCount} Pending)
            </strong>
          </div>

          <div 
            onClick={() => setActiveTab("inventory")}
            style={{
              background: lowStockCount > 0 ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.1)",
              border: `1px solid ${lowStockCount > 0 ? "rgba(239, 68, 68, 0.4)" : "rgba(16, 185, 129, 0.3)"}`,
              padding: "0.35rem 0.75rem",
              borderRadius: "6px",
              fontSize: "0.78rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.35rem"
            }}
          >
            {lowStockCount > 0 && <AlertTriangle size={12} color="#f87171" />}
            <span style={{ color: lowStockCount > 0 ? "#f87171" : "#34d399" }}>Low Stock: </span>
            <strong style={{ color: lowStockCount > 0 ? "#f87171" : "#34d399" }}>
              {lowStockCount} Items
            </strong>
          </div>
        </div>

        {/* Right Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button 
            onClick={() => { logoutAdmin(); onClose(); }}
            style={{
              background: "none",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#a1a1aa",
              padding: "0.45rem 0.8rem",
              borderRadius: "6px",
              fontSize: "0.76rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.35rem"
            }}
          >
            <LogOut size={13} />
            <span>Lock</span>
          </button>

          <button 
            className="btn-icon"
            onClick={onClose}
            title="Return to Boutique"
            style={{ width: "36px", height: "36px" }}
          >
            <X size={18} />
          </button>
        </div>
      </header>

      {/* Admin Tab Navigation Bar */}
      <nav style={{
        background: "#0c0c0e",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        padding: "0 1.5rem",
        display: "flex",
        gap: "0.5rem",
        overflowX: "auto"
      }}>
        {[
          { id: "orders", label: "Orders & WhatsApp Hub", icon: ShoppingBag, count: pendingOrdersCount },
          { id: "inventory", label: "Inventory & Stock Matrix", icon: Layers, count: lowStockCount, isAlert: lowStockCount > 0 },
          { id: "products", label: "Product Management", icon: Package, count: products.length },
          { id: "reviews", label: "Reviews & Ratings", icon: Star, count: pendingReviewsCount },
          { id: "settings", label: "Firebase & System Settings", icon: Settings }
        ].map(tab => {
          const isSelected = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: "none",
                border: "none",
                borderBottom: isSelected ? "2px solid var(--gold-500)" : "2px solid transparent",
                color: isSelected ? "var(--gold-300)" : "#a1a1aa",
                padding: "0.85rem 1rem",
                fontSize: "0.85rem",
                fontWeight: isSelected ? 600 : 400,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                whiteSpace: "nowrap",
                transition: "all 0.15s"
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span style={{
                  background: tab.isAlert ? "#ef4444" : isSelected ? "rgba(212, 175, 55, 0.2)" : "rgba(255, 255, 255, 0.08)",
                  color: tab.isAlert ? "#fff" : isSelected ? "var(--gold-300)" : "#a1a1aa",
                  fontSize: "0.68rem",
                  padding: "0.1rem 0.45rem",
                  borderRadius: "999px",
                  fontWeight: 600
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Main Tab Content Stage */}
      <main style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>
        <div className="container" style={{ maxWidth: "1400px", padding: 0 }}>
          {activeTab === "orders" && <OrderManager />}
          {activeTab === "inventory" && <InventoryManager onGoToProducts={() => setActiveTab("products")} />}
          {activeTab === "products" && <ProductManager />}
          {activeTab === "reviews" && <ReviewModerator />}
          {activeTab === "settings" && <FirebaseSettingsModal />}
        </div>
      </main>
    </div>
  );
};
