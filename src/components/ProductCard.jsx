import React, { useState } from "react";
import { Star, ShoppingBag, Eye, Sparkles } from "lucide-react";
import { useCart } from "../context/CartContext";
import { getStockStatus } from "../services/inventoryService";
import { useStore } from "../context/StoreContext";

export const ProductCard = ({ product, onSelectProduct }) => {
  const { addToCart } = useCart();
  const { settings } = useStore();

  // First variation as default
  const [selectedVariationIndex, setSelectedVariationIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const variations = product.variations || [];
  const currentVariation = variations[selectedVariationIndex] || { size: "50ml", price: 150, stock: 0 };
  const stockInfo = getStockStatus(currentVariation.stock, settings?.lowStockThreshold || 5);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product, currentVariation, 1);
  };

  return (
    <div 
      className="glass-panel"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelectProduct(product)}
      style={{
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        transform: isHovered ? "translateY(-6px)" : "none",
        borderColor: isHovered ? "var(--border-gold-strong)" : "var(--border-gold)",
        boxShadow: isHovered ? "var(--shadow-gold), var(--shadow-deep)" : "var(--shadow-sm)"
      }}
    >
      {/* Product Image Stage */}
      <div style={{
        position: "relative",
        paddingTop: "115%", // Aspect ratio
        background: "radial-gradient(circle at 50% 50%, #1c1c22 0%, #0d0d0f 100%)",
        overflow: "hidden"
      }}>
        <img
          src={product.image}
          alt={product.name}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
            transform: isHovered ? "scale(1.06)" : "scale(1)",
            opacity: currentVariation.stock === 0 ? 0.6 : 1
          }}
        />

        {/* Badges on Image */}
        <div style={{
          position: "absolute",
          top: "1rem",
          left: "1rem",
          right: "1rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 2
        }}>
          <span style={{
            background: "rgba(9, 9, 11, 0.82)",
            backdropFilter: "blur(8px)",
            padding: "0.25rem 0.6rem",
            borderRadius: "4px",
            fontSize: "0.68rem",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--gold-300)",
            border: "1px solid rgba(212, 175, 55, 0.3)"
          }}>
            {product.fragranceFamily}
          </span>

          <span className={`badge-stock ${stockInfo.badgeClass}`}>
            {stockInfo.label}
          </span>
        </div>

        {/* Quick View Pill on Hover */}
        <div style={{
          position: "absolute",
          bottom: "1rem",
          left: "50%",
          transform: `translateX(-50%) translateY(${isHovered ? "0" : "15px"})`,
          opacity: isHovered ? 1 : 0,
          transition: "all 0.3s ease",
          zIndex: 2
        }}>
          <span style={{
            background: "rgba(9, 9, 11, 0.85)",
            backdropFilter: "blur(10px)",
            border: "1px solid var(--gold-500)",
            color: "#fff",
            padding: "0.45rem 0.9rem",
            borderRadius: "999px",
            fontSize: "0.78rem",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: "0.4rem"
          }}>
            <Eye size={13} color="#d4af37" />
            <span>Discover Olfactory Notes</span>
          </span>
        </div>
      </div>

      {/* Details Container */}
      <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", flex: 1 }}>
        {/* Brand & Rating */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
          <span style={{ fontSize: "0.74rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "#a1a1aa" }}>
            {product.brand} • {product.gender}
          </span>

          {product.rating && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <Star size={13} className="star-filled" />
              <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--gold-300)" }}>
                {product.rating.average}
              </span>
              <span style={{ fontSize: "0.72rem", color: "#71717a" }}>
                ({product.rating.count})
              </span>
            </div>
          )}
        </div>

        {/* Fragrance Name */}
        <h3 style={{
          fontSize: "1.35rem",
          color: "#fff",
          marginBottom: "0.4rem",
          lineHeight: 1.2
        }}>
          {product.name}
        </h3>

        {/* Subtitle / Concentration */}
        <p style={{ fontSize: "0.8rem", color: "#9ca3af", marginBottom: "0.85rem" }}>
          {product.subtitle}
        </p>

        {/* Top Olfactory Notes Chips */}
        {product.notes && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginBottom: "1.1rem" }}>
            {product.notes.top.slice(0, 3).map((note, i) => (
              <span key={i} style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
                borderRadius: "4px",
                padding: "0.15rem 0.45rem",
                fontSize: "0.68rem",
                color: "#d4d4d8"
              }}>
                {note}
              </span>
            ))}
          </div>
        )}

        <div style={{ marginTop: "auto" }}>
          {/* Size / Volume Variations Selector */}
          <div style={{ marginBottom: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
              <span style={{ fontSize: "0.7rem", textTransform: "uppercase", color: "#71717a", letterSpacing: "0.06em" }}>
                Select Flacon Volume:
              </span>
              <span style={{ fontSize: "0.72rem", color: currentVariation.stock <= 5 && currentVariation.stock > 0 ? "var(--gold-400)" : "#a1a1aa" }}>
                Stock: {currentVariation.stock} left
              </span>
            </div>

            <div style={{ display: "flex", gap: "0.4rem" }} onClick={(e) => e.stopPropagation()}>
              {variations.map((v, index) => {
                const isSelected = selectedVariationIndex === index;
                const isOutOfStock = v.stock === 0;

                return (
                  <button
                    key={v.id || v.size}
                    onClick={() => setSelectedVariationIndex(index)}
                    style={{
                      flex: 1,
                      background: isSelected 
                        ? "rgba(212, 175, 55, 0.18)" 
                        : isOutOfStock 
                          ? "rgba(255, 255, 255, 0.02)" 
                          : "rgba(255, 255, 255, 0.04)",
                      border: `1px solid ${isSelected ? "var(--gold-500)" : "rgba(255, 255, 255, 0.1)"}`,
                      color: isSelected ? "var(--gold-300)" : isOutOfStock ? "#52525b" : "#d4d4d8",
                      padding: "0.35rem 0.25rem",
                      borderRadius: "6px",
                      fontSize: "0.74rem",
                      fontWeight: isSelected ? 600 : 400,
                      cursor: "pointer",
                      textDecoration: isOutOfStock ? "line-through" : "none",
                      transition: "all 0.15s"
                    }}
                  >
                    {v.size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price & Add to Bag Row */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "0.85rem",
            borderTop: "1px solid rgba(255, 255, 255, 0.06)"
          }}>
            <div>
              <span style={{ fontSize: "0.7rem", color: "#71717a", display: "block", textTransform: "uppercase" }}>
                Price ({currentVariation.size})
              </span>
              <span style={{ fontSize: "1.35rem", fontWeight: 600, color: "#fff" }}>
                ${currentVariation.price}
              </span>
            </div>

            <button
              className="btn-gold"
              onClick={handleAddToCart}
              disabled={currentVariation.stock === 0}
              style={{
                padding: "0.6rem 1.1rem",
                fontSize: "0.8rem",
                gap: "0.45rem"
              }}
            >
              <ShoppingBag size={14} />
              <span>{currentVariation.stock === 0 ? "Depleted" : "Add to Bag"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
