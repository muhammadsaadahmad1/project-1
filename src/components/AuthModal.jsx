import React, { useState } from "react";
import { 
  X, 
  User, 
  KeyRound, 
  ShieldCheck, 
  Check, 
  LogOut, 
  Mail, 
  Phone, 
  MapPin, 
  Sparkles 
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useStore } from "../context/StoreContext";

export const AuthModal = ({ isOpen, onClose, onOpenAdmin }) => {
  const { 
    currentUser, 
    isAdmin, 
    loginWithAdminPasscode, 
    logoutAdmin, 
    loginUser, 
    registerUser, 
    logoutUser,
    updateUserProfile 
  } = useAuth();
  const { settings } = useStore();

  const [mode, setMode] = useState("profile"); // profile | login | register | admin
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [address, setAddress] = useState(currentUser?.address || "");
  const [adminPasscode, setAdminPasscode] = useState("");
  const [feedback, setFeedback] = useState({ error: "", success: "" });

  if (!isOpen) return null;

  const handleAdminAuth = (e) => {
    e.preventDefault();
    const res = loginWithAdminPasscode(adminPasscode);
    if (res.success) {
      setFeedback({ error: "", success: "Atelier Master clearance granted!" });
      setTimeout(() => {
        onClose();
        onOpenAdmin();
      }, 700);
    } else {
      setFeedback({ error: res.message, success: "" });
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateUserProfile({ phone, address });
    setFeedback({ error: "", success: "Dossier details saved successfully." });
    setTimeout(() => setFeedback({ error: "", success: "" }), 3000);
  };

  const handleUserLogin = async (e) => {
    e.preventDefault();
    const res = await loginUser(email, password);
    if (res.success) {
      setFeedback({ error: "", success: "Welcome back, connoisseur!" });
      setMode("profile");
    } else {
      setFeedback({ error: res.message || "Failed to authenticate.", success: "" });
    }
  };

  const handleUserRegister = async (e) => {
    e.preventDefault();
    const res = await registerUser(name, email, password);
    if (res.success) {
      setFeedback({ error: "", success: "Boutique membership established!" });
      setMode("profile");
    } else {
      setFeedback({ error: res.message || "Registration failed.", success: "" });
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "520px",
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

        {/* Tab Switcher */}
        <div style={{
          display: "flex",
          borderBottom: "1px solid rgba(212, 175, 55, 0.15)",
          marginBottom: "1.75rem",
          gap: "1rem"
        }}>
          <button
            onClick={() => { setMode("profile"); setFeedback({ error: "", success: "" }); }}
            style={{
              background: "none",
              border: "none",
              color: mode === "profile" ? "var(--gold-400)" : "#71717a",
              borderBottom: mode === "profile" ? "2px solid var(--gold-500)" : "2px solid transparent",
              paddingBottom: "0.6rem",
              fontSize: "0.92rem",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Patron Profile
          </button>

          <button
            onClick={() => { setMode("admin"); setFeedback({ error: "", success: "" }); }}
            style={{
              background: "none",
              border: "none",
              color: mode === "admin" ? "var(--gold-400)" : "#71717a",
              borderBottom: mode === "admin" ? "2px solid var(--gold-500)" : "2px solid transparent",
              paddingBottom: "0.6rem",
              fontSize: "0.92rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.3rem"
            }}
          >
            <ShieldCheck size={15} />
            <span>Atelier Admin Clearance</span>
          </button>
        </div>

        {/* Feedback Messages */}
        {feedback.error && (
          <div style={{
            background: "rgba(239, 68, 68, 0.15)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "#f87171",
            padding: "0.65rem 1rem",
            borderRadius: "6px",
            marginBottom: "1.2rem",
            fontSize: "0.82rem"
          }}>
            {feedback.error}
          </div>
        )}

        {feedback.success && (
          <div style={{
            background: "rgba(16, 185, 129, 0.15)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            color: "#34d399",
            padding: "0.65rem 1rem",
            borderRadius: "6px",
            marginBottom: "1.2rem",
            fontSize: "0.82rem"
          }}>
            {feedback.success}
          </div>
        )}

        {/* Mode: Patron Profile */}
        {mode === "profile" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
              <div style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #222 0%, #111 100%)",
                border: "1px solid var(--gold-500)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.4rem",
                color: "var(--gold-400)",
                fontFamily: "var(--font-serif)"
              }}>
                {currentUser?.displayName?.[0] || "P"}
              </div>
              <div>
                <h3 style={{ fontSize: "1.25rem", color: "#fff" }}>
                  {currentUser?.displayName || "Distinguished Patron"}
                </h3>
                <span style={{ fontSize: "0.8rem", color: "#a1a1aa" }}>
                  {currentUser?.email || "Guest Account"} • VIP Tier
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveProfile}>
              <div className="form-group">
                <label className="form-label">WhatsApp Contact Number</label>
                <div style={{ position: "relative" }}>
                  <input
                    type="tel"
                    className="form-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+14155550198"
                  />
                  <Phone size={15} color="#71717a" style={{ position: "absolute", right: "0.9rem", top: "50%", transform: "translateY(-50%)" }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Default Concierge Delivery Address</label>
                <textarea
                  className="form-textarea"
                  rows="2"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, Penthouse, City, Postal Code"
                />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1.5rem" }}>
                <button
                  type="button"
                  onClick={logoutUser}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#71717a",
                    fontSize: "0.82rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem"
                  }}
                >
                  <LogOut size={14} />
                  <span>Reset Guest Session</span>
                </button>

                <button type="submit" className="btn-gold" style={{ padding: "0.6rem 1.4rem", fontSize: "0.85rem" }}>
                  Save Dossier
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Mode: Admin Atelier Clearance */}
        {mode === "admin" && (
          <div>
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <div style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "rgba(212, 175, 55, 0.1)",
                border: "1px solid var(--gold-500)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1rem auto"
              }}>
                <KeyRound size={26} color="var(--gold-400)" />
              </div>
              <h3 style={{ fontSize: "1.4rem", color: "#fff", marginBottom: "0.3rem" }}>
                Atelier Master Portal
              </h3>
              <p style={{ fontSize: "0.82rem", color: "#a1a1aa" }}>
                Enter your administrative passcode to manage fragrance products, stock limits, WhatsApp orders, and customer reviews.
              </p>
            </div>

            {isAdmin ? (
              <div style={{ textAlign: "center" }}>
                <div style={{
                  padding: "1rem",
                  background: "rgba(16, 185, 129, 0.12)",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  borderRadius: "8px",
                  color: "#34d399",
                  marginBottom: "1.5rem",
                  fontSize: "0.88rem"
                }}>
                  Atelier Master Clearance is currently <strong>ACTIVE</strong>.
                </div>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <button 
                    className="btn-gold" 
                    style={{ flex: 1 }}
                    onClick={() => {
                      onClose();
                      onOpenAdmin();
                    }}
                  >
                    Open Admin Command Center
                  </button>
                  <button 
                    className="btn-outline" 
                    onClick={logoutAdmin}
                    style={{ padding: "0.75rem 1rem" }}
                  >
                    Revoke Clearance
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleAdminAuth}>
                <div className="form-group">
                  <label className="form-label">Atelier Master Passcode</label>
                  <input
                    type="password"
                    className="form-input"
                    value={adminPasscode}
                    onChange={(e) => setAdminPasscode(e.target.value)}
                    placeholder="Enter admin passcode (Default: aura2026)"
                    required
                    autoFocus
                  />
                  <span style={{ fontSize: "0.72rem", color: "#71717a", marginTop: "0.3rem" }}>
                    Default demo credential: <code style={{ color: "var(--gold-300)" }}>aura2026</code>
                  </span>
                </div>

                <button
                  type="submit"
                  className="btn-gold"
                  style={{ width: "100%", padding: "0.8rem", marginTop: "1rem" }}
                >
                  <ShieldCheck size={16} />
                  <span>Authenticate Clearance</span>
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
