import React, { useState } from "react";
import { 
  X, 
  CreditCard, 
  Truck, 
  Lock, 
  MessageCircle,
  MapPin,
  ArrowRight
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useStore } from "../context/StoreContext";

export const CheckoutModal = ({ onOrderPlaced }) => {
  const { items, subtotal, shipping, total, clearCart, isCheckoutOpen, setIsCheckoutOpen, setIsCartOpen } = useCart();
  const { placeOrder, settings } = useStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod] = useState("Cash on Delivery");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isCheckoutOpen) return null;

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    const normalizedPhone = phone.trim();
    const normalizedEmail = email.trim();
    if (!name.trim() || !normalizedPhone || !address.trim()) {
      setErrorMsg("Please complete your name, delivery address, and phone number.");
      return;
    }
    if (!/^\+[1-9]\d{7,14}$/.test(normalizedPhone)) {
      setErrorMsg("Enter a valid phone number in international format, such as +14155550198.");
      return;
    }

    setIsProcessing(true);
    setErrorMsg("");

    try {
      const orderPayload = {
        customer: {
          name: name.trim(),
          email: normalizedEmail,
          phone: normalizedPhone,
          address: address.trim()
        },
        items: items.map(i => ({
          productId: i.productId,
          productName: i.productName,
          brand: i.brand,
          size: i.size,
          price: i.price,
          quantity: i.quantity,
          image: i.image
        })),
        subtotal,
        shipping,
        total,
        paymentMethod,
        paymentStatus: "pending"
      };

      // Atomic decrement of inventory & order creation
      const createdOrder = await placeOrder(orderPayload);
      clearCart();
      setIsCheckoutOpen(false);
      onOrderPlaced(createdOrder);
    } catch (err) {
      console.error("Order failed", err);
      setErrorMsg("An error occurred while securing your order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={() => setIsCheckoutOpen(false)}>
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "760px",
          padding: "2.5rem",
          position: "relative"
        }}
      >
        <button 
          className="btn-icon" 
          onClick={() => setIsCheckoutOpen(false)}
          style={{ position: "absolute", top: "1.2rem", right: "1.2rem" }}
        >
          <X size={18} />
        </button>

        <div style={{ marginBottom: "1.8rem" }}>
          <span style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--gold-400)", fontWeight: 600 }}>
            Guest Checkout & Inventory Allocation
          </span>
          <h2 style={{ fontSize: "2rem", color: "#fff", marginTop: "0.2rem" }}>
            Secure Your Artisanal Creation
          </h2>
        </div>

        {errorMsg && (
          <div style={{
            background: "rgba(239, 68, 68, 0.15)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "#f87171",
            padding: "0.75rem 1rem",
            borderRadius: "6px",
            marginBottom: "1.5rem",
            fontSize: "0.85rem"
          }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmitOrder}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
            {/* Left Column: Customer & Delivery Details */}
            <div>
              <h4 style={{ fontSize: "1rem", color: "#fff", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <MapPin size={16} color="var(--gold-400)" />
                <span>Patron & Delivery Information</span>
              </h4>

              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  maxLength={120}
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Lord Alistair Montgomery"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address (optional)</label>
                <input
                  type="email"
                  className="form-input"
                  maxLength={254}
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@luxurymail.com"
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>WhatsApp Phone Number *</span>
                  <span style={{ color: "#25d366", fontSize: "0.72rem", textTransform: "none" }}>For instant order updates</span>
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="tel"
                    className="form-input"
                    required
                    maxLength={16}
                    pattern="\+[1-9][0-9]{7,14}"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+14155550198"
                  />
                  <MessageCircle size={15} color="#25d366" style={{ position: "absolute", right: "0.9rem", top: "50%", transform: "translateY(-50%)" }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Delivery Address *</label>
                <textarea
                  className="form-textarea"
                  rows="2"
                  required
                  maxLength={1000}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Penthouse Suite, 432 Park Ave, New York, NY 10022"
                />
              </div>

            </div>

            {/* Right Column: Payment & Order Summary */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <h4 style={{ fontSize: "1rem", color: "#fff", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <CreditCard size={16} color="var(--gold-400)" />
                <span>Payment & Allocation</span>
              </h4>

              <div className="glass-panel" style={{ padding: "1rem", marginBottom: "1.2rem", background: "rgba(10, 10, 12, 0.6)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.55rem", color: "#fff", fontWeight: 600 }}>
                  <Truck size={16} color="var(--gold-400)" />
                  <span>Cash on delivery</span>
                </div>
                <p style={{ color: "#a1a1aa", fontSize: "0.78rem", margin: "0.45rem 0 0" }}>Payment is collected by the courier when your order arrives.</p>
              </div>

              {/* Order Summary Box */}
              <div className="glass-panel" style={{ padding: "1.25rem", marginTop: "auto", background: "rgba(0, 0, 0, 0.3)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem", fontSize: "0.85rem", color: "#a1a1aa" }}>
                  <span>{items.reduce((s, i) => s + i.quantity, 0)} Items Selected</span>
                  <span>${subtotal}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.6rem", fontSize: "0.85rem", color: "#a1a1aa" }}>
                  <span>Courier Delivery</span>
                  <span>{shipping === 0 ? "Complimentary" : `$${shipping}`}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "0.6rem", borderTop: "1px solid rgba(255, 255, 255, 0.08)", fontSize: "1.2rem", fontWeight: 700, color: "#fff" }}>
                  <span>Payable Amount</span>
                  <span className="gold-text">${total}</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.76rem", color: "#a1a1aa" }}>
              <Lock size={14} color="var(--gold-400)" />
              <span>Real-time inventory will be automatically allocated upon confirmation.</span>
            </div>

            <button
              type="submit"
              className="btn-gold"
              disabled={isProcessing}
              style={{ padding: "0.85rem 2rem", fontSize: "0.95rem" }}
            >
              <span>{isProcessing ? "Allocating Stock & Processing..." : `Complete Order ($${total})`}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
