import React, { useEffect, useState } from "react";
import { Sparkles, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useStore } from "../context/StoreContext";
import { generateWhatsAppLink } from "../services/whatsappService";

const slides = [
  {
    title: "Discover Floral Luxury That Lasts",
    subtitle: "Crafted with premium ingredients and rich signature notes for every mood.",
    badge: "New Season Collection",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1200&q=80",
    productId: "frag-008",
    accent: "#9e6a3d"
  },
  {
    title: "Rose de Taif & Floral Signatures",
    subtitle: "A luminous bouquet of soft petals, warm amber, and refined everyday elegance.",
    badge: "Best Sellers",
    image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1200&q=80",
    productId: "frag-002",
    accent: "#7c4d32"
  },
  {
    title: "Long-Lasting Perfumes for Him & Her",
    subtitle: "Fresh citrus, creamy woods, and warm oriental blends engineered for impact.",
    badge: "Signature Scents",
    image: "https://images.unsplash.com/photo-1528740561666-dc2479dc08ab?auto=format&fit=crop&w=1200&q=80",
    productId: "frag-011",
    accent: "#a3612f"
  },
  {
    title: "Gift-Ready Fragrances for Every Moment",
    subtitle: "Luxury packaging, iconic blends, and present-ready elegance in every bottle.",
    badge: "Gift Sets",
    image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1200&q=80",
    productId: "frag-005",
    accent: "#8d5c3d"
  },
  {
    title: "AURA PARFUMES Signature Collection",
    subtitle: "Find your signature scent with our curated, story-driven fragrance wardrobe.",
    badge: "Explore the Collection",
    image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&w=1200&q=80",
    productId: "frag-002",
    accent: "#b26f3d"
  }
];

export const HeroBanner = ({ onSelectProduct }) => {
  const { settings, products } = useStore();
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const slide = slides[activeIndex];
  const slideProduct = products.find(product => product.id === slide.productId) || products[activeIndex];

  const handleSelectSlideProduct = () => {
    if (slideProduct) onSelectProduct(slideProduct);
  };

  const goToPrev = (event) => {
    event.stopPropagation();
    setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };
  const goToNext = (event) => {
    event.stopPropagation();
    setActiveIndex((prev) => (prev + 1) % slides.length);
  };

  const handleConciergeChat = () => {
    const link = generateWhatsAppLink(
      settings?.adminWhatsappNumber || "+923159146234",
      "Hello! I am browsing the AURA PARFUMES boutique and would like personalized fragrance recommendations."
    );
    window.open(link, "_blank");
  };

  const handleTouchStart = (event) => {
    setTouchStart(event.touches[0].clientX);
  };

  const handleTouchEnd = (event) => {
    const endX = event.changedTouches[0].clientX;
    const distance = touchStart - endX;

    if (distance > 50) goToNext();
    if (distance < -50) goToPrev();
  };

  return (
    <section style={{
      position: "relative",
      padding: "2rem 0 1.5rem",
      overflow: "hidden",
      background: "linear-gradient(180deg, rgba(255,255,255,0.42) 0%, rgba(240,229,215,0.6) 100%)",
      borderBottom: "1px solid rgba(121,74,35,0.12)"
    }}>
      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onClick={handleSelectSlideProduct}
          onKeyDown={(event) => {
            if (event.target !== event.currentTarget) return;
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              handleSelectSlideProduct();
            }
          }}
          role="button"
          tabIndex={0}
          aria-label={`View ${slideProduct?.name || "featured fragrance"} details`}
          style={{
            position: "relative",
            borderRadius: "28px",
            overflow: "hidden",
            minHeight: "520px",
            background: `linear-gradient(135deg, ${slide.accent}44, rgba(255,255,255,0.18)), url('${slide.image}') center/cover no-repeat`,
            boxShadow: "0 18px 40px rgba(85, 54, 31, 0.1)",
            cursor: "pointer"
          }}
        >
          <div style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(90deg, rgba(27, 18, 15, 0.66) 0%, rgba(27,18,15,0.38) 38%, rgba(27,18,15,0.12) 100%)"
          }} />

          <div style={{
            position: "relative",
            zIndex: 1,
            height: "100%",
            display: "grid",
            gridTemplateColumns: "1.08fr 0.92fr",
            alignItems: "center",
            gap: "1.5rem",
            padding: "clamp(1.4rem, 3vw, 2.8rem)"
          }}>
            <div style={{ maxWidth: "620px" }}>
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.18)",
                padding: "0.45rem 0.9rem",
                borderRadius: "999px",
                marginBottom: "1.2rem",
                backdropFilter: "blur(4px)"
              }}>
                <Sparkles size={13} color="#f3d3a5" />
                <span style={{
                  fontSize: "0.72rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  color: "#f5efe7",
                  fontWeight: 700
                }}>
                  {slide.badge}
                </span>
              </div>

              <h1 style={{
                fontSize: "clamp(2.5rem, 4.2vw, 4.6rem)",
                lineHeight: 0.94,
                marginBottom: "1rem",
                color: "#fffaf5",
                fontWeight: 600,
                letterSpacing: "-0.04em"
              }}>
                {slide.title}
              </h1>

              <p style={{
                maxWidth: "540px",
                margin: "0 0 1.7rem",
                fontSize: "1rem",
                color: "rgba(255,255,255,0.8)",
                lineHeight: 1.7
              }}>
                {slide.subtitle}
              </p>

              <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
                <button className="btn-gold" onClick={(event) => { event.stopPropagation(); handleSelectSlideProduct(); }}>Shop Now</button>

                <button
                  onClick={(event) => { event.stopPropagation(); handleConciergeChat(); }}
                  style={{
                    background: "rgba(37, 211, 102, 0.08)",
                    border: "1px solid rgba(37, 211, 102, 0.35)",
                    color: "#ecfdf5",
                    padding: "0.8rem 1.2rem",
                    borderRadius: "8px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "0.9rem"
                  }}
                >
                  <MessageCircle size={16} color="#20a85d" />
                  Need help?
                </button>
              </div>

            </div>
          </div>

          <button
                onClick={goToPrev}
            aria-label="Previous slide"
            style={{
              position: "absolute",
              left: "1rem",
              top: "50%",
              transform: "translateY(-50%)",
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.3)",
              background: "rgba(15, 12, 10, 0.34)",
              color: "#fff",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
              zIndex: 2
            }}
          >
            <ChevronLeft size={20} />
          </button>

          <button
                onClick={goToNext}
            aria-label="Next slide"
            style={{
              position: "absolute",
              right: "1rem",
              top: "50%",
              transform: "translateY(-50%)",
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.3)",
              background: "rgba(15, 12, 10, 0.34)",
              color: "#fff",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
              zIndex: 2
            }}
          >
            <ChevronRight size={20} />
          </button>

          <div style={{
            position: "absolute",
            bottom: "1rem",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "center",
            gap: "0.45rem",
            zIndex: 2
          }}>
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={(event) => { event.stopPropagation(); setActiveIndex(index); }}
                aria-label={`Load slide ${index + 1}`}
                style={{
                  width: index === activeIndex ? "22px" : "10px",
                  height: "10px",
                  borderRadius: "999px",
                  border: "none",
                  background: index === activeIndex ? "#f4d5a7" : "rgba(255,255,255,0.6)",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
