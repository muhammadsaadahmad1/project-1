import React, { useState } from "react";
import { 
  Star, 
  Check, 
  X, 
  Trash2, 
  ShieldCheck, 
  MessageSquare, 
  CheckCircle, 
  AlertCircle 
} from "lucide-react";
import { useStore } from "../../context/StoreContext";

export const ReviewModerator = () => {
  const { reviews, products, updateReviewStatus, deleteReview, settings, setSettings } = useStore();
  const [filter, setFilter] = useState("all"); // all | pending | approved

  const handleToggleModeration = () => {
    setSettings(prev => ({
      ...prev,
      requireReviewModeration: !prev.requireReviewModeration
    }));
  };

  const filteredReviews = reviews.filter(r => {
    if (filter === "all") return true;
    return r.status === filter;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Moderation Strategy Toggle */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "1rem"
      }}>
        <div>
          <h3 style={{ fontSize: "1.4rem", color: "#fff", marginBottom: "0.2rem" }}>
            Real-Time Reviews & Moderation Hub
          </h3>
          <p style={{ fontSize: "0.82rem", color: "#a1a1aa" }}>
            Reviews update product star averages instantly in real-time. Choose whether reviews auto-publish or require master vetting.
          </p>
        </div>

        {/* Auto-publish toggle button */}
        <div className="glass-panel" style={{
          padding: "0.75rem 1.25rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          background: "rgba(212, 175, 55, 0.05)"
        }}>
          <div>
            <strong style={{ fontSize: "0.85rem", color: "#fff", display: "block" }}>
              Require Admin Review Approval
            </strong>
            <span style={{ fontSize: "0.72rem", color: "#a1a1aa" }}>
              {settings?.requireReviewModeration ? "Enabled (New reviews start in Pending)" : "Disabled (Auto-publish live instantly)"}
            </span>
          </div>

          <button
            onClick={handleToggleModeration}
            style={{
              background: settings?.requireReviewModeration ? "var(--gold-500)" : "rgba(255, 255, 255, 0.1)",
              color: settings?.requireReviewModeration ? "#000" : "#a1a1aa",
              border: "none",
              padding: "0.4rem 0.85rem",
              borderRadius: "999px",
              fontSize: "0.76rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            {settings?.requireReviewModeration ? "Active" : "Auto-Publish"}
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "0.5rem" }}>
        {[
          { id: "all", label: `All Reviews (${reviews.length})` },
          { id: "pending", label: `Pending Approval (${reviews.filter(r => r.status === "pending").length})` },
          { id: "approved", label: `Published Live (${reviews.filter(r => r.status === "approved").length})` }
        ].map(tab => {
          const isSelected = filter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              style={{
                background: isSelected ? "var(--gold-500)" : "rgba(255, 255, 255, 0.04)",
                color: isSelected ? "#000" : "#a1a1aa",
                border: `1px solid ${isSelected ? "var(--gold-500)" : "rgba(255, 255, 255, 0.08)"}`,
                padding: "0.35rem 0.85rem",
                borderRadius: "6px",
                fontSize: "0.78rem",
                fontWeight: isSelected ? 600 : 400,
                cursor: "pointer"
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Reviews Queue List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {filteredReviews.length === 0 ? (
          <div className="glass-panel" style={{ padding: "3rem", textAlign: "center", color: "#71717a" }}>
            <MessageSquare size={40} color="#3f3f46" style={{ margin: "0 auto 0.75rem auto" }} />
            <h4 style={{ color: "#fff" }}>No Reviews In This Queue</h4>
            <p style={{ fontSize: "0.85rem" }}>All customer feedback is current.</p>
          </div>
        ) : (
          filteredReviews.map(rev => {
            const product = products.find(p => p.id === rev.productId);

            return (
              <div 
                key={rev.id}
                className="glass-panel"
                style={{
                  padding: "1.25rem 1.5rem",
                  background: "rgba(18, 18, 22, 0.7)",
                  borderLeft: `4px solid ${rev.status === "approved" ? "var(--gold-500)" : "#f59e0b"}`
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "0.75rem" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.2rem" }}>
                      <span style={{ fontWeight: 600, color: "#fff", fontSize: "0.95rem" }}>
                        {rev.userName}
                      </span>
                      <span style={{ color: "#71717a", fontSize: "0.75rem" }}>
                        reviewed <strong style={{ color: "var(--gold-300)" }}>{product?.name || "Fragrance"}</strong>
                      </span>
                      <span style={{
                        fontSize: "0.68rem",
                        padding: "0.15rem 0.5rem",
                        borderRadius: "999px",
                        textTransform: "uppercase",
                        fontWeight: 600,
                        background: rev.status === "approved" ? "rgba(16, 185, 129, 0.12)" : "rgba(245, 158, 11, 0.15)",
                        color: rev.status === "approved" ? "#34d399" : "#fbbf24",
                        border: `1px solid ${rev.status === "approved" ? "rgba(16, 185, 129, 0.25)" : "rgba(245, 158, 11, 0.3)"}`
                      }}>
                        {rev.status}
                      </span>
                    </div>
                    <span style={{ fontSize: "0.72rem", color: "#71717a" }}>
                      {rev.userLocation} • {new Date(rev.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {/* Stars */}
                  <div style={{ display: "flex", gap: "0.15rem" }}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} size={15} className={s <= rev.rating ? "star-filled" : "star-empty"} />
                    ))}
                  </div>
                </div>

                {rev.title && (
                  <h5 style={{ fontSize: "0.95rem", color: "#fff", marginBottom: "0.3rem" }}>
                    "{rev.title}"
                  </h5>
                )}

                <p style={{ fontSize: "0.85rem", color: "#d4d4d8", lineHeight: 1.6, marginBottom: "1rem" }}>
                  {rev.comment}
                </p>

                {/* Moderation Controls */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.6rem", borderTop: "1px solid rgba(255, 255, 255, 0.05)", paddingTop: "0.75rem" }}>
                  {rev.status === "pending" && (
                    <button
                      onClick={() => updateReviewStatus(rev.id, "approved")}
                      style={{
                        background: "rgba(16, 185, 129, 0.15)",
                        border: "1px solid rgba(16, 185, 129, 0.35)",
                        color: "#34d399",
                        padding: "0.35rem 0.85rem",
                        borderRadius: "4px",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.35rem"
                      }}
                    >
                      <Check size={14} />
                      <span>Approve & Publish Live</span>
                    </button>
                  )}

                  {rev.status === "approved" && (
                    <button
                      onClick={() => updateReviewStatus(rev.id, "pending")}
                      style={{
                        background: "rgba(245, 158, 11, 0.15)",
                        border: "1px solid rgba(245, 158, 11, 0.3)",
                        color: "#fbbf24",
                        padding: "0.35rem 0.85rem",
                        borderRadius: "4px",
                        fontSize: "0.78rem",
                        cursor: "pointer"
                      }}
                    >
                      Unpublish to Pending
                    </button>
                  )}

                  <button
                    onClick={() => deleteReview(rev.id)}
                    style={{
                      background: "rgba(239, 68, 68, 0.1)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      color: "#f87171",
                      padding: "0.35rem 0.65rem",
                      borderRadius: "4px",
                      fontSize: "0.78rem",
                      cursor: "pointer"
                    }}
                    title="Delete Review"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
