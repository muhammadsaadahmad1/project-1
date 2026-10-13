import React, { useEffect, useMemo, useState } from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
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
import { AdminLayout } from "./components/admin/AdminLayout";
import { AdminLoginPage } from "./components/auth/AdminLoginPage";
import { 
  SlidersHorizontal, 
  Sparkles, 
  Search, 
  Filter, 
  ArrowUpDown, 
  ShieldCheck, 
  HelpCircle, 
  ExternalLink,
  ShoppingBag,
  Heart,
  Trash2,
  X,
  Eye
} from "lucide-react";
import { useCart } from "./context/CartContext";

const FloatingCartButton = () => {
  const { totalItemsCount, setIsCartOpen, subtotal } = useCart();

  return (
    <button
      onClick={() => setIsCartOpen(true)}
      style={{
        position: "fixed",
        right: "1.25rem",
        bottom: "1.25rem",
        zIndex: 1300,
        background: "linear-gradient(135deg, #222227 0%, #151518 100%)",
        border: "1px solid rgba(212, 175, 55, 0.6)",
        color: "#fff",
        padding: "0.65rem 1rem",
        borderRadius: "999px",
        display: "flex",
        alignItems: "center",
        gap: "0.6rem",
        cursor: "pointer",
        boxShadow: "0 14px 30px rgba(0, 0, 0, 0.55)",
        transition: "all 0.2s",
        backdropFilter: "blur(10px)"
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
  );
};

const MainStorefront = () => {
  const { products, settings } = useStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFamily, setSelectedFamily] = useState("All Fragrances");
  const [selectedProductType, setSelectedProductType] = useState("fragrance");
  const [selectedGender, setSelectedGender] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [maxPriceFilter, setMaxPriceFilter] = useState(350);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [wishlistIds, setWishlistIds] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("aura_wishlist") || "[]");
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("aura_wishlist", JSON.stringify(wishlistIds));
  }, [wishlistIds]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const productType = p.productType || "fragrance";
      const matchesFamily =
        productType !== "fragrance" ||
        selectedFamily === "All Fragrances" ||
        p.fragranceFamily?.toLowerCase() === selectedFamily.toLowerCase();

      const matchesProductType = productType === selectedProductType;

      const matchesGender =
        selectedGender === "All" ||
        p.gender?.toLowerCase() === selectedGender.toLowerCase();

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
        p.fragranceFamily?.toLowerCase().includes(term) ||
        notesList.includes(term);

      const lowestPrice = Math.min(...(p.variations?.map(v => v.price) || [0]));
      const matchesPrice = lowestPrice <= maxPriceFilter;

      return matchesProductType && matchesFamily && matchesGender && matchesSearch && matchesPrice;
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
  }, [products, searchTerm, selectedFamily, selectedProductType, selectedGender, sortBy, maxPriceFilter]);

  const fragranceProducts = products.filter(product => (product.productType || "fragrance") === "fragrance");
  const newestFirst = (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  const newDropsProducts = fragranceProducts.filter(product => product.isNew).sort(newestFirst).slice(0, 4);
  const auraSpecialProducts = fragranceProducts.filter(product => product.isSignature ?? product.isFeatured).slice(0, 4);
  const bestSellerProducts = fragranceProducts
    .filter(product => product.isBestseller ?? (product.rating?.count || 0) >= 24)
    .sort((a, b) => (b.rating?.count || 0) - (a.rating?.count || 0))
    .slice(0, 4);
  const giftSetProducts = products.filter(product => product.productType === "gift-set");
  const trendingProducts = fragranceProducts
    .filter(product => product.isTrending ?? (product.rating?.average || 0) >= 4.8)
    .sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0))
    .slice(0, 4);
  const catalogTitles = {
    fragrance: "Curated Fragrances",
    deodorant: "Deodorants",
    "body-mist": "Body Mists",
    "gift-set": "Gift Sets"
  };

  const resetCatalogFilters = () => {
    setSearchTerm("");
    setSelectedFamily("All Fragrances");
    setSelectedProductType("fragrance");
    setSelectedGender("All");
  };

  const toggleWishlist = (productId) => {
    setWishlistIds(current => current.includes(productId)
      ? current.filter(id => id !== productId)
      : [...current, productId]);
  };

  const wishlistProducts = products.filter(product => wishlistIds.includes(product.id));
  const renderProductCard = (product) => (
    <ProductCard
      key={product.id}
      product={product}
      onSelectProduct={setSelectedProduct}
      isWishlisted={wishlistIds.includes(product.id)}
      onToggleWishlist={toggleWishlist}
    />
  );

  const handleExploreScroll = () => {
    const el = document.getElementById("catalog-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleProductTypeSelect = (productType, gender = "All") => {
    setSearchTerm("");
    setSelectedFamily("All Fragrances");
    setSelectedProductType(productType);
    setSelectedGender(gender);
    handleExploreScroll();
  };

  const categoryCards = [
    { title: "Men Perfumes", productType: "fragrance", gender: "Pour Homme", accent: "#9d6439", image: "https://images.unsplash.com/photo-1528740561666-dc2479dc08ab?auto=format&fit=crop&w=900&q=80" },
    { title: "Women Perfumes", productType: "fragrance", gender: "Pour Femme", accent: "#c67c4d", image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&w=900&q=80" },
    { title: "Deodorants", productType: "deodorant", accent: "#bf8c5b", image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=900&q=80" },
    { title: "Body Mist", productType: "body-mist", accent: "#8d6240", image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=900&q=80" },
    { title: "Gift Sets", productType: "gift-set", accent: "#b87b52", image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=80" }
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedFamily={selectedFamily}
        setSelectedFamily={setSelectedFamily}
        setSelectedProductType={setSelectedProductType}
        setSelectedGender={setSelectedGender}
        onFamilySelect={(family) => {
          setSearchTerm("");
          setSelectedProductType("fragrance");
          setSelectedGender("All");
          setSelectedFamily(family);
          handleExploreScroll();
        }}
        onProductTypeSelect={handleProductTypeSelect}
        onSearchSubmit={handleExploreScroll}
        wishlistCount={wishlistProducts.length}
        onWishlistClick={() => setIsWishlistOpen(true)}
      />

      <FloatingCartButton />
      <HeroBanner onSelectProduct={setSelectedProduct} />

      <section style={{ padding: "2rem 0 0.5rem" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.2rem" }}>
            {categoryCards.map((category) => (
              <button
                key={category.title}
                onClick={() => handleProductTypeSelect(category.productType, category.gender || "All")}
                style={{ border: "1px solid rgba(121,74,35,0.12)", background: "linear-gradient(180deg, rgba(255,255,255,0.72), rgba(245,233,223,0.9))", borderRadius: "18px", padding: 0, overflow: "hidden", textAlign: "left", cursor: "pointer", boxShadow: "0 14px 28px rgba(106,64,32,0.08)", transition: "transform 0.2s ease" }}
              >
                <div style={{ height: "150px", background: `linear-gradient(135deg, ${category.accent}22, rgba(255,255,255,0.15)), url('${category.image}') center/cover no-repeat`, position: "relative" }} />
                <div style={{ padding: "1rem 1rem 1.2rem" }}>
                  <div style={{ fontSize: "0.68rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#7b4c2c", fontWeight: 700 }}>Shop</div>
                  <div style={{ marginTop: "0.3rem", fontSize: "1.4rem", color: "#2a1d17", fontWeight: 600, lineHeight: 1.2 }}>{category.title}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "1rem 0 0.5rem" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div style={{ fontSize: "0.78rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#8b5f3a", fontWeight: 700 }}>New Drops</div>
              <h2 style={{ fontSize: "2.1rem", color: "#2a1d17", marginTop: "0.3rem" }}>Fresh Finds</h2>
            </div>
            <button className="btn-outline" onClick={handleExploreScroll} style={{ color: "#4d3528", borderColor: "rgba(121,74,35,0.2)" }}>Explore More</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem" }}>
            {newDropsProducts.map(renderProductCard)}
          </div>
        </div>
      </section>

      <section style={{ padding: "2rem 0" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div style={{ fontSize: "0.78rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#8b5f3a", fontWeight: 700 }}>The Aura's</div>
              <h2 style={{ fontSize: "2.1rem", color: "#2a1d17", marginTop: "0.3rem" }}>Signature Selection</h2>
            </div>
            <button className="btn-outline" onClick={handleExploreScroll} style={{ color: "#4d3528", borderColor: "rgba(121,74,35,0.2)" }}>Explore More</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem" }}>
            {auraSpecialProducts.map(renderProductCard)}
          </div>
        </div>
      </section>

      <section style={{ padding: "2rem 0" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div style={{ fontSize: "0.78rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#8b5f3a", fontWeight: 700 }}>Best Sellers</div>
              <h2 style={{ fontSize: "2.1rem", color: "#2a1d17", marginTop: "0.3rem" }}>Customer Favorites</h2>
            </div>
            <button className="btn-outline" onClick={handleExploreScroll} style={{ color: "#4d3528", borderColor: "rgba(121,74,35,0.2)" }}>Explore More</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem" }}>
            {bestSellerProducts.map(renderProductCard)}
          </div>
        </div>
      </section>

      <section style={{ padding: "2rem 0" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div style={{ fontSize: "0.78rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#8b5f3a", fontWeight: 700 }}>Gift Sets</div>
              <h2 style={{ fontSize: "2.1rem", color: "#2a1d17", marginTop: "0.3rem" }}>For Special Moments</h2>
            </div>
            <button className="btn-outline" onClick={handleExploreScroll} style={{ color: "#4d3528", borderColor: "rgba(121,74,35,0.2)" }}>Explore More</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem" }}>
            {giftSetProducts.map(renderProductCard)}
          </div>
        </div>
      </section>

      <section style={{ padding: "2rem 0 0.5rem" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div style={{ fontSize: "0.78rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#8b5f3a", fontWeight: 700 }}>Trending</div>
              <h2 style={{ fontSize: "2.1rem", color: "#2a1d17", marginTop: "0.3rem" }}>Most Loved Right Now</h2>
            </div>
            <button className="btn-outline" onClick={handleExploreScroll} style={{ color: "#4d3528", borderColor: "rgba(121,74,35,0.2)" }}>Explore More</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem" }}>
            {trendingProducts.map(renderProductCard)}
          </div>
        </div>
      </section>

      <section id="catalog-section" style={{ padding: "3rem 0", flex: 1 }}>
        <div className="container">
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "1.5rem", marginBottom: "2rem" }}>
            <div>
              <span style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "#8b5f3a", fontWeight: 700 }}>Haute Parfumerie Catalog</span>
              <h2 style={{ fontSize: "2.4rem", color: "#2a1d17", lineHeight: 1.15, marginTop: "0.2rem" }}>{catalogTitles[selectedProductType] || "Curated Products"}</h2>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
              <div style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(121,74,35,0.12)", borderRadius: "999px", padding: "0.25rem", display: "flex", gap: "0.2rem" }}>
                {["All", "Unisex", "Pour Femme", "Pour Homme"].map(gender => {
                  const isSelected = selectedGender === gender;
                  return (
                    <button
                      key={gender}
                      onClick={() => setSelectedGender(gender)}
                      style={{ background: isSelected ? "#2a1d17" : "transparent", color: isSelected ? "#fff" : "#5d4336", border: "none", borderRadius: "999px", padding: "0.3rem 0.85rem", fontSize: "0.78rem", fontWeight: isSelected ? 600 : 400, cursor: "pointer", transition: "all 0.15s" }}
                    >
                      {gender}
                    </button>
                  );
                })}
              </div>

              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <select className="form-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: "0.5rem 1.8rem 0.5rem 0.85rem", fontSize: "0.82rem", borderRadius: "6px", width: "auto", background: "rgba(255,255,255,0.5)", color: "#2a1d17" }}>
                  <option value="featured">Featured Curations</option>
                  <option value="rating">Highest Patron Rating</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {(searchTerm || selectedFamily !== "All Fragrances" || selectedProductType !== "fragrance" || selectedGender !== "All") && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem", fontSize: "0.85rem", color: "#5d4336", flexWrap: "wrap" }}>
              <span>Showing results for: </span>
              {selectedFamily !== "All Fragrances" && (
                <span style={{ padding: "0.15rem 0.6rem", background: "rgba(121,74,35,0.06)", border: "1px solid rgba(121,74,35,0.15)", borderRadius: "999px", color: "#7b4c2c" }}>{selectedFamily}</span>
              )}
              {selectedProductType !== "fragrance" && (
                <span style={{ padding: "0.15rem 0.6rem", background: "rgba(121,74,35,0.06)", border: "1px solid rgba(121,74,35,0.15)", borderRadius: "999px", color: "#7b4c2c" }}>{catalogTitles[selectedProductType]}</span>
              )}
              {selectedGender !== "All" && (
                <span style={{ padding: "0.15rem 0.6rem", background: "rgba(121,74,35,0.06)", border: "1px solid rgba(121,74,35,0.15)", borderRadius: "999px", color: "#7b4c2c" }}>{selectedGender}</span>
              )}
              {searchTerm && (
                <span style={{ padding: "0.15rem 0.6rem", background: "rgba(121,74,35,0.06)", border: "1px solid rgba(121,74,35,0.15)", borderRadius: "999px", color: "#7b4c2c" }}>"{searchTerm}"</span>
              )}
              <button onClick={resetCatalogFilters} style={{ background: "none", border: "none", color: "#b91c1c", cursor: "pointer", fontSize: "0.78rem", marginLeft: "0.5rem", textDecoration: "underline" }}>Clear all filters</button>
            </div>
          )}

          {filteredProducts.length === 0 ? (
            <div style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(121,74,35,0.12)", borderRadius: "18px", padding: "4rem 2rem", textAlign: "center", color: "#5d4336" }}>
              <Search size={48} color="#7b4c2c" style={{ margin: "0 auto 1rem auto" }} />
              <h3 style={{ color: "#2a1d17", marginBottom: "0.5rem" }}>No Products Found</h3>
              <p style={{ fontSize: "0.9rem", maxWidth: "400px", margin: "0 auto 1.5rem auto" }}>We could not find any products matching your selected categories or search.</p>
              <button className="btn-gold" onClick={resetCatalogFilters}>Reset Search Filters</button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: "2rem" }}>
              {filteredProducts.map(renderProductCard)}
            </div>
          )}
        </div>
      </section>

      <footer style={{ background: "#180d0a", borderTop: "1px solid rgba(121,74,35,0.15)", padding: "4rem 0 2rem 0", color: "#bfa999" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "2.5rem", marginBottom: "3rem" }}>
            <div>
              <h4 style={{ fontFamily: "var(--font-serif)", fontSize: "1.4rem", color: "#fff", letterSpacing: "0.15em", marginBottom: "0.75rem" }}>AURA PARFUMES</h4>
              <p style={{ fontSize: "0.85rem", lineHeight: 1.7, color: "#d6c7b8" }}>An independent haute parfumerie house celebrating rare extracts, artisanal alchemy, and bespoke olfactory heritage.</p>
            </div>

            <div>
              <h5 style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#f4d5a7", marginBottom: "1rem" }}>Customer Support</h5>
              <ul style={{ listStyle: "none", fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <li>Complimentary Bespoke Scent Samples</li>
                <li>WhatsApp Order Concierge (+92 315-9146234)</li>
                <li>White-Glove Express Courier Dispatch</li>
                <li>Personal Fragrance Recommendations</li>
              </ul>
            </div>

            <div>
              <h5 style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#f4d5a7", marginBottom: "1rem" }}>Boutique Services</h5>
              <ul style={{ listStyle: "none", fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <li>Order updates are sent by email when provided.</li>
              </ul>
            </div>

            <div>
              <h5 style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#f4d5a7", marginBottom: "1rem" }}>Authentication & Guarantee</h5>
              <p style={{ fontSize: "0.82rem", lineHeight: 1.6, color: "#d6c7b8" }}>Each bottle is made with high-quality natural ingredients, numbered by batch, and sealed for authenticity.</p>
            </div>
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", fontSize: "0.78rem" }}>
            <span>© {new Date().getFullYear()} AURA PARFUMES. All rights reserved.</span>
          </div>
        </div>
      </footer>

      {isWishlistOpen && (
        <div className="modal-backdrop" onClick={() => setIsWishlistOpen(false)}>
          <section className="modal-content" role="dialog" aria-modal="true" aria-labelledby="wishlist-title" onClick={(event) => event.stopPropagation()} style={{ width: "100%", maxWidth: "620px", maxHeight: "80vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border-gold)", paddingBottom: "1rem", marginBottom: "1rem" }}>
              <h2 id="wishlist-title" style={{ display: "flex", alignItems: "center", gap: "0.6rem", margin: 0, color: "#fff", fontSize: "1.3rem" }}><Heart size={20} /> Wishlist</h2>
              <button className="btn-icon" onClick={() => setIsWishlistOpen(false)} aria-label="Close wishlist"><X size={18} /></button>
            </div>
            {wishlistProducts.length === 0 ? (
              <p style={{ color: "#c9b9a9", textAlign: "center", padding: "2rem 0" }}>Your wishlist is empty.</p>
            ) : wishlistProducts.map(product => (
              <div key={product.id} style={{ display: "grid", gridTemplateColumns: "64px 1fr auto", alignItems: "center", gap: "1rem", padding: "0.8rem 0", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <img src={product.image} alt="" style={{ width: "64px", height: "72px", objectFit: "cover", borderRadius: "4px" }} />
                <div>
                  <div style={{ fontSize: "0.7rem", color: "var(--gold-400)", textTransform: "uppercase" }}>{product.productType === "fragrance" ? product.fragranceFamily : product.productType}</div>
                  <div style={{ color: "#fff", fontWeight: 600, margin: "0.2rem 0" }}>{product.name}</div>
                  <div style={{ color: "#b9aa9b", fontSize: "0.8rem" }}>{product.brand}</div>
                </div>
                <div style={{ display: "flex", gap: "0.45rem" }}>
                  <button className="btn-icon" aria-label={`View ${product.name}`} onClick={() => { setSelectedProduct(product); setIsWishlistOpen(false); }}><Eye size={16} /></button>
                  <button className="btn-icon" aria-label={`Remove ${product.name} from wishlist`} onClick={() => toggleWishlist(product.id)}><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </section>
        </div>
      )}
      {selectedProduct && (<ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />)}
      <CartDrawer />
      <CheckoutModal onOrderPlaced={(order) => { setPlacedOrder(order); }} />
      {placedOrder && (<OrderSuccessModal order={placedOrder} onClose={() => setPlacedOrder(null)} />)}
    </div>
  );
};

const RequireAdmin = () => {
  const { currentAdmin, authLoading, verifyCurrentAdmin } = useAuth();
  const [access, setAccess] = useState("checking");

  useEffect(() => {
    let active = true;
    if (authLoading) {
      setAccess("checking");
      return () => { active = false; };
    }
    if (!currentAdmin) {
      setAccess("denied");
      return () => { active = false; };
    }
    void verifyCurrentAdmin().then(isAllowed => {
      if (active) setAccess(isAllowed ? "allowed" : "denied");
    });
    return () => { active = false; };
  }, [authLoading, currentAdmin]);

  if (access === "checking") return <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", color: "#a1a1aa" }}>Loading...</div>;
  if (access !== "allowed") return <Navigate to="/" replace />;
  return <Outlet />;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/admin-login" element={<AdminLoginPage />} />
    <Route path="/" element={<MainStorefront />} />
    <Route element={<RequireAdmin />}>
      <Route path="/admin" element={<AdminLayout />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <StoreProvider>
          <CartProvider>
            <AppRoutes />
          </CartProvider>
        </StoreProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
