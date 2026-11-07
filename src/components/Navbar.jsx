import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, Search, Heart, X, Sparkles } from "lucide-react";
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
  const navigate = useNavigate();
  const [isCollectionOpen, setIsCollectionOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const collectionCloseTimerRef = useRef(null);

  const clearCollectionCloseTimer = () => {
    if (collectionCloseTimerRef.current) {
      clearTimeout(collectionCloseTimerRef.current);
      collectionCloseTimerRef.current = null;
    }
  };

  const closeCollectionMenu = () => {
    clearCollectionCloseTimer();
    setIsCollectionOpen(false);
  };

  const handleCollectionMouseLeave = () => {
    clearCollectionCloseTimer();
    collectionCloseTimerRef.current = setTimeout(() => {
      setIsCollectionOpen(false);
    }, 400);
  };

  const fragranceFamilies = [
    "All Fragrances",
    "Woody Oriental",
    "Floral",
    "Woody",
    "Citrus Fresh",
    "Oriental",
    "Gourmand"
  ];

  const handleHomeClick = () => {
    setSelectedProductType("fragrance");
    setSelectedGender("All");
    setSelectedFamily("All Fragrances");
    setSearchTerm("");
    setIsSearchOpen(false);
    navigate("/");
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (!section) return;

    window.history.pushState(null, "", `#${sectionId}`);
    section.scrollIntoView({ behavior: "instant", block: "start" });
  };

  return (
    <header className="store-header" style={{
      position: "sticky",
      top: 0,
      zIndex: 100,
      background: "rgba(25, 17, 14, 0.96)",
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
      borderBottom: "1px solid rgba(215, 172, 122, 0.18)",
      boxShadow: "0 10px 24px rgba(24, 14, 10, 0.08)"
    }}>
      <div className="announcement-bar">
        <div className="announcement-track">
          {[0, 1].map(copy => (
            <span className="announcement-copy" key={copy} aria-hidden={copy === 1}>
              <Sparkles size={12} color="#e8c79a" />
              <span>Welcome to AURA PARFUMES</span>
              <span style={{ color: "#e8c79a" }}>•</span>
              <span>Enjoy 5% off on your first purchase</span>
            </span>
          ))}
        </div>
      </div>

      <div className="container store-header-main">
        <button type="button" className="store-brand" onClick={handleHomeClick} aria-label="AURA PARFUMES home">
          <span className="store-brand-mark">A</span>
          <span className="store-brand-name">AURA PARFUMES</span>
        </button>

        <nav className="store-primary-nav" aria-label="Main navigation">
          <div
            className="collection-nav-trigger"
            onMouseLeave={(event) => {
              const nextTarget = event.relatedTarget;
              if (!nextTarget || !event.currentTarget.contains(nextTarget)) {
                handleCollectionMouseLeave();
              }
            }}
            onBlur={(event) => {
              const nextTarget = event.relatedTarget;
              if (!nextTarget || !event.currentTarget.contains(nextTarget)) {
                closeCollectionMenu();
              }
            }}
          >
            <button
              type="button"
              className="collection-trigger"
              onClick={() => {
                setIsCollectionOpen((open) => !open);
              }}
              aria-expanded={isCollectionOpen}
              aria-controls="collection-menu"
            >
              Collection
            </button>

            {isCollectionOpen && (
              <div id="collection-menu" className="collection-menu">
                <div>
                  <h2>Shop by collection</h2>
                  {[
                    ["All Fragrances", "fragrance", "All"],
                    ["For Him", "fragrance", "Pour Homme"],
                    ["For Her", "fragrance", "Pour Femme"],
                    ["Deodorants", "deodorant", "All"],
                    ["Body Mist", "body-mist", "All"],
                    ["Gift Sets", "gift-set", "All"]
                  ].map(([label, productType, gender]) => (
                    <button key={label} onClick={() => { closeCollectionMenu(); onProductTypeSelect(productType, gender); }}>{label}</button>
                  ))}
                </div>
                <div>
                  <h2>Explore scent families</h2>
                  {fragranceFamilies.slice(1).map(family => (
                    <button key={family} onClick={() => { closeCollectionMenu(); onFamilySelect(family); }}>{family}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button type="button" onClick={() => scrollToSection("best-sellers")}>Best Sellers</button>
          <button type="button" onClick={() => scrollToSection("gift-sets")}>Gift Sets</button>
          <button type="button" onClick={() => scrollToSection("about-us")}>About Us</button>
          <button type="button" onClick={() => scrollToSection("contact")}>Contact</button>
        </nav>

        <div className="store-header-actions">
          <button
            type="button"
            className="btn-icon"
            aria-label={isSearchOpen ? "Close product search" : "Open product search"}
            aria-expanded={isSearchOpen}
            onClick={() => setIsSearchOpen(open => !open)}
          >
            {isSearchOpen ? <X size={18} /> : <Search size={18} />}
          </button>
          <button type="button" className="btn-icon wishlist-nav-button" aria-label={`Wishlist${wishlistCount ? `, ${wishlistCount} saved` : ""}`} onClick={onWishlistClick}>
            <Heart size={18} />
            {wishlistCount > 0 && <span className="nav-count">{wishlistCount}</span>}
          </button>
          <button type="button" aria-label="Cart" onClick={() => setIsCartOpen(true)} className="btn-icon cart-nav-button">
            <ShoppingBag size={18} />
            {totalItemsCount > 0 && <span className="nav-count">{totalItemsCount}</span>}
          </button>
        </div>
      </div>

      {isSearchOpen && (
        <div className="container store-search-panel">
          <form onSubmit={(event) => { event.preventDefault(); onSearchSubmit(); setIsSearchOpen(false); }} role="search">
            <Search size={16} aria-hidden="true" />
            <input
              type="search"
              aria-label="Search fragrances and products"
              placeholder="Search fragrances, notes, or products..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              autoFocus
            />
          </form>
        </div>
      )}

      <style>{`
        .announcement-bar { overflow: hidden; background: #120d0b; color: #f5efe7; font-size: 0.72rem; letter-spacing: 0.12em; text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,0.08); }
        .announcement-track { display: flex; width: max-content; animation: announcement-scroll 28s linear infinite; }
        .announcement-copy { min-height: 32px; display: inline-flex; align-items: center; justify-content: center; gap: 0.85rem; padding: 0 2rem; white-space: nowrap; }
        @keyframes announcement-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .store-header-main { min-height: 76px; display: flex; align-items: center; justify-content: space-between; gap: clamp(0.7rem, 2vw, 2rem); overflow: visible; }
        .store-brand { display: inline-flex; align-items: center; gap: 0.7rem; flex-shrink: 0; border: 0; padding: 0; background: transparent; color: inherit; text-align: left; cursor: pointer; }
        .store-brand-mark { width: 38px; height: 38px; border-radius: 50%; background: linear-gradient(135deg, #f5d7ad 0%, #d59a54 100%); border: 1px solid rgba(255,255,255,0.25); display: grid; place-items: center; box-shadow: 0 10px 20px rgba(121,74,35,0.25); color: #281913; font: 700 1.5rem var(--font-serif); }
        .store-brand-name { color: #f8f1ea; font: 600 clamp(1.05rem, 1.65vw, 1.55rem)/1 var(--font-serif); letter-spacing: 0.1em; white-space: nowrap; }
        .store-primary-nav { display: flex; align-items: center; justify-content: center; gap: clamp(0.7rem, 1.8vw, 1.8rem); flex: 1; position: relative; overflow: visible; }
        .collection-nav-trigger { position: relative; display: inline-flex; align-items: center; overflow: visible; }
        .collection-trigger { position: relative; z-index: 2; }
        .collection-menu {
          position: absolute;
          left: 50%;
          top: calc(100% + 0.65rem);
          transform: translateX(-50%);
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
          width: min(700px, calc(100vw - 2rem));
          min-width: 320px;
          padding: 1.5rem 2rem;
          background: #f8f2ea;
          border: 1px solid rgba(121,74,35,0.2);
          box-shadow: 0 20px 35px rgba(24,14,10,0.2);
          z-index: 40;
          animation: collectionFadeIn 0.18s ease;
        }
        @keyframes collectionFadeIn {
          from { opacity: 0; transform: translateX(-50%) translateY(8px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .store-primary-nav button { border: 0; background: transparent; color: #f2e8dc; padding: 0.65rem 0; font: 600 0.72rem var(--font-sans); text-decoration: none; text-transform: uppercase; letter-spacing: 0.1em; cursor: pointer; white-space: nowrap; }
        .collection-nav-trigger:hover .collection-trigger,
        .collection-nav-trigger:focus-within .collection-trigger,
        .store-primary-nav button:hover, .collection-menu button:hover { color: #e8c79a; }
        .store-header-actions { display: flex; align-items: center; gap: 0.55rem; flex-shrink: 0; }
        .store-header-actions .btn-icon { position: relative; color: #f5e4cf; background: rgba(245, 223, 193, 0.08); }
        .nav-count { position: absolute; top: -2px; right: -2px; min-width: 18px; height: 18px; padding: 0 5px; border-radius: 999px; background: #f5d7ad; color: #1d130f; font: 700 0.64rem var(--font-sans); display: grid; place-items: center; }
        .collection-menu h2 { color: #8b5f3a; font: 700 0.67rem var(--font-sans); text-transform: uppercase; letter-spacing: 0.14em; margin-bottom: 0.5rem; }
        .collection-menu button { display: block; border: 0; background: none; color: #30231d; padding: 0.38rem 0; font: 500 0.9rem var(--font-sans); cursor: pointer; text-align: left; }
        .store-search-panel { padding: 0 1.5rem 0.85rem; }
        .store-search-panel form { max-width: 440px; margin: 0 0 0 auto; position: relative; }
        .store-search-panel form > svg { position: absolute; left: 0.9rem; top: 50%; transform: translateY(-50%); color: #7d4d2b; }
        .store-search-panel input { width: 100%; background: #f9f4ee; border: 1px solid rgba(121,74,35,0.2); border-radius: 4px; padding: 0.7rem 1rem 0.7rem 2.5rem; color: #291d17; font-size: 0.88rem; outline: none; }
        @media (max-width: 900px) {
          .store-header-main { min-height: 0; flex-wrap: wrap; padding-top: 0.75rem; padding-bottom: 0; }
          .store-primary-nav { order: 3; flex-basis: 100%; justify-content: space-between; gap: 0.4rem; overflow-x: auto; }
          .store-primary-nav button { font-size: 0.62rem; padding: 0.65rem 0; }
          .collection-menu { width: calc(100% - 2rem); grid-template-columns: 1fr 1fr; gap: 1rem; padding: 1.2rem; }
          .collection-menu button { font-size: 0.82rem; }
          .announcement-copy { font-size: 0.65rem; }
        }

        @media (max-width: 640px) {
          .announcement-bar { font-size: 0.62rem; letter-spacing: 0.09em; }
          .announcement-copy { gap: 0.45rem; padding: 0 1.2rem; }
          .store-header-main { gap: 0.6rem; }
          .store-brand { gap: 0.45rem; }
          .store-brand-mark { width: 30px; height: 30px; font-size: 1.2rem; }
          .store-brand-name { letter-spacing: 0.08em; font-size: 0.9rem; }
          .store-primary-nav {
            width: 100%;
            justify-content: flex-start;
            gap: 0.8rem;
            padding-bottom: 0.2rem;
            overflow: visible;
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          .store-primary-nav::-webkit-scrollbar { display: none; }
          .store-primary-nav button {
            flex: 0 0 auto;
            padding: 0.55rem 0;
            font-size: 0.58rem;
            letter-spacing: 0.09em;
          }
          .collection-menu {
            position: absolute;
            left: 0;
            top: calc(100% + 0.55rem);
            width: min(92vw, 420px);
            min-width: 0;
            transform: none;
            animation: none;
            grid-template-columns: 1fr;
            gap: 1rem;
            padding: 1rem 1.1rem;
          }
          .store-header-actions { gap: 0.4rem; }
          .btn-icon { width: 36px; height: 36px; }
          .store-search-panel { padding: 0 0.8rem 0.8rem; }
          .store-search-panel form { max-width: 100%; }
        }
        @media (prefers-reduced-motion: reduce) { .announcement-track { animation: none; } }
      `}</style>
    </header>
  );
};
