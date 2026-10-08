import React, { useEffect, useState } from "react";
import { Check, Clock3, RefreshCw, X } from "lucide-react";
import { listAdminRequests, reviewAdminRequest } from "../../services/adminRequestsApi";

const buttonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.4rem",
  minHeight: "38px",
  padding: "0.5rem 0.8rem",
  borderRadius: "6px",
  cursor: "pointer"
};

export const AdminRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeRequest, setActiveRequest] = useState("");

  const loadRequests = async () => {
    setLoading(true);
    setError("");
    try {
      setRequests(await listAdminRequests());
    } catch {
      setError("Unable to load requests. Check your admin access and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadRequests(); }, []);

  const handleReview = async (requestId, decision) => {
    setActiveRequest(requestId);
    setError("");
    try {
      await reviewAdminRequest(requestId, decision);
      setRequests(current => current.filter(request => request.id !== requestId));
    } catch {
      setError("Unable to save this decision. Refresh and try again.");
    } finally {
      setActiveRequest("");
    }
  };

  return (
    <section>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "1.25rem" }}>
        <div>
          <h2 style={{ color: "#fff", fontSize: "1.5rem" }}>Admin Requests</h2>
          <p style={{ color: "#a1a1aa", fontSize: "0.84rem", marginTop: "0.2rem" }}>Review access requests from account holders.</p>
        </div>
        <button type="button" className="btn-outline" onClick={() => void loadRequests()} disabled={loading} title="Refresh requests" aria-label="Refresh requests" style={{ padding: "0.55rem" }}>
          <RefreshCw size={16} />
        </button>
      </header>

      {error && <div role="alert" style={{ color: "#fca5a5", background: "rgba(239,68,68,.12)", padding: "0.75rem 1rem", borderRadius: "6px", marginBottom: "1rem" }}>{error}</div>}
      {loading ? <p style={{ color: "#a1a1aa", padding: "1.5rem 0" }}>Loading...</p> : requests.length === 0 ? (
        <div className="glass-panel" style={{ padding: "2rem", textAlign: "center", color: "#a1a1aa" }}>No requests to review.</div>
      ) : (
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {requests.map(request => (
            <article key={request.id} className="glass-panel" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", padding: "1rem 1.1rem", flexWrap: "wrap" }}>
              <div style={{ minWidth: "220px", flex: 1 }}>
                <div style={{ color: "#fff", overflowWrap: "anywhere" }}>{request.email || request.phone}</div>
                {request.email && request.phone && <div style={{ color: "#a1a1aa", fontSize: "0.84rem", marginTop: "0.2rem", overflowWrap: "anywhere" }}>{request.phone}</div>}
                <div style={{ color: "#71717a", fontSize: "0.76rem", marginTop: "0.45rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <Clock3 size={13} /> {new Date(request.created_at).toLocaleDateString()}
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button type="button" disabled={Boolean(activeRequest)} onClick={() => void handleReview(request.id, "approved")} style={{ ...buttonStyle, color: "#052e16", background: "#86efac", border: "1px solid #4ade80" }}>
                  <Check size={15} /> Approve
                </button>
                <button type="button" disabled={Boolean(activeRequest)} onClick={() => void handleReview(request.id, "rejected")} style={{ ...buttonStyle, color: "#fecaca", background: "rgba(127,29,29,.25)", border: "1px solid rgba(248,113,113,.4)" }}>
                  <X size={15} /> Reject
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};