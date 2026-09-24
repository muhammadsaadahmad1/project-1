import React from "react";
import { 
  X, 
  ShoppingBag, 
  Trash2, 
  ArrowRight, 
  Sparkles, 
  Truck, 
  ShieldCheck 
} from "lucide-react";
import { useCart } from "../context/CartContext";

export const CartDrawer = () => {
  const { 
    items, 
    isCartOpen, 
    setIsCartOpen, 
    setIsCheckoutOpen, 
    updateQuantity, 
    removeItem, 
    subtotal, 
    shipping, 
    total,
    freeShippingThreshold,
    amountToFreeShipping,
    freeShippingProgress 
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="modal-backdrop" onClick={() => setIsCartOpen(false)} style={{ justifyContent: "flex-end", padding: 0 }}>
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "480px",
          height: "100vh",
          background: "var(--bg-surface)",
          borderLeft: "1px solid var(--border-gold)",
          display: "flex",
          flexDirection: "column",
          boxShadow: "-10px 0 30px rgba(0, 0, 0, 0.8)",
          animation: "slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
      >
        {/* Header */}
        <div style={{
          padding: "1.5rem",
          borderBottom: "1px solid rgba(212, 175, 55, 0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(9, 9, 11, 0.6)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <ShoppingBag size={20} color="var(--gold-400)" />
            <h3 style={{ fontSize: "1.3rem", color: "#fff", margin: 0 }}>
              Your Atelier Bag ({items.length})
            </h3>
          </div>

          <button 
            className="btn-icon" 
            onClick={() => setIsCartOpen(false)}
            style={{ width: "36px", height: "36px" }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div style={{
          padding: "0.9rem 1.5rem",
          background: "rgba(212, 175, 55, 0.05)",
          borderBottom: "1px solid rgba(212, 175, 55, 0.1)"
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.4rem", fontSize: "0.78rem" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#d4d4d8" }}>
              <Truck size={14} color="#d4af37" />
              {amountToFreeShipping === 0 
                ? <strong style={{ color: "#34d399" }}>Complimentary Express Courier Unlocked!</strong>
                : <span>Add <strong style={{ color: "var(--gold-300)" }}>${amountToFreeShipping}</strong> more for Free Courier</span>
              }
            </span>
            <span style={{ color: "#a1a1aa" }}>{freeShippingProgress}%</span>
          </div>

          <div style={{
            width: "100%",
            height: "5px",
            background: "rgba(255, 255, 255, 0.08)",
            borderRadius: "999px",
            overflow: "hidden"
          }}>
            <div style={{
              width: `${freeShippingProgress}%`,
              height: "100%",
              background: "var(--gold-gradient)",
              transition: "width 0.3s ease"
            }} />
          </div>
        </div>

        {/* Items List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>
          {items.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem 1rem", color: "#71717a" }}>
              <ShoppingBag size={48} color="#3f3f46" style={{ margin: "0 auto 1rem auto" }} />
              <h4 style={{ color: "#fff", fontSize: "1.1rem", marginBottom: "0.5rem" }}>Your Bag is Empty</h4>
              <p style={{ fontSize: "0.85rem", marginBottom: "1.5rem" }}>
                Select an artisanal elixir from our catalogue to experience pure luxury.
              </p>
              <button className="btn-outline" onClick={() => setIsCartOpen(false)}>
                Explore Perfumes
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {items.map((item) => (
                <div 
                  key={item.key} 
                  className="glass-panel"
                  style={{
                    padding: "1rem",
                    display: "flex",
                    gap: "1rem",
                    alignItems: "center",
                    background: "rgba(18, 18, 22, 0.6)"
                  }}
                >
                  {/* Thumbnail */}
                  <img
                    src={item.image}
                    alt={item.productName}
                    style={{
                      width: "68px",
                      height: "76px",
                      objectFit: "cover",
                      borderRadius: "6px",
                      border: "1px solid rgba(255, 255, 255, 0.1)"
                    }}
                  />

                  {/* Details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: "0.7rem", textTransform: "uppercase", color: "var(--gold-400)", letterSpacing: "0.08em" }}>
                      {item.brand}
                    </span>
                    <h5 style={{ fontSize: "0.95rem", color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {item.productName}
                    </h5>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.2rem" }}>
                      <span style={{
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "3px",
                        padding: "0.1rem 0.4rem",
                        fontSize: "0.72rem",
                        color: "#e4e4e7"
                      }}>
                        {item.size}
                      </span>
                      <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#fff" }}>
                        ${item.price}
                      </span>
                    </div>

                    {/* Quantity controls */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "0.6rem" }}>
                      <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--border-gold)", borderRadius: "4px" }}>
                        <button
                          onClick={() => updateQuantity(item.key, item.quantity - 1)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#fff",
                            width: "26px",
                            height: "26px",
                            cursor: "pointer"
                          }}
                        >
                          -
                        </button>
                        <span style={{ fontSize: "0.82rem", fontWeight: 600, width: "26px", textAlign: "center", color: "#fff" }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.key, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                          style={{
                            background: "none",
                            border: "none",
                            color: item.quantity >= item.maxStock ? "#52525b" : "#fff",
                            width: "26px",
                            height: "26px",
                            cursor: item.quantity >= item.maxStock ? "not-allowed" : "pointer"
                          }}
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.key)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#71717a",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center"
                        }}
                        title="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with Totals & Checkout */}
        {items.length > 0 && (
          <div style={{
            padding: "1.5rem",
            background: "rgba(10, 10, 12, 0.95)",
            borderTop: "1px solid rgba(212, 175, 55, 0.15)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.88rem", color: "#a1a1aa" }}>
              <span>Subtotal</span>
              <span style={{ color: "#fff", fontWeight: 500 }}>${subtotal}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.85rem", fontSize: "0.88rem", color: "#a1a1aa" }}>
              <span>Express Courier Shipping</span>
              <span style={{ color: shipping === 0 ? "#34d399" : "#fff", fontWeight: 500 }}>
                {shipping === 0 ? "Complimentary" : `$${shipping}`}
              </span>
            </div>

            <div style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "1.5rem",
              paddingTop: "0.75rem",
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
              fontSize: "1.2rem",
              fontWeight: 600,
              color: "#fff"
            }}>
              <span>Total</span>
              <span className="gold-text">${total}</span>
            </div>

            <button
              className="btn-gold"
              onClick={() => {
                setIsCartOpen(false);
                setIsCheckoutOpen(true);
              }}
              style={{ width: "100%", padding: "0.9rem", fontSize: "0.95rem" }}
            >
              <span>Proceed to Bespoke Checkout</span>
              <ArrowRight size={16} />
            </button>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginTop: "1rem", fontSize: "0.72rem", color: "#71717a" }}>
              <ShieldCheck size={14} color="#10b981" />
              <span>Encrypted Checkout • Real-time Stock Allocation</span>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};
