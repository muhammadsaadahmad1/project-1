import React, { useState } from "react";
import { 
  X, 
  Star, 
  ShoppingBag, 
  Sparkles, 
  Shield, 
  Droplet, 
  Heart, 
  Layers, 
  Check, 
  MessageCircle 
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { getStockStatus } from "../services/inventoryService";
import { useStore } from "../context/StoreContext";
import { ReviewsSection } from "./ReviewsSection";

export const ProductDetailModal = ({ product, onClose }) => {
  const { addToCart } = useCart();
  const { settings } = useStore();

  const [selectedVarIndex, setSelectedVarIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("pyramid"); // pyramid | details | reviews

  if (!product) return null;

  const variations = product.variations || [];
  const currentVar = variations[selectedVarIndex] || { size: "50ml", price: 150, stock: 0 };
  const stockInfo = getStockStatus(currentVar.stock, settings?.lowStockThreshold || 5);

  const handleAdd = () => {
    addToCart(product, currentVar, quantity);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "1050px",
          padding: 0,
          display: "flex",
          flexDirection: "column",
          position: "relative"
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="btn-icon"
          style={{
            position: "absolute",
            top: "1.2rem",
            right: "1.2rem",
            zIndex: 10,
            background: "rgba(0, 0, 0, 0.6)",
            border: "1px solid var(--border-gold)"
          }}
        >
          <X size={18} />
        </button>

        {/* Top Product Showcase Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          background: "radial-gradient(circle at 30% 20%, #17171c 0%, #0c0c0e 100%)",
          borderBottom: "1px solid rgba(212, 175, 55, 0.15)"
        }}>
          {/* Flacon Visual Stage */}
          <div style={{
            position: "relative",
            minHeight: "420px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2.5rem",
            background: "radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, transparent 70%)"
          }}>
            <img
              src={product.image}
              alt={product.name}
              style={{
                maxHeight: "380px",
                maxWidth: "100%",
                objectFit: "contain",
                borderRadius: "12px",
                boxShadow: "0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(212, 175, 55, 0.15)"
              }}
            />

            <span className={`badge-stock ${stockInfo.badgeClass}`} style={{
              position: "absolute",
              top: "1.5rem",
              left: "1.5rem"
            }}>
              {stockInfo.label}
            </span>
          </div>

          {/* Product Dossier & Buying Area */}
          <div style={{ padding: "2.5rem", display: "flex", flexDirection: "column" }}>
            {/* Header / Brand */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--gold-400)", fontWeight: 600 }}>
                {product.brand}
              </span>
              <span style={{ color: "#52525b" }}>•</span>
              <span style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#a1a1aa" }}>
                {product.gender}
              </span>
            </div>

            <h2 style={{ fontSize: "2.3rem", color: "#fff", lineHeight: 1.15, marginBottom: "0.4rem" }}>
              {product.name}
            </h2>

            <p style={{ fontSize: "0.95rem", color: "var(--gold-300)", marginBottom: "0.9rem" }}>
              {product.subtitle}
            </p>

            {/* Star Rating Badge */}
            {product.rating && (
              <div 
                onClick={() => setActiveTab("reviews")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  marginBottom: "1.4rem",
                  cursor: "pointer"
                }}
              >
                <div style={{ display: "flex", gap: "0.15rem" }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={15} className="star-filled" />
                  ))}
                </div>
                <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "#fff" }}>
                  {product.rating.average}
                </span>
                <span style={{ fontSize: "0.82rem", color: "#a1a1aa", textDecoration: "underline" }}>
                  ({product.rating.count} verified patron reviews)
                </span>
              </div>
            )}

            <p style={{ fontSize: "0.92rem", color: "#d4d4d8", lineHeight: 1.7, marginBottom: "1.8rem" }}>
              {product.description}
            </p>

            {/* Volume Variation Selector */}
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
                <label className="form-label" style={{ marginBottom: 0 }}>
                  Flacon Volume & Decanter Size:
                </label>
                <span style={{ fontSize: "0.78rem", color: currentVar.stock <= 5 && currentVar.stock > 0 ? "var(--gold-400)" : "#9ca3af" }}>
                  {currentVar.stock > 0 ? `Available Inventory: ${currentVar.stock} units` : "Depleted in Atelier"}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: `repeat(${variations.length}, 1fr)`, gap: "0.6rem" }}>
                {variations.map((v, idx) => {
                  const isSelected = selectedVarIndex === idx;
                  const isOOS = v.stock === 0;

                  return (
                    <button
                      key={v.id || v.size}
                      onClick={() => { setSelectedVarIndex(idx); setQuantity(1); }}
                      style={{
                        background: isSelected ? "rgba(212, 175, 55, 0.15)" : "rgba(255, 255, 255, 0.03)",
                        border: `1px solid ${isSelected ? "var(--gold-500)" : "rgba(255, 255, 255, 0.1)"}`,
                        borderRadius: "8px",
                        padding: "0.65rem 0.5rem",
                        textAlign: "center",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                    >
                      <div style={{ fontSize: "0.88rem", fontWeight: 600, color: isSelected ? "var(--gold-300)" : isOOS ? "#52525b" : "#fff" }}>
                        {v.size}
                      </div>
                      <div style={{ fontSize: "0.82rem", color: isSelected ? "#fff" : "#a1a1aa", marginTop: "0.2rem" }}>
                        ${v.price}
                      </div>
                      {isOOS && (
                        <div style={{ fontSize: "0.65rem", color: "#f87171", marginTop: "0.2rem", textTransform: "uppercase" }}>
                          Sold Out
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price & Quantity Controls */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "1.2rem",
              marginTop: "auto",
              paddingTop: "1.5rem",
              borderTop: "1px solid rgba(255, 255, 255, 0.08)"
            }}>
              {/* Quantity incrementer */}
              <div style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid var(--border-gold)",
                borderRadius: "6px",
                overflow: "hidden"
              }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={currentVar.stock === 0 || quantity <= 1}
                  style={{
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "none",
                    color: "#fff",
                    width: "36px",
                    height: "44px",
                    cursor: "pointer",
                    fontSize: "1.1rem"
                  }}
                >
                  -
                </button>
                <span style={{
                  width: "44px",
                  textAlign: "center",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  color: "#fff"
                }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(currentVar.stock, quantity + 1))}
                  disabled={currentVar.stock === 0 || quantity >= currentVar.stock}
                  style={{
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "none",
                    color: "#fff",
                    width: "36px",
                    height: "44px",
                    cursor: "pointer",
                    fontSize: "1.1rem"
                  }}
                >
                  +
                </button>
              </div>

              {/* Total Price & Add to Bag */}
              <div style={{ flex: 1 }}>
                <button
                  className="btn-gold"
                  onClick={handleAdd}
                  disabled={currentVar.stock === 0}
                  style={{
                    width: "100%",
                    padding: "0.85rem",
                    fontSize: "0.95rem"
                  }}
                >
                  <ShoppingBag size={18} />
                  <span>
                    {currentVar.stock === 0 
                      ? "Currently Depleted" 
                      : `Add to Bag • $${currentVar.price * quantity}`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Lower Detail Tabs (Olfactory Pyramid & Real-Time Reviews) */}
        <div style={{ padding: "2rem 2.5rem" }}>
          {/* Navigation Tabs */}
          <div style={{ display: "flex", gap: "1rem", borderBottom: "1px solid rgba(255, 255, 255, 0.1)", paddingBottom: "0.75rem" }}>
            <button
              onClick={() => setActiveTab("pyramid")}
              style={{
                background: "none",
                border: "none",
                color: activeTab === "pyramid" ? "var(--gold-400)" : "#71717a",
                borderBottom: activeTab === "pyramid" ? "2px solid var(--gold-500)" : "2px solid transparent",
                paddingBottom: "0.75rem",
                fontSize: "1rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}
            >
              <Layers size={16} />
              <span>Olfactory Pyramid & Notes</span>
            </button>

            <button
              onClick={() => setActiveTab("reviews")}
              style={{
                background: "none",
                border: "none",
                color: activeTab === "reviews" ? "var(--gold-400)" : "#71717a",
                borderBottom: activeTab === "reviews" ? "2px solid var(--gold-500)" : "2px solid transparent",
                paddingBottom: "0.75rem",
                fontSize: "1rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}
            >
              <Star size={16} />
              <span>Patron Reviews ({product.rating?.count || 0})</span>
            </button>
          </div>

          {/* Tab 1: Olfactory Pyramid */}
          {activeTab === "pyramid" && (
            <div style={{ marginTop: "2rem" }}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "1.5rem"
              }}>
                {/* Top Notes */}
                <div className="glass-panel" style={{ padding: "1.5rem", borderTop: "3px solid #fde293" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                    <Droplet size={18} color="#fde293" />
                    <h4 style={{ fontSize: "1.1rem", color: "#fff" }}>Top Notes</h4>
                  </div>
                  <p style={{ fontSize: "0.78rem", color: "#a1a1aa", marginBottom: "1rem" }}>
                    The initial aromatic impression experienced during the first 15–30 minutes of wear.
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {product.notes?.top.map((note, i) => (
                      <span key={i} style={{
                        background: "rgba(253, 226, 147, 0.1)",
                        border: "1px solid rgba(253, 226, 147, 0.25)",
                        color: "#fde293",
                        padding: "0.3rem 0.75rem",
                        borderRadius: "999px",
                        fontSize: "0.82rem"
                      }}>
                        {note}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Heart Notes */}
                <div className="glass-panel" style={{ padding: "1.5rem", borderTop: "3px solid #d4af37" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                    <Heart size={18} color="#d4af37" />
                    <h4 style={{ fontSize: "1.1rem", color: "#fff" }}>Heart / Sillage Notes</h4>
                  </div>
                  <p style={{ fontSize: "0.78rem", color: "#a1a1aa", marginBottom: "1rem" }}>
                    The opulent core that defines the signature character and blooms for 4–8 hours.
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {product.notes?.heart.map((note, i) => (
                      <span key={i} style={{
                        background: "rgba(212, 175, 55, 0.12)",
                        border: "1px solid rgba(212, 175, 55, 0.3)",
                        color: "var(--gold-300)",
                        padding: "0.3rem 0.75rem",
                        borderRadius: "999px",
                        fontSize: "0.82rem"
                      }}>
                        {note}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Base Notes */}
                <div className="glass-panel" style={{ padding: "1.5rem", borderTop: "3px solid #937118" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                    <Sparkles size={18} color="#b89224" />
                    <h4 style={{ fontSize: "1.1rem", color: "#fff" }}>Base & Drydown</h4>
                  </div>
                  <p style={{ fontSize: "0.78rem", color: "#a1a1aa", marginBottom: "1rem" }}>
                    Deep botanical resins and woods that cling intimately to skin and fabric for up to 24 hours.
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {product.notes?.base.map((note, i) => (
                      <span key={i} style={{
                        background: "rgba(184, 146, 36, 0.12)",
                        border: "1px solid rgba(184, 146, 36, 0.3)",
                        color: "#f5d061",
                        padding: "0.3rem 0.75rem",
                        borderRadius: "999px",
                        fontSize: "0.82rem"
                      }}>
                        {note}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Live Reviews */}
          {activeTab === "reviews" && (
            <ReviewsSection productId={product.id} productName={product.name} />
          )}
        </div>
      </div>
    </div>
  );
};
