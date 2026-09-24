import React, { useState } from "react";
import { 
  Layers, 
  AlertTriangle, 
  CheckCircle, 
  Edit2, 
  Plus, 
  Minus, 
  ArrowUpRight, 
  Sliders, 
  Search, 
  RefreshCw 
} from "lucide-react";
import { useStore } from "../../context/StoreContext";
import { getStockStatus } from "../../services/inventoryService";

export const InventoryManager = ({ onGoToProducts }) => {
  const { products, updateStock, settings, setSettings, lowStockAlerts } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingStockKey, setEditingStockKey] = useState(null); // `${productId}-${variationId}`
  const [tempStockValue, setTempStockValue] = useState("");

  const threshold = settings?.lowStockThreshold || 5;

  const handleUpdateThreshold = (newVal) => {
    const parsed = Math.max(1, parseInt(newVal) || 5);
    setSettings(prev => ({ ...prev, lowStockThreshold: parsed }));
  };

  const handleSaveStock = async (productId, variationId) => {
    const num = Math.max(0, parseInt(tempStockValue) || 0);
    await updateStock(productId, variationId, num);
    setEditingStockKey(null);
  };

  const handleQuickAdjust = async (productId, variationId, currentStock, delta) => {
    const updated = Math.max(0, currentStock + delta);
    await updateStock(productId, variationId, updated);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.variations?.some(v => v.sku?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Header & Threshold Controller */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "1rem"
      }}>
        <div>
          <h3 style={{ fontSize: "1.4rem", color: "#fff", marginBottom: "0.2rem" }}>
            Real-Time Inventory & Stock Matrix
          </h3>
          <p style={{ fontSize: "0.82rem", color: "#a1a1aa" }}>
            Atomic stock allocations decrease automatically on customer checkout. Adjust quantities manually below.
          </p>
        </div>

        {/* Threshold setting control */}
        <div className="glass-panel" style={{
          padding: "0.6rem 1.1rem",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          background: "rgba(212, 175, 55, 0.05)"
        }}>
          <Sliders size={16} color="var(--gold-400)" />
          <span style={{ fontSize: "0.82rem", color: "#d4d4d8" }}>
            Low Stock Threshold:
          </span>
          <input
            type="number"
            min="1"
            max="50"
            value={threshold}
            onChange={(e) => handleUpdateThreshold(e.target.value)}
            style={{
              width: "52px",
              background: "#000",
              border: "1px solid var(--border-gold)",
              color: "var(--gold-300)",
              borderRadius: "4px",
              padding: "0.25rem 0.5rem",
              fontSize: "0.85rem",
              fontWeight: 600,
              textAlign: "center"
            }}
          />
          <span style={{ fontSize: "0.72rem", color: "#71717a" }}>units</span>
        </div>
      </div>

      {/* Critical Low Stock Alert Banner */}
      {lowStockAlerts.length > 0 && (
        <div style={{
          background: "rgba(245, 158, 11, 0.12)",
          border: "1px solid rgba(245, 158, 11, 0.4)",
          borderRadius: "10px",
          padding: "1.25rem 1.5rem"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.75rem" }}>
            <AlertTriangle size={20} color="#fbbf24" />
            <h4 style={{ fontSize: "1.05rem", color: "#fbbf24", margin: 0 }}>
              Atelier Replenishment Required ({lowStockAlerts.length} Critical Items)
            </h4>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "0.75rem" }}>
            {lowStockAlerts.map(alert => (
              <div
                key={`${alert.productId}-${alert.variationId}`}
                style={{
                  background: "rgba(0, 0, 0, 0.4)",
                  border: `1px solid ${alert.isDepleted ? "rgba(239, 68, 68, 0.4)" : "rgba(245, 158, 11, 0.3)"}`,
                  borderRadius: "6px",
                  padding: "0.65rem 0.85rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div>
                  <strong style={{ fontSize: "0.85rem", color: "#fff", display: "block" }}>
                    {alert.productName}
                  </strong>
                  <span style={{ fontSize: "0.72rem", color: "#a1a1aa" }}>
                    {alert.size} • SKU: {alert.sku}
                  </span>
                </div>

                <div style={{ textAlign: "right" }}>
                  <span style={{
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    color: alert.isDepleted ? "#f87171" : "#fbbf24"
                  }}>
                    {alert.stock === 0 ? "Depleted" : `${alert.stock} Left`}
                  </span>
                  <div style={{ display: "flex", gap: "0.25rem", marginTop: "0.2rem" }}>
                    <button
                      onClick={() => handleQuickAdjust(alert.productId, alert.variationId, alert.stock, 5)}
                      style={{
                        background: "rgba(212, 175, 55, 0.15)",
                        border: "1px solid var(--border-gold)",
                        color: "var(--gold-300)",
                        borderRadius: "3px",
                        fontSize: "0.68rem",
                        padding: "0.1rem 0.35rem",
                        cursor: "pointer"
                      }}
                      title="Quick restock +5"
                    >
                      +5 Restock
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Real-time Inventory Matrix Table */}
      <div className="glass-panel" style={{ overflow: "hidden" }}>
        <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ position: "relative", width: "320px" }}>
            <Search size={15} color="#71717a" style={{ position: "absolute", left: "0.8rem", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              className="form-input"
              style={{ padding: "0.45rem 2.2rem", fontSize: "0.82rem" }}
              placeholder="Filter by perfume name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <span style={{ fontSize: "0.78rem", color: "#71717a" }}>
            Total Fragrances: {products.length}
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.88rem" }}>
            <thead>
              <tr style={{ background: "rgba(255, 255, 255, 0.02)", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", color: "#71717a", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                <th style={{ padding: "1rem 1.5rem" }}>Creation</th>
                <th style={{ padding: "1rem 1.5rem" }}>Variation / Size</th>
                <th style={{ padding: "1rem 1.5rem" }}>SKU</th>
                <th style={{ padding: "1rem 1.5rem" }}>Unit Price</th>
                <th style={{ padding: "1rem 1.5rem" }}>Real-time Stock</th>
                <th style={{ padding: "1rem 1.5rem" }}>Status Badge</th>
                <th style={{ padding: "1rem 1.5rem", textAlign: "right" }}>Manual Adjustments</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                product.variations?.map((variation, vIdx) => {
                  const itemKey = `${product.id}-${variation.id || variation.size}`;
                  const isEditing = editingStockKey === itemKey;
                  const status = getStockStatus(variation.stock, threshold);

                  return (
                    <tr 
                      key={itemKey}
                      style={{ 
                        borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
                        background: vIdx === 0 ? "rgba(255, 255, 255, 0.01)" : "transparent"
                      }}
                    >
                      {/* Product Name */}
                      <td style={{ padding: "1rem 1.5rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            style={{ width: "42px", height: "48px", objectFit: "cover", borderRadius: "4px" }} 
                          />
                          <div>
                            <strong style={{ color: "#fff", display: "block", fontSize: "0.92rem" }}>
                              {product.name}
                            </strong>
                            <span style={{ fontSize: "0.72rem", color: "#71717a" }}>
                              {product.brand} • {product.fragranceFamily}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Variation Size */}
                      <td style={{ padding: "1rem 1.5rem", fontWeight: 600, color: "var(--gold-300)" }}>
                        {variation.size}
                      </td>

                      {/* SKU */}
                      <td style={{ padding: "1rem 1.5rem", color: "#a1a1aa", fontSize: "0.8rem", fontFamily: "monospace" }}>
                        {variation.sku || "N/A"}
                      </td>

                      {/* Price */}
                      <td style={{ padding: "1rem 1.5rem", color: "#fff", fontWeight: 600 }}>
                        ${variation.price}
                      </td>

                      {/* Current Stock */}
                      <td style={{ padding: "1rem 1.5rem" }}>
                        {isEditing ? (
                          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                            <input
                              type="number"
                              min="0"
                              value={tempStockValue}
                              onChange={(e) => setTempStockValue(e.target.value)}
                              autoFocus
                              style={{
                                width: "65px",
                                background: "#000",
                                border: "1px solid var(--gold-500)",
                                color: "#fff",
                                padding: "0.3rem",
                                borderRadius: "4px"
                              }}
                            />
                            <button
                              onClick={() => handleSaveStock(product.id, variation.id)}
                              style={{
                                background: "var(--gold-500)",
                                color: "#000",
                                border: "none",
                                padding: "0.3rem 0.5rem",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "0.75rem",
                                fontWeight: 600
                              }}
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingStockKey(null)}
                              style={{
                                background: "none",
                                border: "none",
                                color: "#71717a",
                                cursor: "pointer",
                                fontSize: "0.75rem"
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span style={{ fontSize: "1.1rem", fontWeight: 700, color: variation.stock === 0 ? "#f87171" : variation.stock <= threshold ? "#fbbf24" : "#fff" }}>
                              {variation.stock}
                            </span>
                            <button
                              onClick={() => {
                                setEditingStockKey(itemKey);
                                setTempStockValue(variation.stock.toString());
                              }}
                              style={{ background: "none", border: "none", color: "#71717a", cursor: "pointer" }}
                              title="Edit exact stock"
                            >
                              <Edit2 size={13} />
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td style={{ padding: "1rem 1.5rem" }}>
                        <span className={`badge-stock ${status.badgeClass}`}>
                          {status.label}
                        </span>
                      </td>

                      {/* Quick Adjust buttons */}
                      <td style={{ padding: "1rem 1.5rem", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                          <button
                            onClick={() => handleQuickAdjust(product.id, variation.id, variation.stock, -1)}
                            disabled={variation.stock <= 0}
                            style={{
                              background: "rgba(255, 255, 255, 0.05)",
                              border: "1px solid rgba(255, 255, 255, 0.1)",
                              color: "#fff",
                              width: "28px",
                              height: "28px",
                              borderRadius: "4px",
                              cursor: variation.stock <= 0 ? "not-allowed" : "pointer"
                            }}
                            title="Decrement 1"
                          >
                            -1
                          </button>
                          <button
                            onClick={() => handleQuickAdjust(product.id, variation.id, variation.stock, 1)}
                            style={{
                              background: "rgba(255, 255, 255, 0.05)",
                              border: "1px solid rgba(255, 255, 255, 0.1)",
                              color: "#fff",
                              width: "28px",
                              height: "28px",
                              borderRadius: "4px",
                              cursor: "pointer"
                            }}
                            title="Increment 1"
                          >
                            +1
                          </button>
                          <button
                            onClick={() => handleQuickAdjust(product.id, variation.id, variation.stock, 10)}
                            style={{
                              background: "rgba(212, 175, 55, 0.15)",
                              border: "1px solid var(--border-gold)",
                              color: "var(--gold-300)",
                              padding: "0.2rem 0.5rem",
                              borderRadius: "4px",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              cursor: "pointer"
                            }}
                            title="Restock batch +10"
                          >
                            +10
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
