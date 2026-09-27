import React, { useState } from "react";
import { Check, Database, RefreshCw, Sliders } from "lucide-react";
import { isSupabaseConfigured, supabase } from "../../lib/supabase";
import { useStore } from "../../context/StoreContext";

export const SupabaseSettingsModal = () => {
  const { settings, setSettings } = useStore();
  const [whatsappNumber, setWhatsappNumber] = useState(settings?.adminWhatsappNumber || "+923159146234");
  const [freeShipping, setFreeShipping] = useState(settings?.freeShippingThreshold || 150);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSaveSettings = async (event) => {
    event.preventDefault();
    setSettings(previous => ({
      ...previous,
      adminWhatsappNumber: whatsappNumber.trim(),
      freeShippingThreshold: Number(freeShipping)
    }));
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleResetCatalog = () => {
    if (confirm("Reset local demo catalog and orders? This does not delete Supabase data.")) {
      localStorage.removeItem("aura_products");
      localStorage.removeItem("aura_orders");
      localStorage.removeItem("aura_reviews");
      localStorage.removeItem("aura_cart");
      window.location.reload();
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem", maxWidth: "900px" }}>
      <div>
        <h3 style={{ fontSize: "1.4rem", color: "#fff", marginBottom: "0.2rem" }}>
          Supabase & Boutique Configuration
        </h3>
        <p style={{ fontSize: "0.82rem", color: "#a1a1aa" }}>
          Supabase provides authentication, Postgres storage, row-level access policies, and live data updates.
        </p>
      </div>

      {savedNotice && (
        <div style={{ background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.4)", color: "#34d399", padding: "0.75rem 1rem", borderRadius: "6px", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Check size={16} />
          <span>Boutique settings saved successfully.</span>
        </div>
      )}

      <section className="glass-panel" style={{ padding: "1.5rem", border: `1px solid ${isSupabaseConfigured ? "rgba(16, 185, 129, 0.4)" : "var(--border-gold)"}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "8px", background: isSupabaseConfigured ? "rgba(16, 185, 129, 0.2)" : "rgba(212, 175, 55, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Database size={22} color={isSupabaseConfigured ? "#34d399" : "var(--gold-400)"} />
          </div>
          <div>
            <h4 style={{ fontSize: "1.1rem", color: "#fff", margin: 0 }}>
              {isSupabaseConfigured ? "Supabase client configured" : "Local demo mode"}
            </h4>
            <span style={{ fontSize: "0.78rem", color: "#a1a1aa" }}>
              {isSupabaseConfigured ? `Connected to ${supabase?.supabaseUrl}` : "Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local, then restart Vite."}
            </span>
          </div>
        </div>
      </section>

      <form onSubmit={handleSaveSettings} className="glass-panel" style={{ padding: "1.75rem" }}>
        <h4 style={{ fontSize: "1.05rem", color: "#fff", marginBottom: "0.4rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Sliders size={16} color="var(--gold-400)" />
          <span>Boutique Operational Settings</span>
        </h4>
        <p style={{ fontSize: "0.8rem", color: "#a1a1aa", marginBottom: "1.2rem" }}>
          Manage the concierge WhatsApp number, complimentary courier threshold, and inventory alert threshold.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "1.2rem", marginBottom: "1.5rem" }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Admin WhatsApp Number</label>
            <input type="tel" className="form-input" required value={whatsappNumber} onChange={event => setWhatsappNumber(event.target.value)} placeholder="+923159146234" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Free Courier Threshold ($)</label>
            <input type="number" min="0" className="form-input" required value={freeShipping} onChange={event => setFreeShipping(event.target.value)} />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <button type="button" onClick={handleResetCatalog} style={{ background: "none", border: "none", color: "#71717a", cursor: "pointer", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <RefreshCw size={13} />
            <span>Reset Local Demo Data</span>
          </button>
          <button type="submit" className="btn-gold" style={{ padding: "0.65rem 1.6rem" }}>
            <Check size={16} />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};