import React, { useState } from "react";
import { 
  Database, 
  Check, 
  RefreshCw, 
  Sliders, 
  MessageCircle, 
  Key, 
  Truck, 
  ShieldCheck, 
  AlertCircle 
} from "lucide-react";
import { 
  isFirebaseActive, 
  getSavedFirebaseConfig, 
  saveFirebaseConfig, 
  clearFirebaseConfig 
} from "../../config/firebase";
import { useStore } from "../../context/StoreContext";

export const FirebaseSettingsModal = () => {
  const { settings, setSettings } = useStore();
  const currentFbConfig = getSavedFirebaseConfig() || {};

  const [apiKey, setApiKey] = useState(currentFbConfig.apiKey || "");
  const [authDomain, setAuthDomain] = useState(currentFbConfig.authDomain || "");
  const [projectId, setProjectId] = useState(currentFbConfig.projectId || "");
  const [storageBucket, setStorageBucket] = useState(currentFbConfig.storageBucket || "");
  const [messagingSenderId, setMessagingSenderId] = useState(currentFbConfig.messagingSenderId || "");
  const [appId, setAppId] = useState(currentFbConfig.appId || "");

  // Boutique Settings
  const [whatsappNumber, setWhatsappNumber] = useState(settings?.adminWhatsappNumber || "+923159146234");
  const [adminPasscode, setAdminPasscode] = useState(settings?.adminPasscode || "aura2026");
  const [freeShipping, setFreeShipping] = useState(settings?.freeShippingThreshold || 150);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSaveFirebase = (e) => {
    e.preventDefault();
    if (!apiKey || !projectId) {
      alert("Please provide at least API Key and Project ID for Firebase.");
      return;
    }

    saveFirebaseConfig({
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim(),
      projectId: projectId.trim(),
      storageBucket: storageBucket.trim(),
      messagingSenderId: messagingSenderId.trim(),
      appId: appId.trim()
    });
  };

  const handleClearFirebase = () => {
    if (confirm("Disconnect live Firebase and revert to local reactive storage?")) {
      clearFirebaseConfig();
    }
  };

  const handleSaveBoutiqueSettings = (e) => {
    e.preventDefault();
    setSettings(prev => ({
      ...prev,
      adminWhatsappNumber: whatsappNumber.trim(),
      adminPasscode: adminPasscode.trim(),
      freeShippingThreshold: Number(freeShipping)
    }));
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleResetCatalog = () => {
    if (confirm("Reset local catalog and orders back to initial luxury demo state?")) {
      localStorage.removeItem("aura_products");
      localStorage.removeItem("aura_orders");
      localStorage.removeItem("aura_reviews");
      localStorage.removeItem("aura_cart");
      window.location.reload();
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem", maxWidth: "900px" }}>
      {/* Header */}
      <div>
        <h3 style={{ fontSize: "1.4rem", color: "#fff", marginBottom: "0.2rem" }}>
          Firebase Backend & Boutique Configuration
        </h3>
        <p style={{ fontSize: "0.82rem", color: "#a1a1aa" }}>
          Configure live Cloud Firestore synchronization, WhatsApp Business dispatch targets, and boutique administrative settings.
        </p>
      </div>

      {savedNotice && (
        <div style={{
          background: "rgba(16, 185, 129, 0.15)",
          border: "1px solid rgba(16, 185, 129, 0.4)",
          color: "#34d399",
          padding: "0.75rem 1rem",
          borderRadius: "6px",
          fontSize: "0.85rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem"
        }}>
          <Check size={16} />
          <span>Boutique settings saved successfully!</span>
        </div>
      )}

      {/* Backend Status Card */}
      <div className="glass-panel" style={{
        padding: "1.5rem",
        background: isFirebaseActive 
          ? "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(18, 18, 22, 0.9) 100%)" 
          : "rgba(18, 18, 22, 0.8)",
        border: `1px solid ${isFirebaseActive ? "rgba(16, 185, 129, 0.4)" : "var(--border-gold)"}`
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
            <div style={{
              width: "44px",
              height: "44px",
              borderRadius: "8px",
              background: isFirebaseActive ? "rgba(16, 185, 129, 0.2)" : "rgba(212, 175, 55, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <Database size={22} color={isFirebaseActive ? "#34d399" : "var(--gold-400)"} />
            </div>

            <div>
              <h4 style={{ fontSize: "1.1rem", color: "#fff", margin: 0 }}>
                {isFirebaseActive ? "⚡ Connected to Cloud Firestore" : "Local Reactive State Engine (Active)"}
              </h4>
              <span style={{ fontSize: "0.78rem", color: "#a1a1aa" }}>
                {isFirebaseActive 
                  ? `Live syncing with project: ${currentFbConfig.projectId}` 
                  : "Zero-config demo mode with instant persistence and simulated Firestore transactions."}
              </span>
            </div>
          </div>

          {isFirebaseActive && (
            <button className="btn-outline" onClick={handleClearFirebase} style={{ fontSize: "0.78rem", padding: "0.4rem 0.85rem" }}>
              Disconnect Firebase
            </button>
          )}
        </div>
      </div>

      {/* Form: Firebase Credentials */}
      <form onSubmit={handleSaveFirebase} className="glass-panel" style={{ padding: "1.75rem" }}>
        <h4 style={{ fontSize: "1.05rem", color: "#fff", marginBottom: "0.4rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Database size={16} color="var(--gold-400)" />
          <span>Connect Your Firebase Project (Firestore & Auth)</span>
        </h4>
        <p style={{ fontSize: "0.8rem", color: "#a1a1aa", marginBottom: "1.2rem" }}>
          Paste your Firebase project credentials from the Firebase Console (Project Settings &gt; General &gt; Your apps &gt; Web app config).
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Firebase API Key *</label>
            <input
              type="text"
              className="form-input"
              required
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Project ID *</label>
            <input
              type="text"
              className="form-input"
              required
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              placeholder="my-fragrance-boutique"
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Auth Domain</label>
            <input
              type="text"
              className="form-input"
              value={authDomain}
              onChange={(e) => setAuthDomain(e.target.value)}
              placeholder="project-id.firebaseapp.com"
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Storage Bucket</label>
            <input
              type="text"
              className="form-input"
              value={storageBucket}
              onChange={(e) => setStorageBucket(e.target.value)}
              placeholder="project-id.appspot.com"
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Messaging Sender ID</label>
            <input
              type="text"
              className="form-input"
              value={messagingSenderId}
              onChange={(e) => setMessagingSenderId(e.target.value)}
              placeholder="1029384756"
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">App ID</label>
            <input
              type="text"
              className="form-input"
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
              placeholder="1:1029384756:web:abcd123"
            />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button type="submit" className="btn-gold" style={{ padding: "0.65rem 1.6rem" }}>
            <Check size={16} />
            <span>Save & Connect Firebase</span>
          </button>
        </div>
      </form>

      {/* Form: Boutique Operational Settings */}
      <form onSubmit={handleSaveBoutiqueSettings} className="glass-panel" style={{ padding: "1.75rem" }}>
        <h4 style={{ fontSize: "1.05rem", color: "#fff", marginBottom: "0.4rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Sliders size={16} color="var(--gold-400)" />
          <span>Boutique Operational Settings</span>
        </h4>
        <p style={{ fontSize: "0.8rem", color: "#a1a1aa", marginBottom: "1.2rem" }}>
          Manage the WhatsApp Business receiver phone number, complimentary courier threshold, and admin security passcode.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.2rem", marginBottom: "1.5rem" }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Admin WhatsApp Number</label>
            <input
              type="tel"
              className="form-input"
              required
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="+923159146234"
            />
            <span style={{ fontSize: "0.7rem", color: "#71717a", marginTop: "0.2rem" }}>
              Include international country code
            </span>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Free Courier Threshold ($)</label>
            <input
              type="number"
              min="0"
              className="form-input"
              required
              value={freeShipping}
              onChange={(e) => setFreeShipping(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Master Admin Passcode</label>
            <input
              type="text"
              className="form-input"
              required
              value={adminPasscode}
              onChange={(e) => setAdminPasscode(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button
            type="button"
            onClick={handleResetCatalog}
            style={{
              background: "none",
              border: "none",
              color: "#71717a",
              cursor: "pointer",
              fontSize: "0.8rem",
              display: "flex",
              alignItems: "center",
              gap: "0.3rem"
            }}
          >
            <RefreshCw size={13} />
            <span>Reset Demo Catalog & Orders</span>
          </button>

          <button type="submit" className="btn-gold" style={{ padding: "0.65rem 1.6rem" }}>
            <Check size={16} />
            <span>Update Boutique Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
