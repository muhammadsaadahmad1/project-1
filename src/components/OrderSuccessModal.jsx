import React, { useState } from "react";
import { 
  CheckCircle, 
  MessageCircle, 
  Sparkles, 
  ExternalLink, 
  Clock, 
  Package, 
  X,
  Share2
} from "lucide-react";
import { useStore } from "../context/StoreContext";
import { formatWhatsAppOrderMessage, generateWhatsAppLink } from "../services/whatsappService";

export const OrderSuccessModal = ({ order, onClose, onOpenTracker }) => {
  const { settings } = useStore();
  const [copied, setCopied] = useState(false);

  if (!order) return null;

  const adminPhone = settings?.adminWhatsappNumber || "+923159146234";
  const whatsappMessage = formatWhatsAppOrderMessage(order, "AURA PARFUMS");
  const whatsappLink = generateWhatsAppLink(adminPhone, whatsappMessage);

  const handleCopy = () => {
    navigator.clipboard.writeText(whatsappMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleOpenWhatsApp = () => {
    window.open(whatsappLink, "_blank");
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "650px",
          padding: "2.5rem",
          textAlign: "center",
          position: "relative"
        }}
      >
        <button 
          className="btn-icon" 
          onClick={onClose}
          style={{ position: "absolute", top: "1.2rem", right: "1.2rem" }}
        >
          <X size={18} />
        </button>

        {/* Success Icon */}
        <div style={{
          width: "72px",
          height: "72px",
          borderRadius: "50%",
          background: "rgba(16, 185, 129, 0.15)",
          border: "2px solid #10b981",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 1.2rem auto",
          boxShadow: "0 0 30px rgba(16, 185, 129, 0.25)"
        }}>
          <CheckCircle size={38} color="#34d399" />
        </div>

        <span style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--gold-400)", fontWeight: 600 }}>
          Artisanal Flacon Allocated
        </span>

        <h2 style={{ fontSize: "2.2rem", color: "#fff", marginTop: "0.2rem", marginBottom: "0.5rem" }}>
          Order #{order.id} Placed
        </h2>

        <p style={{ fontSize: "0.92rem", color: "#a1a1aa", maxWidth: "480px", margin: "0 auto 1.8rem auto", lineHeight: 1.6 }}>
          Your precious fragrances have been secured from our inventory. We have initiated the WhatsApp Business dispatch protocol to notify the atelier.
        </p>

        {/* WhatsApp Business Dispatch Banner */}
        <div className="glass-panel" style={{
          padding: "1.5rem",
          background: "linear-gradient(135deg, rgba(37, 211, 102, 0.1) 0%, rgba(18, 18, 22, 0.9) 100%)",
          border: "1px solid rgba(37, 211, 102, 0.35)",
          borderRadius: "10px",
          marginBottom: "1.8rem",
          textAlign: "left"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
            <MessageCircle size={20} color="#25d366" />
            <h4 style={{ fontSize: "1.05rem", color: "#fff", margin: 0 }}>
              WhatsApp Business API Dispatch
            </h4>
          </div>
          <p style={{ fontSize: "0.82rem", color: "#d4d4d8", lineHeight: 1.5, marginBottom: "1rem" }}>
            Click below to instantly route your order dossier to the boutique master on WhatsApp for rapid confirmation and concierge packing.
          </p>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button 
              className="btn-whatsapp"
              onClick={handleOpenWhatsApp}
              style={{ flex: 1, minWidth: "220px" }}
            >
              <MessageCircle size={18} />
              <span>Send to Atelier on WhatsApp</span>
              <ExternalLink size={14} />
            </button>

            <button 
              className="btn-outline"
              onClick={handleCopy}
              style={{ padding: "0.75rem 1rem" }}
              title="Copy WhatsApp Message"
            >
              <Share2 size={16} />
              <span>{copied ? "Copied!" : "Copy Payload"}</span>
            </button>
          </div>
        </div>

        {/* Order Details Brief */}
        <div className="glass-panel" style={{ padding: "1.2rem", textAlign: "left", marginBottom: "1.8rem", background: "rgba(255, 255, 255, 0.02)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.6rem", fontSize: "0.82rem" }}>
            <span style={{ color: "#71717a" }}>Customer:</span>
            <span style={{ color: "#fff", fontWeight: 500 }}>{order.customer.name} ({order.customer.phone})</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.6rem", fontSize: "0.82rem" }}>
            <span style={{ color: "#71717a" }}>Creations:</span>
            <span style={{ color: "var(--gold-300)" }}>
              {order.items.map(i => `${i.productName} (${i.size}) x${i.quantity}`).join(", ")}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem", borderTop: "1px solid rgba(255, 255, 255, 0.06)", paddingTop: "0.5rem" }}>
            <span style={{ color: "#71717a" }}>Total Amount:</span>
            <span style={{ color: "#fff", fontWeight: 700 }}>${order.total} ({order.paymentMethod})</span>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <button 
            className="btn-outline" 
            onClick={() => {
              onClose();
              onOpenTracker();
            }}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <Clock size={16} />
            <span>Track Live Order Status</span>
          </button>

          <button className="btn-gold" onClick={onClose}>
            Continue Browsing
          </button>
        </div>
      </div>
    </div>
  );
};
