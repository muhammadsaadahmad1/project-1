import React, { useState } from "react";
import { 
  X, 
  Lock, 
  KeyRound, 
  ShieldCheck, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ArrowRight 
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const AdminPasscodeModal = ({ isOpen, onClose, onSuccess }) => {
  const { loginAdmin } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg("Enter your administrator email and password.");
      return;
    }

    setIsVerifying(true);
    setErrorMsg("");

    const res = await loginAdmin(email.trim(), password);
    setIsVerifying(false);

    if (res.success) {
      setPassword("");
      onClose();
      if (onSuccess) onSuccess();
    } else {
      setErrorMsg(res.message || "Administrator sign-in failed.");
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "460px",
          padding: "2.5rem 2rem",
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

        {/* Security Crest */}
        <div style={{
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(17, 17, 20, 0.9) 100%)",
          border: "1px solid var(--gold-500)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 1.25rem auto",
          boxShadow: "0 0 25px rgba(212, 175, 55, 0.2)"
        }}>
          <Lock size={28} color="var(--gold-400)" />
        </div>

        <span style={{
          fontSize: "0.74rem",
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          color: "var(--gold-400)",
          fontWeight: 600,
          display: "block",
          marginBottom: "0.3rem"
        }}>
          Restricted Atelier Portal
        </span>

        <h3 style={{ fontSize: "1.6rem", color: "#fff", marginBottom: "0.5rem" }}>
          Administrator Sign-In Required
        </h3>

        <p style={{ fontSize: "0.84rem", color: "#a1a1aa", lineHeight: 1.6, marginBottom: "1.5rem" }}>
          Administrative privileges are required to manage fragrance formulae, real-time inventory matrices, and WhatsApp orders.
        </p>

        {errorMsg && (
          <div style={{
            background: "rgba(239, 68, 68, 0.15)",
            border: "1px solid rgba(239, 68, 68, 0.4)",
            color: "#f87171",
            padding: "0.65rem 0.9rem",
            borderRadius: "6px",
            marginBottom: "1.2rem",
            fontSize: "0.82rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.4rem"
          }}>
            <AlertCircle size={15} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ textAlign: "left" }}>
          <div className="form-group" style={{ marginBottom: "1.2rem" }}>
            <label className="form-label" style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Administrator Email:</span>
            </label>

            <input
              type="email"
              className="form-input"
              autoFocus
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              style={{ marginBottom: "0.7rem" }}
            />

            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                className="form-input"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMsg) setErrorMsg("");
                }}
                placeholder="Enter administrator password"
                style={{ paddingRight: "2.8rem", letterSpacing: showPassword ? "normal" : "0.2em", fontSize: "1rem" }}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "0.8rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "#71717a",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-gold"
            disabled={isVerifying}
            style={{ width: "100%", padding: "0.85rem", fontSize: "0.92rem", marginBottom: "0.75rem" }}
          >
            <span>{isVerifying ? "Verifying Clearance..." : "Authorize Clearance"}</span>
            <ArrowRight size={16} />
          </button>

          <button
            type="button"
            className="btn-outline"
            onClick={onClose}
            style={{ width: "100%", padding: "0.65rem", fontSize: "0.82rem" }}
          >
            Return to Boutique
          </button>
        </form>

        <div style={{
          marginTop: "1.5rem",
          paddingTop: "1rem",
          borderTop: "1px solid rgba(255, 255, 255, 0.06)",
          fontSize: "0.72rem",
          color: "#71717a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.4rem"
        }}>
          <ShieldCheck size={13} color="#10b981" />
          <span>Protected by Supabase Auth and database permissions</span>
        </div>
      </div>
    </div>
  );
};
