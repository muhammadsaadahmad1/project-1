import React, { useState, useMemo } from "react";
import { 
  StoreProvider, 
  useStore 
} from "./context/StoreContext";
import { 
  CartProvider 
} from "./context/CartContext";
import { 
  AuthProvider, 
  useAuth 
} from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { HeroBanner } from "./components/HeroBanner";
import { ProductCard } from "./components/ProductCard";
import { ProductDetailModal } from "./components/ProductDetailModal";
import { CartDrawer } from "./components/CartDrawer";
import { CheckoutModal } from "./components/CheckoutModal";
import { OrderSuccessModal } from "./components/OrderSuccessModal";
import { OrderHistoryModal } from "./components/OrderHistoryModal";
import { AuthModal } from "./components/AuthModal";
import { AdminLayout } from "./components/admin/AdminLayout";
import { AdminPasscodeModal } from "./components/AdminPasscodeModal";
import { 
  SlidersHorizontal, 
  Sparkles, 
  Search, 
  Filter, 
  ArrowUpDown, 
  ShieldCheck, 
  HelpCircle, 
  ExternalLink 
} from "lucide-react";

const MainStorefront = () => {
  const { products, settings } = useStore();
  const { isAdmin } = useAuth();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFamily, setSelectedFamily] = useState("All Fragrances");
  const [selectedGender, setSelectedGender] = useState("All");
  const [sortBy, setSortBy] = useState("featured"); // featured | rating | price-asc | price-desc
  const [maxPriceFilter, setMaxPriceFilter] = useState(350);

  // Modal states
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminPasscodeModalOpen, setIsAdminPasscodeModalOpen] = useState(false);

  const handleOpenAdmin = () => {
    if (!isAdmin) {
      setIsAdminPasscodeModalOpen(true);
    } else {
      setIsAdminOpen(true);
    }
  };

  // Filtering & Sorting
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Scent family filter
      const matchesFamily = 
        selectedFamily === "All Fragrances" || 
        p.fragranceFamily.toLowerCase().includes(selectedFamily.toLowerCase());

      // Gender filter
      const matchesGender = 
        selectedGender === "All" || 
        p.gender?.toLowerCase() === selectedGender.toLowerCase();

      // Search term
      const term = searchTerm.toLowerCase().trim();
      const notesList = [
        ...(p.notes?.top || []),
        ...(p.notes?.heart || []),
        ...(p.notes?.base || [])
      ].join(" ").toLowerCase();

      const matchesSearch = 
        !term ||
        p.name.toLowerCase().includes(term) ||
        p.brand.toLowerCase().includes(term) ||
        p.fragranceFamily.toLowerCase().includes(term) ||
        notesList.includes(term);

      // Price filter (check minimum variation price)
      const lowestPrice = Math.min(...(p.variations?.map(v => v.price) || [0]));
      const matchesPrice = lowestPrice <= maxPriceFilter;

      return matchesFamily && matchesGender && matchesSearch && matchesPrice;
    }).sort((a, b) => {
      if (sortBy === "rating") {
        return (b.rating?.average || 0) - (a.rating?.average || 0);
      }
      if (sortBy === "price-asc") {
        const minA = Math.min(...(a.variations?.map(v => v.price) || [0]));
        const minB = Math.min(...(b.variations?.map(v => v.price) || [0]));
        return minA - minB;
      }
      if (sortBy === "price-desc") {
        const maxA = Math.max(...(a.variations?.map(v => v.price) || [0]));
        const maxB = Math.max(...(b.variations?.map(v => v.price) || [0]));
        return maxB - maxA;
      }
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });
  }, [products, searchTerm, selectedFamily, selectedGender, sortBy, maxPriceFilter]);

  const handleExploreScroll = () => {
    const el = document.getElementById("catalog-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Navbar */}
      <Navbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedFamily={selectedFamily}
        setSelectedFamily={setSelectedFamily}
        onOpenAdmin={handleOpenAdmin}
        onOpenOrderHistory={() => setIsOrderHistoryOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Hero Visual Showcase */}
      <HeroBanner onExploreClick={handleExploreScroll} />

      {/* Main Catalog Section */}
      <section id="catalog-section" style={{ padding: "3.5rem 0", flex: 1 }}>
        <div className="container">
          {/* Section Header & Sub-filters */}
          <div style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1.5rem",
            marginBottom: "2rem"
          }}>
            <div>
              <span style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--gold-400)", fontWeight: 600 }}>
                Haute Parfumerie Catalog
              </span>
              <h2 style={{ fontSize: "2.4rem", color: "#fff", lineHeight: 1.15, marginTop: "0.2rem" }}>
                Curated Flacons & Elixirs
              </h2>
            </div>

            {/* Filter & Sort Controls */}
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
              {/* Gender classification pills */}
              <div style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "999px",
                padding: "0.25rem",
                display: "flex",
                gap: "0.2rem"
              }}>
                {["All", "Unisex", "Pour Femme", "Pour Homme"].map(gender => {
                  const isSelected = selectedGender === gender;
                  return (
                    <button
                      key={gender}
                      onClick={() => setSelectedGender(gender)}
                      style={{
                        background: isSelected ? "var(--gold-500)" : "transparent",
                        color: isSelected ? "#000" : "#a1a1aa",
                        border: "none",
                        borderRadius: "999px",
                        padding: "0.3rem 0.85rem",
                        fontSize: "0.78rem",
                        fontWeight: isSelected ? 600 : 400,
                        cursor: "pointer",
                        transition: "all 0.15s"
                      }}
                    >
                      {gender}
                    </button>
                  );
                })}
              </div>

              {/* Sort By Dropdown */}
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <select
                  className="form-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    padding: "0.5rem 1.8rem 0.5rem 0.85rem",
                    fontSize: "0.82rem",
                    borderRadius: "6px",
                    width: "auto"
                  }}
                >
                  <option value="featured">Featured Curations</option>
                  <option value="rating">Highest Patron Rating</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Filter Indicators if filtered */}
          {(searchTerm || selectedFamily !== "All Fragrances" || selectedGender !== "All") && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem", fontSize: "0.85rem", color: "#a1a1aa" }}>
              <span>Showing results for: </span>
              {selectedFamily !== "All Fragrances" && (
                <span className="glass-panel" style={{ padding: "0.15rem 0.6rem", color: "var(--gold-300)" }}>
                  {selectedFamily}
                </span>
              )}
              {selectedGender !== "All" && (
                <span className="glass-panel" style={{ padding: "0.15rem 0.6rem", color: "var(--gold-300)" }}>
                  {selectedGender}
                </span>
              )}
              {searchTerm && (
                <span className="glass-panel" style={{ padding: "0.15rem 0.6rem", color: "var(--gold-300)" }}>
                  "{searchTerm}"
                </span>
              )}
              <button
                onClick={() => { setSearchTerm(""); setSelectedFamily("All Fragrances"); setSelectedGender("All"); }}
                style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: "0.78rem", marginLeft: "0.5rem", textDecoration: "underline" }}
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="glass-panel" style={{ padding: "4rem 2rem", textAlign: "center", color: "#71717a" }}>
              <Search size={48} color="#3f3f46" style={{ margin: "0 auto 1rem auto" }} />
              <h3 style={{ color: "#fff", marginBottom: "0.5rem" }}>No Fragrances Found</h3>
              <p style={{ fontSize: "0.9rem", maxWidth: "400px", margin: "0 auto 1.5rem auto" }}>
                We could not find any flacons matching your selected olfactory filters or keywords.
              </p>
              <button
                className="btn-gold"
                onClick={() => { setSearchTerm(""); setSelectedFamily("All Fragrances"); setSelectedGender("All"); }}
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "2rem"
            }}>
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelectProduct={(p) => setSelectedProduct(p)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Luxury Footer */}
      <footer style={{
        background: "#08080a",
        borderTop: "1px solid rgba(212, 175, 55, 0.15)",
        padding: "4rem 0 2rem 0",
        color: "#71717a"
      }}>
        <div className="container">
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "2.5rem",
            marginBottom: "3rem"
          }}>
            <div>
              <h4 style={{ fontFamily: "var(--font-serif)", fontSize: "1.4rem", color: "#fff", letterSpacing: "0.15em", marginBottom: "0.75rem" }}>
                AURA <span className="gold-text">PARFUMS</span>
              </h4>
              <p style={{ fontSize: "0.85rem", lineHeight: 1.7, color: "#a1a1aa" }}>
                An independent haute parfumerie house celebrating rare extracts, artisanal alchemy, and bespoke olfactory heritage.
              </p>
            </div>

            <div>
              <h5 style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--gold-400)", marginBottom: "1rem" }}>
                Atelier Concierge
              </h5>
              <ul style={{ listStyle: "none", fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <li>Complimentary Bespoke Scent Samples</li>
                <li>WhatsApp Order Concierge (+92 315-9146234)</li>
                <li>White-Glove Express Courier Dispatch</li>
                <li>Atelier Master Scent Profiling</li>
              </ul>
            </div>

            <div>
              <h5 style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--gold-400)", marginBottom: "1rem" }}>
                Boutique Services
              </h5>
              <ul style={{ listStyle: "none", fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <li style={{ cursor: "pointer", color: "#d4d4d8" }} onClick={() => setIsOrderHistoryOpen(true)}>
                  Track Order Dossier
                </li>
                <li style={{ cursor: "pointer", color: "#d4d4d8" }} onClick={() => setIsAuthModalOpen(true)}>
                  Patron Account Login
                </li>
                <li style={{ cursor: "pointer", color: "#d4d4d8" }} onClick={handleOpenAdmin}>
                  Atelier Master Admin Portal
                </li>
              </ul>
            </div>

            <div>
              <h5 style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--gold-400)", marginBottom: "1rem" }}>
                Authentication & Guarantee
              </h5>
              <p style={{ fontSize: "0.82rem", lineHeight: 1.6, color: "#a1a1aa" }}>
                Every bottle is compounded from high-purity natural harvests. Batch numbered and sealed with atelier wax crest.
              </p>
            </div>
          </div>

          <div style={{
            borderTop: "1px solid rgba(255, 255, 255, 0.06)",
            paddingTop: "1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
            fontSize: "0.78rem"
          }}>
            <span>© {new Date().getFullYear()} AURA PARFUMS Atelier. All rights reserved.</span>
            <div style={{ display: "flex", gap: "1rem" }}>
              <span style={{ cursor: "pointer" }} onClick={handleOpenAdmin}>Admin Control</span>
              <span>•</span>
              <span style={{ cursor: "pointer" }} onClick={() => setIsOrderHistoryOpen(true)}>Live Order Tracking</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals & Overlays */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      <CartDrawer />

      <CheckoutModal
        onOrderPlaced={(order) => {
          setPlacedOrder(order);
        }}
      />

      {placedOrder && (
        <OrderSuccessModal
          order={placedOrder}
          onClose={() => setPlacedOrder(null)}
          onOpenTracker={() => setIsOrderHistoryOpen(true)}
        />
      )}

      <OrderHistoryModal
        isOpen={isOrderHistoryOpen}
        onClose={() => setIsOrderHistoryOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onOpenAdmin={handleOpenAdmin}
      />

      <AdminPasscodeModal
        isOpen={isAdminPasscodeModalOpen}
        onClose={() => setIsAdminPasscodeModalOpen(false)}
        onSuccess={() => {
          setIsAdminPasscodeModalOpen(false);
          setIsAdminOpen(true);
        }}
      />

      <AdminLayout
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <CartProvider>
        <AuthProvider>
          <MainStorefront />
        </AuthProvider>
      </CartProvider>
    </StoreProvider>
  );
}
