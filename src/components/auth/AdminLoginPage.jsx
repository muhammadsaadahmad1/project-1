import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export const AdminLoginPage = () => {
  const { loginAdmin, currentAdmin, authLoading } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && currentAdmin) navigate("/admin", { replace: true });
  }, [authLoading, currentAdmin, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const result = await loginAdmin(identifier.trim(), password);
    setSubmitting(false);
    if (result.success) navigate("/admin", { replace: true });
    else setError("Invalid credentials or access denied.");
  };

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "2rem 1rem", background: "radial-gradient(ellipse at 50% 0%, rgba(212, 175, 55, 0.1), transparent 55%), var(--bg-primary)" }}>
      <section className="animate-fade-in" style={{ width: "min(100%, 440px)", background: "rgba(17, 17, 20, 0.94)", border: "1px solid var(--border-gold)", borderRadius: "8px", padding: "2rem", boxShadow: "var(--shadow-deep)" }}>
        <Link to="/" aria-label="AURA PARFUMS home" style={{ color: "inherit", textDecoration: "none" }}>
          <div style={{ color: "var(--gold-400)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.16em", marginBottom: "0.45rem" }}>AURA PARFUMS ADMIN</div>
        </Link>
        <h1 style={{ color: "#fff", fontSize: "2rem", marginBottom: "1.35rem" }}>Admin sign in</h1>
        {error && <div role="alert" style={{ marginBottom: "1rem", padding: "0.7rem 0.85rem", color: "#fca5a5", background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "6px", fontSize: "0.84rem" }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="admin-identifier">Email or phone number</label>
            <input id="admin-identifier" className="form-input" autoComplete="username" required value={identifier} onChange={event => setIdentifier(event.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="admin-password">Password</label>
            <input id="admin-password" className="form-input" type="password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} />
          </div>
          <button className="btn-gold" type="submit" disabled={submitting || authLoading} style={{ width: "100%", marginTop: "0.5rem" }}>
            <ShieldCheck size={16} /><span>{submitting ? "Signing in..." : "Sign In"}</span>
          </button>
        </form>
        <div style={{ marginTop: "1.35rem", paddingTop: "1rem", borderTop: "1px solid var(--border-subtle)" }}>
          <Link to="/" style={{ color: "#a1a1aa", fontSize: "0.84rem", textDecoration: "none" }}><ArrowLeft size={14} style={{ verticalAlign: "middle", marginRight: "0.35rem" }} />Return to store</Link>
        </div>
      </section>
    </main>
  );
};