import React, { useState } from "react";
import { Star, CheckCircle, MessageSquare, Send, ThumbsUp } from "lucide-react";
import { useStore } from "../context/StoreContext";
import { useAuth } from "../context/AuthContext";
import { getRatingBreakdown } from "../services/reviewService";

export const ReviewsSection = ({ productId, productName }) => {
  const { reviews, addReview, settings } = useStore();
  const { currentUser } = useAuth();

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Filter approved reviews for this product
  const productReviews = reviews.filter(
    r => r.productId === productId && (r.status === "approved" || r.userId === currentUser.uid)
  );

  const breakdown = getRatingBreakdown(reviews, productId);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);
    try {
      await addReview({
        productId,
        userId: currentUser.uid,
        userName: currentUser.displayName || "Fragrance Connoisseur",
        userLocation: currentUser.address?.includes(",") ? currentUser.address.split(",").slice(-2).join(", ") : "Verified Patron",
        rating: Number(rating),
        title: title.trim() || `${rating}-Star Olfactory Review`,
        comment: comment.trim(),
        verifiedPurchase: true
      });

      setTitle("");
      setComment("");
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 4000);
    } catch (err) {
      console.error("Failed to post review", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ marginTop: "2.5rem", borderTop: "1px solid rgba(212, 175, 55, 0.2)", paddingTop: "2rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <div>
          <h3 style={{ fontSize: "1.5rem", color: "#fff", marginBottom: "0.25rem" }}>
            Real-Time Patron Reviews & Ratings
          </h3>
          <p style={{ fontSize: "0.85rem", color: "#a1a1aa" }}>
            Authentic impressions from certified patrons of {productName}. Live feedback updates instantly.
          </p>
        </div>
      </div>

      {/* Rating Breakdown Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "2rem",
        background: "rgba(255, 255, 255, 0.02)",
        border: "1px solid var(--border-gold)",
        borderRadius: "10px",
        padding: "1.5rem",
        marginBottom: "2rem"
      }}>
        {/* Overall Score */}
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
          <div style={{ fontSize: "3.5rem", fontWeight: 700, lineHeight: 1, color: "var(--gold-400)", fontFamily: "var(--font-serif)" }}>
            {breakdown.total > 0 
              ? (productReviews.reduce((acc, r) => acc + r.rating, 0) / (productReviews.length || 1)).toFixed(1)
              : "5.0"}
          </div>
          <div style={{ display: "flex", gap: "0.2rem", margin: "0.5rem 0" }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} size={18} className="star-filled" />
            ))}
          </div>
          <span style={{ fontSize: "0.85rem", color: "#a1a1aa" }}>
            Based on {productReviews.length} verified review{productReviews.length === 1 ? "" : "s"}
          </span>
        </div>

        {/* Star Progress Bars */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem", justifyContent: "center" }}>
          {[5, 4, 3, 2, 1].map((stars) => {
            const pct = breakdown.percentages[stars] || 0;
            const count = breakdown.distribution[stars] || 0;
            return (
              <div key={stars} style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.8rem" }}>
                <span style={{ width: "45px", color: "#d4d4d8" }}>{stars} Stars</span>
                <div style={{
                  flex: 1,
                  height: "7px",
                  background: "rgba(255, 255, 255, 0.08)",
                  borderRadius: "999px",
                  overflow: "hidden"
                }}>
                  <div style={{
                    width: `${pct}%`,
                    height: "100%",
                    background: "var(--gold-gradient)",
                    transition: "width 0.4s ease"
                  }} />
                </div>
                <span style={{ width: "35px", textAlign: "right", color: "#71717a" }}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review Submission Form */}
      <form 
        onSubmit={handleSubmitReview}
        className="glass-panel"
        style={{ padding: "1.5rem", marginBottom: "2.5rem" }}
      >
        <h4 style={{ fontSize: "1.1rem", color: "#fff", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <MessageSquare size={16} color="#d4af37" />
          <span>Leave Your Scent Impression</span>
        </h4>
        <p style={{ fontSize: "0.8rem", color: "#a1a1aa", marginBottom: "1.2rem" }}>
          Share your experience with projection, drydown, and longevity with fellow connoisseurs.
        </p>

        {submitSuccess && (
          <div style={{
            background: "rgba(16, 185, 129, 0.15)",
            border: "1px solid rgba(16, 185, 129, 0.4)",
            color: "#34d399",
            padding: "0.75rem 1rem",
            borderRadius: "6px",
            marginBottom: "1.2rem",
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}>
            <CheckCircle size={16} />
            <span>Thank you! Your fragrance review has been published live to the boutique.</span>
          </div>
        )}

        {/* Star Rating Select */}
        <div style={{ marginBottom: "1rem" }}>
          <label className="form-label" style={{ display: "block", marginBottom: "0.35rem" }}>
            Rating Score (1 to 5 Stars):
          </label>
          <div style={{ display: "flex", gap: "0.35rem" }}>
            {[1, 2, 3, 4, 5].map((star) => {
              const active = (hoverRating || rating) >= star;
              return (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "0.2rem",
                    transition: "transform 0.1s"
                  }}
                >
                  <Star 
                    size={24} 
                    className={active ? "star-filled" : "star-empty"}
                  />
                </button>
              );
            })}
            <span style={{ marginLeft: "0.75rem", fontSize: "0.85rem", color: "var(--gold-400)", alignSelf: "center", fontWeight: 600 }}>
              {rating === 5 ? "Exceptional Masterpiece (5/5)" : `${rating} / 5 Stars`}
            </span>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Review Headline / Scent Summary</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g., Mesmerizing drydown, lasts over 12 hours..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Detailed Olfactory Impressions *</label>
          <textarea
            className="form-textarea"
            rows="3"
            placeholder="Describe the projection, note transitions from top to base, compliments received..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
          />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.78rem", color: "#a1a1aa" }}>
            <CheckCircle size={14} color="#10b981" />
            <span>Posting as: <strong style={{ color: "#fff" }}>{currentUser?.displayName || "Patron"}</strong> (Verified Buyer)</span>
          </div>

          <button
            type="submit"
            className="btn-gold"
            disabled={isSubmitting || !comment.trim()}
            style={{ padding: "0.6rem 1.4rem", fontSize: "0.85rem" }}
          >
            <Send size={14} />
            <span>{isSubmitting ? "Publishing..." : "Submit Live Review"}</span>
          </button>
        </div>
      </form>

      {/* Live Reviews Feed */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {productReviews.length === 0 ? (
          <p style={{ textAlign: "center", color: "#71717a", padding: "2rem" }}>
            No reviews yet for this creation. Be the first connoisseur to share an impression!
          </p>
        ) : (
          productReviews.map((rev) => (
            <div 
              key={rev.id} 
              className="glass-panel animate-fade-in" 
              style={{ padding: "1.25rem", background: "rgba(18, 18, 22, 0.6)" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.6rem" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.2rem" }}>
                    <span style={{ fontWeight: 600, color: "#fff", fontSize: "0.95rem" }}>
                      {rev.userName}
                    </span>
                    {rev.verifiedPurchase && (
                      <span style={{
                        background: "rgba(16, 185, 129, 0.12)",
                        color: "#34d399",
                        border: "1px solid rgba(16, 185, 129, 0.25)",
                        padding: "0.15rem 0.45rem",
                        borderRadius: "4px",
                        fontSize: "0.68rem",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.25rem"
                      }}>
                        <CheckCircle size={10} />
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: "0.72rem", color: "#71717a" }}>
                    {rev.userLocation || "Certified Patron"} • {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Stars */}
                <div style={{ display: "flex", gap: "0.15rem" }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      size={14} 
                      className={star <= rev.rating ? "star-filled" : "star-empty"} 
                    />
                  ))}
                </div>
              </div>

              {rev.title && (
                <h5 style={{ fontSize: "0.95rem", color: "var(--gold-300)", marginBottom: "0.4rem", fontWeight: 600 }}>
                  {rev.title}
                </h5>
              )}

              <p style={{ fontSize: "0.88rem", color: "#d4d4d8", lineHeight: 1.6 }}>
                "{rev.comment}"
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
