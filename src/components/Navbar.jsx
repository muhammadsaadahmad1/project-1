import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, Search, Heart, User, Menu, X, Sparkles } from "lucide-react";
import { useCart } from "../context/CartContext";

export const Navbar = ({
  searchTerm,
  setSearchTerm,
  selectedFamily,
  setSelectedFamily,
  setSelectedProductType,
  setSelectedGender,
  onFamilySelect,
  onProductTypeSelect,
  onSearchSubmit,
  wishlistCount,
  onWishlistClick,
}) => {
  const { totalItemsCount, setIsCartOpen } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
      background: "rgba(255, 250, 245, 0.9)",
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
      borderBottom: "1px solid rgba(121, 74, 35, 0.12)"
    }}>
      <div style={{
        background: "#2a1d17",
        color: "#f5efe7",
        fontSize: "0.72rem",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        borderBottom: "1px solid rgba(255,255,255,0.08)"
      }}>
        <div className="container" style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "0.85rem",
          padding: "0.58rem 1.5rem",
          textAlign: "center"
        }}>
          <Sparkles size={12} color="#e8c79a" />
          <span>Welcome to AURA PARFUMES</span>
          <span style={{ color: "#e8c79a" }}>•</span>
          <span>Enjoy 5% off on your first purchase</span>
        </div>
      </div>

      <div className="container" style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "1rem 1.5rem",
        gap: "1rem"
      }}>
        <button
          className="btn-icon"
          style={{
            display: "inline-flex",
            background: "rgba(121, 74, 35, 0.05)",
            border: "1px solid rgba(121, 74, 35, 0.14)",
            color: "#4d3528"
          }}
          onClick={() => setIsMenuOpen(open => !open)}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
          aria-controls="store-navigation-menu"
        >
          {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        <div
          onClick={() => {
            setSelectedProductType("fragrance");
            setSelectedGender("All");
            setSelectedFamily("All Fragrances");
            setSearchTerm("");
          }}
          style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "0.75rem", flex: 1, justifyContent: "center" }}
        >
          <div style={{
            width: "42px",
            height: "42px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #f4dcc0 0%, #c98850 100%)",
            border: "1px solid rgba(121, 74, 35, 0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 10px 20px rgba(121,74,35,0.15)"
          }}>
            <span style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", color: "#2a1d17", fontWeight: 700 }}>P</span>
          </div>
          <div style={{ textAlign: "center" }}>
            <span style={{
              display: "block",
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(1.2rem, 2.4vw, 2.1rem)",
              lineHeight: 1,
              fontWeight: 600,
              letterSpacing: "0.08em",
              color: "#2a1d17"
            }}>
              AURA PARFUMES
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
          <button className="btn-icon" aria-label={`Wishlist${wishlistCount ? `, ${wishlistCount} saved` : ""}`} onClick={onWishlistClick} style={{ position: "relative", color: "#4d3528", background: "rgba(121,74,35,0.04)" }}>
            <Heart size={18} />
            {wishlistCount > 0 && <span style={{ position: "absolute", top: "-2px", right: "-2px", minWidth: "18px", height: "18px", borderRadius: "999px", background: "#2a1d17", color: "#f8f2e9", fontSize: "0.64rem", display: "grid", placeItems: "center", padding: "0 5px", fontWeight: 700 }}>{wishlistCount}</span>}
          </button>

          <button
            className="btn-icon mobile-search-btn"
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            aria-label="Search products"
            style={{ color: "#4d3528", background: "rgba(121,74,35,0.04)" }}
          >
            <Search size={18} />
          </button>

          <button
            aria-label="Cart"
            onClick={() => setIsCartOpen(true)}
            className="btn-icon"
            style={{ position: "relative", color: "#4d3528", background: "rgba(121,74,35,0.04)" }}
          >
            <ShoppingBag size={18} />
            {totalItemsCount > 0 && (
              <span style={{
                position: "absolute",
                top: "-2px",
                right: "-2px",
                minWidth: "18px",
                height: "18px",
                borderRadius: "999px",
                background: "#2a1d17",
                color: "#f8f2e9",
                fontSize: "0.64rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 5px",
                fontWeight: 700
              }}>
                {totalItemsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div id="store-navigation-menu" className="container" style={{ padding: "0.5rem 1.5rem 1.2rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "1.5rem", borderTop: "1px solid rgba(121,74,35,0.12)", paddingTop: "1rem" }}>
            <div>
              <div style={{ color: "#8b5f3a", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Shop Departments</div>
              {[
                ["All Fragrances", "fragrance", "All"],
                ["Men Perfumes", "fragrance", "Pour Homme"],
                ["Women Perfumes", "fragrance", "Pour Femme"],
                ["Deodorants", "deodorant", "All"],
                ["Body Mist", "body-mist", "All"],
                ["Gift Sets", "gift-set", "All"]
              ].map(([label, productType, gender]) => (
                <button key={label} onClick={() => { setIsMenuOpen(false); onProductTypeSelect(productType, gender); }} style={{ display: "block", width: "100%", padding: "0.5rem 0", border: 0, background: "transparent", color: "#4d3528", textAlign: "left", cursor: "pointer" }}>
                  {label}
                </button>
              ))}
            </div>
            <div>
              <div style={{ color: "#8b5f3a", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Shop by Scent Family</div>
              {fragranceFamilies.map(family => (
                <button key={family} onClick={() => { setIsMenuOpen(false); onFamilySelect(family); }} style={{ display: "block", width: "100%", padding: "0.5rem 0", border: 0, background: "transparent", color: "#4d3528", textAlign: "left", cursor: "pointer" }}>
                  {family}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="desktop-search">
        <div className="container" style={{ padding: "0 1.5rem 0.75rem" }}>
          <form onSubmit={(event) => { event.preventDefault(); onSearchSubmit(); }} role="search" style={{ maxWidth: "520px", margin: "0 auto", position: "relative" }}>
            <Search size={16} color="#7d4d2b" style={{ position: "absolute", left: "0.9rem", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="search"
              aria-label="Search fragrances and products"
              placeholder="Search fragrances, notes, or products..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              style={{ width: "100%", background: "rgba(255,255,255,0.7)", border: "1px solid rgba(121,74,35,0.2)", borderRadius: "999px", padding: "0.65rem 1rem 0.65rem 2.5rem", color: "#291d17", fontSize: "0.88rem", outline: "none" }}
            />
          </form>
        </div>
      </div>

      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.5rem 0 0.75rem 0",
        overflowX: "auto",
        whiteSpace: "nowrap",
        scrollbarWidth: "none",
        borderTop: "1px solid rgba(121,74,35,0.08)"
      }}>
        <div className="container" style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {fragranceFamilies.map(fam => {
            const isSelected = selectedFamily === fam;
            return (
              <button
                key={fam}
                onClick={() => onFamilySelect(fam)}
                style={{
                  background: isSelected ? "#2a1d17" : "transparent",
                  color: isSelected ? "#f7f1ea" : "#5f473d",
                  border: `1px solid ${isSelected ? "#2a1d17" : "rgba(121,74,35,0.15)"}`,
                  padding: "0.45rem 0.9rem",
                  borderRadius: "999px",
                  fontSize: "0.76rem",
                  fontWeight: isSelected ? 600 : 500,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  flexShrink: 0
                }}
              >
                {fam}
              </button>
            );
          })}
        </div>
      </div>

      {showMobileSearch && (
        <div style={{ padding: "0 1.5rem 0.9rem 1.5rem", background: "rgba(255, 255, 255, 0.65)" }}>
          <div style={{ position: "relative" }}>
            <Search size={16} color="#7d4d2b" style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search notes, names or scent families..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(event) => { if (event.key === "Enter") onSearchSubmit(); }}
              autoFocus
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.7)",
                border: "1px solid rgba(121,74,35,0.2)",
                borderRadius: "999px",
                padding: "0.7rem 2.8rem 0.7rem 2.6rem",
                color: "#291d17",
                fontSize: "0.9rem",
                outline: "none"
              }}
            />
            {searchTerm && (
              <X
                size={15}
                color="#5f473d"
                onClick={() => setSearchTerm("")}
                style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", cursor: "pointer" }}
              />
            )}
          </div>
        </div>
      )}

      <style>{`
        .desktop-search { display: none; }
        @media (min-width: 768px) {
          .desktop-search { display: block; }
          .mobile-search-btn { display: none !important; }
        }
      `}</style>
    </header>
  );
};
