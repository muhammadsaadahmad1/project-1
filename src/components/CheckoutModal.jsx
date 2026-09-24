import React, { useState } from "react";
import { 
  X, 
  CreditCard, 
  Truck, 
  ShieldCheck, 
  CheckCircle, 
  Lock, 
  Phone,
  MessageCircle,
  MapPin,
  ArrowRight
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useStore } from "../context/StoreContext";
import { useAuth } from "../context/AuthContext";

export const CheckoutModal = ({ onOrderPlaced }) => {
  const { items, subtotal, shipping, total, clearCart, isCheckoutOpen, setIsCheckoutOpen } = useCart();
  const { placeOrder, settings } = useStore();
  const { currentUser, updateUserProfile } = useAuth();

  const [name, setName] = useState(currentUser.displayName || "");
  const [email, setEmail] = useState(currentUser.email || "");
  const [phone, setPhone] = useState(currentUser.phone || "+14155550198");
  const [address, setAddress] = useState(currentUser.address || "");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Credit Card (Secure Stripe)");
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [cardExp, setCardExp] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("888");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isCheckoutOpen) return null;

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!name || !email || !phone || !address) {
      setErrorMsg("Please complete all required customer fields.");
      return;
    }

    setIsProcessing(true);
    setErrorMsg("");

    try {
      // Save customer profile updates
      updateUserProfile({ displayName: name, email, phone, address });

      const orderPayload = {
        customer: {
          name,
          email,
          phone,
          address,
          notes
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
        paymentStatus: paymentMethod.includes("Card") ? "paid" : "pending"
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
            Concierge Checkout & Inventory Allocation
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
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Lord Alistair Montgomery"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  className="form-input"
                  required
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
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+14155552671"
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
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Penthouse Suite, 432 Park Ave, New York, NY 10022"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Concierge & Courier Notes (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Hand to doorman, fragrance gift wrapping"
                />
              </div>
            </div>

            {/* Right Column: Payment & Order Summary */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <h4 style={{ fontSize: "1rem", color: "#fff", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <CreditCard size={16} color="var(--gold-400)" />
                <span>Payment & Allocation</span>
              </h4>

              {/* Payment Methods */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "1.2rem" }}>
                {[
                  { id: "Credit Card (Secure Stripe)", label: "Credit Card / Encrypted Vault", desc: "Visa, Mastercard, Amex" },
                  { id: "Cash on Delivery", label: "Cash on Delivery (White Glove Courier)", desc: "Pay upon safe arrival" },
                  { id: "Apple Pay / Google Pay", label: "Digital Wallet (Apple / Google Pay)", desc: "Instant tokenized authentication" }
                ].map(method => {
                  const isSelected = paymentMethod === method.id;
                  return (
                    <div
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      style={{
                        padding: "0.85rem 1rem",
                        borderRadius: "8px",
                        background: isSelected ? "rgba(212, 175, 55, 0.12)" : "rgba(255, 255, 255, 0.03)",
                        border: `1px solid ${isSelected ? "var(--gold-500)" : "rgba(255, 255, 255, 0.08)"}`,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        transition: "all 0.2s"
                      }}
                    >
                      <div>
                        <div style={{ fontSize: "0.88rem", fontWeight: 600, color: isSelected ? "var(--gold-300)" : "#fff" }}>
                          {method.label}
                        </div>
                        <div style={{ fontSize: "0.72rem", color: "#a1a1aa" }}>{method.desc}</div>
                      </div>
                      <div style={{
                        width: "16px",
                        height: "16px",
                        borderRadius: "50%",
                        border: `2px solid ${isSelected ? "var(--gold-500)" : "#52525b"}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}>
                        {isSelected && <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--gold-500)" }} />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Mock Card Details if card selected */}
              {paymentMethod.includes("Card") && (
                <div className="glass-panel" style={{ padding: "1rem", marginBottom: "1.2rem", background: "rgba(10, 10, 12, 0.6)" }}>
                  <div className="form-group" style={{ marginBottom: "0.8rem" }}>
                    <label className="form-label" style={{ fontSize: "0.74rem" }}>Card Number</label>
                    <input
                      type="text"
                      className="form-input"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                    />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: "0.74rem" }}>Expiration</label>
                      <input
                        type="text"
                        className="form-input"
                        value={cardExp}
                        onChange={(e) => setCardExp(e.target.value)}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: "0.74rem" }}>Security CVC</label>
                      <input
                        type="text"
                        className="form-input"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

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
