import React, { useState } from "react";
import { 
  ShoppingBag, 
  Search, 
  User, 
  ShieldCheck, 
  Clock, 
  Sparkles, 
  X,
  SlidersHorizontal
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export const Navbar = ({ 
  searchTerm, 
  setSearchTerm, 
  selectedFamily, 
  setSelectedFamily, 
  onOpenAdmin,
  onOpenOrderHistory,
  onOpenAuth
}) => {
  const { totalItemsCount, setIsCartOpen, subtotal } = useCart();
  const { currentUser, isAdmin } = useAuth();
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const fragranceFamilies = [
    "All Fragrances",
    "Woody Oriental",
    "Floral",
    "Woody",
    "Citrus Fresh",
    "Oriental",
    "Gourmand"
  ];

  return (
    <header style={{
      position: "sticky",
      top: 0,
      zIndex: 100,
      background: "rgba(9, 9, 11, 0.9)",
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
      borderBottom: "1px solid rgba(212, 175, 55, 0.18)"
    }}>
      {/* Top Luxury Announcement Bar */}
      <div style={{
        background: "linear-gradient(90deg, #111114 0%, #1f1a10 50%, #111114 100%)",
        borderBottom: "1px solid rgba(212, 175, 55, 0.12)",
        padding: "0.35rem 1rem",
        textAlign: "center",
        fontSize: "0.76rem",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "#fde293",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem"
      }}>
        <Sparkles size={12} color="#d4af37" />
        <span>Complimentary Express Courier on all orders over $150 • Handcrafted Scent Samples Included</span>
        <Sparkles size={12} color="#d4af37" />
      </div>

      {/* Main Navbar */}
      <div className="container" style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "1rem 1.5rem",
        gap: "1.5rem"
      }}>
        {/* Brand Logo */}
        <div 
          onClick={() => { setSelectedFamily("All Fragrances"); setSearchTerm(""); }}
          style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "0.75rem" }}
        >
          <div style={{
            width: "38px",
            height: "38px",
            borderRadius: "8px",
            background: "linear-gradient(135deg, #1a1a1f 0%, #09090b 100%)",
            border: "1px solid var(--gold-500)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 15px rgba(212, 175, 55, 0.2)"
          }}>
            <span style={{ fontFamily: "var(--font-serif)", fontSize: "1.4rem", color: "var(--gold-400)", fontWeight: "600" }}>A</span>
          </div>
          <div>
            <span style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.55rem",
              fontWeight: 600,
              letterSpacing: "0.18em",
              color: "#fff",
              display: "block",
              lineHeight: 1.1
            }}>
              AURA <span className="gold-text">PARFUMS</span>
            </span>
            <span style={{
              fontSize: "0.62rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#a1a1aa",
              display: "block"
            }}>
              Haute Parfumerie • Paris
            </span>
          </div>
        </div>

        {/* Desktop Search Bar */}
        <div style={{
          flex: 1,
          maxWidth: "420px",
          position: "relative",
          display: "none"
        }} className="desktop-search">
          <Search size={16} color="#99701e" style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search notes (e.g., Oud, Vanilla, Bergamot, Rose)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(212, 175, 55, 0.22)",
              borderRadius: "999px",
              padding: "0.6rem 2.5rem 0.6rem 2.6rem",
              color: "#fff",
              fontSize: "0.85rem",
              outline: "none"
            }}
          />
          {searchTerm && (
            <X 
              size={15} 
              color="#a1a1aa" 
              onClick={() => setSearchTerm("")}
              style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", cursor: "pointer" }} 
            />
          )}
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
          {/* Mobile Search Toggle */}
          <button 
            className="btn-icon mobile-search-btn"
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            title="Search Fragrances"
          >
            <Search size={18} />
          </button>

          {/* Patron Orders / Tracking */}
          <button 
            className="btn-icon"
            onClick={onOpenOrderHistory}
            title="Track Orders"
            style={{ position: "relative" }}
          >
            <Clock size={18} />
          </button>

          {/* Patron Account / Auth */}
          <button 
            className="btn-icon"
            onClick={onOpenAuth}
            title={currentUser?.displayName || "Sign In"}
          >
            <User size={18} />
          </button>

          {/* Admin Atelier Portal */}
          <button 
            onClick={onOpenAdmin}
            style={{
              background: isAdmin ? "rgba(212, 175, 55, 0.2)" : "rgba(255, 255, 255, 0.04)",
              border: `1px solid ${isAdmin ? "var(--gold-500)" : "rgba(255, 255, 255, 0.12)"}`,
              color: isAdmin ? "var(--gold-400)" : "#d4d4d8",
              padding: "0.5rem 0.85rem",
              borderRadius: "6px",
              fontSize: "0.78rem",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              cursor: "pointer",
              transition: "0.2s"
            }}
          >
            <ShieldCheck size={14} color={isAdmin ? "#d4af37" : "#a1a1aa"} />
            <span style={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {isAdmin ? "Admin Portal" : "Admin"}
            </span>
          </button>

          {/* Shopping Bag Button */}
          <button 
            onClick={() => setIsCartOpen(true)}
            style={{
              background: "linear-gradient(135deg, #222227 0%, #151518 100%)",
              border: "1px solid var(--border-gold-strong)",
              color: "#fff",
              padding: "0.5rem 1rem",
              borderRadius: "999px",
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              cursor: "pointer",
              boxShadow: "0 4px 15px rgba(0, 0, 0, 0.4)",
              transition: "all 0.2s"
            }}
          >
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <ShoppingBag size={17} color="#fde293" />
              {totalItemsCount > 0 && (
                <span style={{
                  position: "absolute",
                  top: "-8px",
                  right: "-10px",
                  background: "var(--gold-500)",
                  color: "#000",
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid #111"
                }}>
                  {totalItemsCount}
                </span>
              )}
            </div>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--gold-300)" }}>
              ${subtotal}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Search Bar Dropdown */}
      {showMobileSearch && (
        <div style={{ padding: "0.75rem 1.5rem", background: "#111114", borderTop: "1px solid var(--border-subtle)" }}>
          <div style={{ position: "relative" }}>
            <Search size={16} color="#99701e" style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search notes, names or scent families..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
              style={{
                width: "100%",
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid var(--border-gold)",
                borderRadius: "6px",
                padding: "0.7rem 2.5rem 0.7rem 2.6rem",
                color: "#fff",
                fontSize: "0.9rem",
                outline: "none"
              }}
            />
          </div>
        </div>
      )}

      {/* Scent Family Filter Bar */}
      <div style={{
        background: "rgba(14, 14, 17, 0.7)",
        borderTop: "1px solid rgba(255, 255, 255, 0.05)",
        overflowX: "auto",
        scrollbarWidth: "none"
      }}>
        <div className="container" style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.5rem 1.5rem",
          whiteSpace: "nowrap"
        }}>
          <span style={{ fontSize: "0.72rem", textTransform: "uppercase", color: "#71717a", letterSpacing: "0.08em", marginRight: "0.5rem" }}>
            Olfactory Families:
          </span>
          {fragranceFamilies.map(fam => {
            const isSelected = selectedFamily === fam;
            return (
              <button
                key={fam}
                onClick={() => setSelectedFamily(fam)}
                style={{
                  background: isSelected ? "rgba(212, 175, 55, 0.18)" : "transparent",
                  color: isSelected ? "var(--gold-300)" : "#a1a1aa",
                  border: `1px solid ${isSelected ? "var(--gold-500)" : "transparent"}`,
                  padding: "0.3rem 0.85rem",
                  borderRadius: "999px",
                  fontSize: "0.78rem",
                  fontWeight: isSelected ? 600 : 400,
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                {fam}
              </button>
            );
          })}
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .desktop-search { display: block !important; }
          .mobile-search-btn { display: none !important; }
        }
      `}</style>
    </header>
  );
};
