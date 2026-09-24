import React from "react";
import { 
  X, 
  Clock, 
  Package, 
  CheckCircle2, 
  Truck, 
  AlertCircle, 
  MessageCircle, 
  ExternalLink 
} from "lucide-react";
import { useStore } from "../context/StoreContext";
import { useAuth } from "../context/AuthContext";
import { generateWhatsAppLink } from "../services/whatsappService";

export const OrderHistoryModal = ({ isOpen, onClose }) => {
  const { orders, settings } = useStore();
  const { currentUser } = useAuth();

  if (!isOpen) return null;

  // Filter orders matching current patron or show recent orders if guest
  const patronOrders = orders.filter(
    o => o.customer?.email?.toLowerCase() === currentUser?.email?.toLowerCase() ||
         o.customer?.phone === currentUser?.phone
  );

  // If no email match yet, show all orders for quick testing/demo
  const displayedOrders = patronOrders.length > 0 ? patronOrders : orders;

  const getStatusStepIndex = (status) => {
    switch (status) {
      case "pending": return 0;
      case "confirmed": return 1;
      case "preparing": return 2;
      case "shipped": return 3;
      case "rejected": return -1;
      default: return 0;
    }
  };

  const steps = [
    { label: "Placed", desc: "Awaiting review" },
    { label: "Confirmed", desc: "Approved by Atelier" },
    { label: "Preparing", desc: "Bottling & Packaging" },
    { label: "Dispatched", desc: "Courier En Route" }
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "850px",
          padding: "2.5rem",
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

        <div style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--gold-400)", marginBottom: "0.3rem" }}>
            <Clock size={18} />
            <span style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 600 }}>
              Live Concierge Tracking
            </span>
          </div>
          <h2 style={{ fontSize: "2rem", color: "#fff" }}>
            Your Boutique Order Dossier
          </h2>
          <p style={{ fontSize: "0.85rem", color: "#a1a1aa" }}>
            Tracking status for patron: <strong style={{ color: "#fff" }}>{currentUser?.displayName || "Patron"}</strong>. Real-time updates reflect live changes from the atelier.
          </p>
        </div>

        {displayedOrders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#71717a" }}>
            <Package size={48} color="#3f3f46" style={{ margin: "0 auto 1rem auto" }} />
            <h4 style={{ color: "#fff", fontSize: "1.1rem", marginBottom: "0.5rem" }}>No Orders Recorded</h4>
            <p style={{ fontSize: "0.85rem" }}>You haven't placed an order yet. Select a fragrance to experience our bespoke service.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {displayedOrders.map((order) => {
              const currentStepIdx = getStatusStepIndex(order.status);
              const isRejected = order.status === "rejected";

              return (
                <div 
                  key={order.id}
                  className="glass-panel"
                  style={{
                    padding: "1.5rem",
                    background: "rgba(18, 18, 22, 0.7)",
                    border: order.status === "confirmed" ? "1px solid rgba(16, 185, 129, 0.4)" : "1px solid var(--border-gold)"
                  }}
                >
                  {/* Order Top Bar */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1.25rem" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                        <span style={{ fontSize: "1.15rem", fontWeight: 700, color: "#fff", letterSpacing: "0.05em" }}>
                          #{order.id}
                        </span>
                        <span style={{
                          fontSize: "0.72rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          padding: "0.2rem 0.6rem",
                          borderRadius: "999px",
                          background: isRejected 
                            ? "rgba(239, 68, 68, 0.15)" 
                            : order.status === "shipped" 
                              ? "rgba(16, 185, 129, 0.15)" 
                              : "rgba(212, 175, 55, 0.15)",
                          color: isRejected ? "#f87171" : order.status === "shipped" ? "#34d399" : "var(--gold-300)",
                          border: `1px solid ${isRejected ? "rgba(239, 68, 68, 0.3)" : "rgba(212, 175, 55, 0.3)"}`,
                          fontWeight: 600
                        }}>
                          {order.status.toUpperCase()}
                        </span>
                      </div>
                      <span style={{ fontSize: "0.76rem", color: "#71717a" }}>
                        Placed on {new Date(order.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--gold-300)" }}>
                        ${order.total}
                      </span>
                      <span style={{ display: "block", fontSize: "0.72rem", color: "#a1a1aa" }}>
                        {order.paymentMethod}
                      </span>
                    </div>
                  </div>

                  {/* Progress Timeline */}
                  {!isRejected ? (
                    <div style={{
                      margin: "1.5rem 0",
                      background: "rgba(0, 0, 0, 0.25)",
                      padding: "1.25rem",
                      borderRadius: "8px",
                      border: "1px solid rgba(255, 255, 255, 0.05)"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
                        {/* Connecting Line */}
                        <div style={{
                          position: "absolute",
                          top: "14px",
                          left: "25px",
                          right: "25px",
                          height: "3px",
                          background: "rgba(255, 255, 255, 0.1)",
                          zIndex: 0
                        }}>
                          <div style={{
                            height: "100%",
                            background: "var(--gold-gradient)",
                            width: `${Math.min(100, (currentStepIdx / 3) * 100)}%`,
                            transition: "width 0.4s ease"
                          }} />
                        </div>

                        {steps.map((step, idx) => {
                          const isDone = currentStepIdx >= idx;
                          const isCurrent = currentStepIdx === idx;

                          return (
                            <div key={idx} style={{ textAlign: "center", position: "relative", zIndex: 1, flex: 1 }}>
                              <div style={{
                                width: "30px",
                                height: "30px",
                                borderRadius: "50%",
                                background: isDone ? "var(--gold-500)" : "#1c1c22",
                                color: isDone ? "#000" : "#71717a",
                                border: isCurrent ? "3px solid #fff" : "2px solid rgba(255, 255, 255, 0.15)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 auto 0.4rem auto",
                                fontWeight: 700,
                                fontSize: "0.75rem",
                                boxShadow: isCurrent ? "0 0 15px rgba(212, 175, 55, 0.5)" : "none"
                              }}>
                                {isDone ? "✓" : idx + 1}
                              </div>
                              <span style={{ fontSize: "0.78rem", fontWeight: isCurrent ? 600 : 400, color: isDone ? "#fff" : "#71717a", display: "block" }}>
                                {step.label}
                              </span>
                              <span style={{ fontSize: "0.68rem", color: "#52525b", display: "none" }} className="step-desc">
                                {step.desc}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      padding: "1rem",
                      background: "rgba(239, 68, 68, 0.1)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      borderRadius: "6px",
                      marginBottom: "1rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      color: "#f87171",
                      fontSize: "0.85rem"
                    }}>
                      <AlertCircle size={16} />
                      <span>This order could not be fulfilled by the atelier. You have not been charged.</span>
                    </div>
                  )}

                  {/* Items Brief */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" }}>
                    {order.items.map((item, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.82rem" }}>
                        <span style={{ color: "#d4d4d8" }}>
                          • {item.productName} ({item.size}) <span style={{ color: "var(--gold-400)" }}>×{item.quantity}</span>
                        </span>
                        <span style={{ color: "#a1a1aa" }}>
                          ${item.price * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Shipping Address & WhatsApp Contact */}
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "0.75rem",
                    paddingTop: "0.85rem",
                    borderTop: "1px solid rgba(255, 255, 255, 0.06)",
                    fontSize: "0.78rem"
                  }}>
                    <span style={{ color: "#71717a", maxWidth: "450px" }}>
                      📍 Delivery to: {typeof order.customer.address === "object" ? order.customer.address.street : order.customer.address}
                    </span>

                    <button
                      onClick={() => {
                        const link = generateWhatsAppLink(
                          settings?.adminWhatsappNumber || "+923159146234",
                          `Hello, I would like to inquire about my order #${order.id} (${order.status.toUpperCase()}).`
                        );
                        window.open(link, "_blank");
                      }}
                      style={{
                        background: "rgba(37, 211, 102, 0.1)",
                        border: "1px solid rgba(37, 211, 102, 0.3)",
                        color: "#34d399",
                        padding: "0.35rem 0.75rem",
                        borderRadius: "4px",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        fontSize: "0.75rem"
                      }}
                    >
                      <MessageCircle size={13} color="#25d366" />
                      <span>WhatsApp Inquiries</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
