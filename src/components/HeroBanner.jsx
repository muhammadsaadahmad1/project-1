import React from "react";
import { Sparkles, Shield, Compass, MessageCircle } from "lucide-react";
import { useStore } from "../context/StoreContext";
import { generateWhatsAppLink } from "../services/whatsappService";

export const HeroBanner = ({ onExploreClick }) => {
  const { settings } = useStore();

  const handleConciergeChat = () => {
    const link = generateWhatsAppLink(
      settings?.adminWhatsappNumber || "+923159146234",
      "Bonjour! I am browsing the AURA PARFUMS boutique and would like personalized fragrance recommendations."
    );
    window.open(link, "_blank");
  };

  return (
    <section style={{
      position: "relative",
      padding: "4rem 0 3.5rem 0",
      overflow: "hidden",
      borderBottom: "1px solid rgba(212, 175, 55, 0.12)"
    }}>
      {/* Background glow effects */}
      <div style={{
        position: "absolute",
        top: "-20%",
        left: "50%",
        transform: "translateX(-50%)",
        width: "650px",
        height: "350px",
        background: "radial-gradient(circle, rgba(212, 175, 55, 0.14) 0%, rgba(9, 9, 11, 0) 70%)",
        filter: "blur(60px)",
        pointerEvents: "none",
        zIndex: 0
      }} />

      <div className="container" style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        {/* Subtitle pill */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          background: "rgba(212, 175, 55, 0.08)",
          border: "1px solid rgba(212, 175, 55, 0.3)",
          padding: "0.35rem 1rem",
          borderRadius: "999px",
          marginBottom: "1.5rem"
        }}>
          <Sparkles size={14} color="#d4af37" />
          <span style={{
            fontSize: "0.76rem",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            color: "var(--gold-300)",
            fontWeight: 500
          }}>
            Autumn/Winter Reserve Collection
          </span>
        </div>

        {/* Hero Title */}
        <h1 style={{
          fontSize: "clamp(2.5rem, 5.5vw, 4.4rem)",
          lineHeight: 1.12,
          marginBottom: "1.2rem",
          fontWeight: 400
        }}>
          Unearth the Art of <br />
          <span className="gold-text" style={{ fontWeight: 600 }}>Pure Olfactory Alchemy</span>
        </h1>

        <p style={{
          maxWidth: "680px",
          margin: "0 auto 2.2rem auto",
          fontSize: "1.05rem",
          color: "#a1a1aa",
          lineHeight: 1.7,
          fontWeight: 300
        }}>
          Made in Grasse with rare botanicals, wild-harvested oud, and precious flowers. Each bottle is numbered, and stock is updated in real time.
        </p>

        {/* CTA Buttons */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          flexWrap: "wrap",
          marginBottom: "3.5rem"
        }}>
          <button className="btn-gold" onClick={onExploreClick}>
            Explore Fragrances
          </button>
          
          <button 
            onClick={handleConciergeChat}
            style={{
              background: "rgba(37, 211, 102, 0.1)",
              border: "1px solid rgba(37, 211, 102, 0.35)",
              color: "#34d399",
              padding: "0.75rem 1.4rem",
              borderRadius: "6px",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.6rem",
              cursor: "pointer",
              fontSize: "0.9rem",
              fontWeight: 500,
              transition: "0.2s"
            }}
          >
            <MessageCircle size={16} color="#25d366" />
            <span>WhatsApp Scent Concierge</span>
          </button>
        </div>


      </div>
    </section>
  );
};
