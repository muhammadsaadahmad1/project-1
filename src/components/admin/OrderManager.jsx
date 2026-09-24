import React, { useState } from "react";
import { 
  ShoppingBag, 
  Check, 
  X, 
  Package, 
  Truck, 
  MessageCircle, 
  ExternalLink, 
  Search, 
  Filter, 
  Clock, 
  User, 
  MapPin, 
  Phone, 
  CreditCard 
} from "lucide-react";
import { useStore } from "../../context/StoreContext";
import { 
  formatWhatsAppOrderMessage, 
  formatCustomerStatusMessage, 
  generateWhatsAppLink 
} from "../../services/whatsappService";

export const OrderManager = () => {
  const { orders, updateOrderStatus, settings } = useStore();
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const filteredOrders = orders.filter(order => {
    const matchesFilter = filterStatus === "all" || order.status === filterStatus;
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      order.id.toLowerCase().includes(term) ||
      order.customer?.name?.toLowerCase().includes(term) ||
      order.customer?.email?.toLowerCase().includes(term) ||
      order.customer?.phone?.includes(term);
    return matchesFilter && matchesSearch;
  });

  const handleStatusChange = async (orderId, newStatus) => {
    await updateOrderStatus(orderId, newStatus);
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(prev => ({ ...prev, status: newStatus }));
    }
  };

  const sendWhatsAppUpdateToCustomer = (order, newStatus) => {
    const msg = formatCustomerStatusMessage(order, newStatus);
    const link = generateWhatsAppLink(order.customer.phone, msg);
    window.open(link, "_blank");
  };

  const openAdminWhatsAppReceipt = (order) => {
    const msg = formatWhatsAppOrderMessage(order, "AURA PARFUMS");
    const link = generateWhatsAppLink(settings?.adminWhatsappNumber || "+923159146234", msg);
    window.open(link, "_blank");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Controls Bar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "1rem"
      }}>
        <div>
          <h3 style={{ fontSize: "1.4rem", color: "#fff", marginBottom: "0.2rem" }}>
            Orders & WhatsApp Business Management
          </h3>
          <p style={{ fontSize: "0.82rem", color: "#a1a1aa" }}>
            Real-time feed with mobile WhatsApp dispatch, instant status transitions, and customer notification triggers.
          </p>
        </div>

        {/* Filter Pills */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
          {["all", "pending", "confirmed", "preparing", "shipped", "rejected"].map(status => {
            const isSelected = filterStatus === status;
            return (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                style={{
                  background: isSelected ? "var(--gold-500)" : "rgba(255, 255, 255, 0.04)",
                  color: isSelected ? "#000" : "#a1a1aa",
                  border: `1px solid ${isSelected ? "var(--gold-500)" : "rgba(255, 255, 255, 0.08)"}`,
                  padding: "0.35rem 0.75rem",
                  borderRadius: "6px",
                  fontSize: "0.78rem",
                  fontWeight: isSelected ? 600 : 400,
                  textTransform: "capitalize",
                  cursor: "pointer",
                  transition: "all 0.15s"
                }}
              >
                {status}
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Grid & Detail Drawer Layout */}
      <div style={{ display: "grid", gridTemplateColumns: selectedOrder ? "1.2fr 1fr" : "1fr", gap: "1.5rem" }}>
        {/* Left Side: Order List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {filteredOrders.length === 0 ? (
            <div className="glass-panel" style={{ padding: "3rem", textAlign: "center", color: "#71717a" }}>
              <ShoppingBag size={40} color="#3f3f46" style={{ margin: "0 auto 0.75rem auto" }} />
              <h4 style={{ color: "#fff" }}>No Orders Found</h4>
              <p style={{ fontSize: "0.85rem" }}>No orders matching current filter.</p>
            </div>
          ) : (
            filteredOrders.map(order => {
              const isSelected = selectedOrder?.id === order.id;

              return (
                <div
                  key={order.id}
                  className="glass-panel"
                  onClick={() => setSelectedOrder(order)}
                  style={{
                    padding: "1.25rem",
                    cursor: "pointer",
                    borderColor: isSelected ? "var(--gold-500)" : "var(--border-subtle)",
                    background: isSelected ? "rgba(212, 175, 55, 0.08)" : "rgba(18, 18, 22, 0.7)",
                    transition: "all 0.2s"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.6rem" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                        <span style={{ fontSize: "1.05rem", fontWeight: 700, color: "#fff" }}>
                          #{order.id}
                        </span>
                        <span style={{
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          padding: "0.2rem 0.55rem",
                          borderRadius: "999px",
                          textTransform: "uppercase",
                          background: 
                            order.status === "pending" ? "rgba(245, 158, 11, 0.15)" :
                            order.status === "confirmed" ? "rgba(59, 130, 246, 0.15)" :
                            order.status === "preparing" ? "rgba(168, 85, 247, 0.15)" :
                            order.status === "shipped" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                          color: 
                            order.status === "pending" ? "#fbbf24" :
                            order.status === "confirmed" ? "#60a5fa" :
                            order.status === "preparing" ? "#c084fc" :
                            order.status === "shipped" ? "#34d399" : "#f87171"
                        }}>
                          {order.status}
                        </span>
                      </div>
                      <span style={{ fontSize: "0.78rem", color: "#a1a1aa" }}>
                        {order.customer.name} • {order.customer.phone}
                      </span>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--gold-300)" }}>
                        ${order.total}
                      </span>
                      <span style={{ display: "block", fontSize: "0.72rem", color: "#71717a" }}>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Item preview */}
                  <div style={{ fontSize: "0.82rem", color: "#d4d4d8", marginBottom: "0.8rem" }}>
                    {order.items.map(i => `${i.productName} (${i.size}) x${i.quantity}`).join(" • ")}
                  </div>

                  {/* Mobile Admin Direct Action Buttons */}
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                    paddingTop: "0.6rem",
                    borderTop: "1px solid rgba(255, 255, 255, 0.05)"
                  }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: "flex", gap: "0.4rem" }}>
                      {order.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleStatusChange(order.id, "confirmed")}
                            style={{
                              background: "rgba(16, 185, 129, 0.15)",
                              border: "1px solid rgba(16, 185, 129, 0.35)",
                              color: "#34d399",
                              padding: "0.3rem 0.65rem",
                              borderRadius: "4px",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.3rem"
                            }}
                          >
                            <Check size={13} />
                            <span>Accept Order</span>
                          </button>

                          <button
                            onClick={() => handleStatusChange(order.id, "rejected")}
                            style={{
                              background: "rgba(239, 68, 68, 0.15)",
                              border: "1px solid rgba(239, 68, 68, 0.35)",
                              color: "#f87171",
                              padding: "0.3rem 0.65rem",
                              borderRadius: "4px",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.3rem"
                            }}
                          >
                            <X size={13} />
                            <span>Reject</span>
                          </button>
                        </>
                      )}

                      {order.status === "confirmed" && (
                        <button
                          onClick={() => handleStatusChange(order.id, "preparing")}
                          style={{
                            background: "rgba(168, 85, 247, 0.15)",
                            border: "1px solid rgba(168, 85, 247, 0.35)",
                            color: "#c084fc",
                            padding: "0.3rem 0.65rem",
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.3rem"
                          }}
                        >
                          <Package size={13} />
                          <span>Mark Preparing</span>
                        </button>
                      )}

                      {order.status === "preparing" && (
                        <button
                          onClick={() => handleStatusChange(order.id, "shipped")}
                          style={{
                            background: "rgba(59, 130, 246, 0.15)",
                            border: "1px solid rgba(59, 130, 246, 0.35)",
                            color: "#60a5fa",
                            padding: "0.3rem 0.65rem",
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.3rem"
                          }}
                        >
                          <Truck size={13} />
                          <span>Mark Shipped</span>
                        </button>
                      )}
                    </div>

                    {/* WhatsApp Action */}
                    <button
                      onClick={() => openAdminWhatsAppReceipt(order)}
                      style={{
                        background: "rgba(37, 211, 102, 0.12)",
                        border: "1px solid rgba(37, 211, 102, 0.35)",
                        color: "#34d399",
                        padding: "0.3rem 0.65rem",
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.3rem"
                      }}
                    >
                      <MessageCircle size={13} color="#25d366" />
                      <span>WhatsApp Payload</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Side: Selected Order Inspection Drawer */}
        {selectedOrder && (
          <div className="glass-panel" style={{ padding: "1.75rem", height: "fit-content", position: "sticky", top: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.2rem" }}>
              <div>
                <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--gold-400)", letterSpacing: "0.1em" }}>
                  Order Details Dossier
                </span>
                <h4 style={{ fontSize: "1.3rem", color: "#fff", margin: 0 }}>
                  Order #{selectedOrder.id}
                </h4>
              </div>

              <button className="btn-icon" onClick={() => setSelectedOrder(null)} style={{ width: "32px", height: "32px" }}>
                <X size={15} />
              </button>
            </div>

            {/* Customer Dossier */}
            <div style={{ background: "rgba(255, 255, 255, 0.02)", padding: "1rem", borderRadius: "8px", marginBottom: "1.2rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#fff", fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.4rem" }}>
                <User size={15} color="var(--gold-400)" />
                <span>{selectedOrder.customer.name}</span>
              </div>
              <div style={{ fontSize: "0.8rem", color: "#a1a1aa", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <Phone size={13} /> {selectedOrder.customer.phone}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <MapPin size={13} /> {typeof selectedOrder.customer.address === "object" ? selectedOrder.customer.address.street : selectedOrder.customer.address}
                </span>
                {selectedOrder.customer.notes && (
                  <span style={{ fontStyle: "italic", color: "var(--gold-300)", marginTop: "0.2rem" }}>
                    Notes: "{selectedOrder.customer.notes}"
                  </span>
                )}
              </div>
            </div>

            {/* Items List */}
            <h5 style={{ fontSize: "0.85rem", textTransform: "uppercase", color: "#71717a", marginBottom: "0.5rem", letterSpacing: "0.08em" }}>
              Purchased Creations ({selectedOrder.items.length})
            </h5>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "1.5rem" }}>
              {selectedOrder.items.map((item, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem" }}>
                  <div>
                    <span style={{ color: "#fff", fontWeight: 500 }}>{item.productName}</span>
                    <span style={{ color: "var(--gold-400)", marginLeft: "0.5rem" }}>({item.size})</span>
                  </div>
                  <span style={{ color: "#a1a1aa" }}>
                    {item.quantity} × ${item.price} = <strong style={{ color: "#fff" }}>${item.quantity * item.price}</strong>
                  </span>
                </div>
              ))}
              <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "0.6rem", display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "1.1rem", color: "var(--gold-300)" }}>
                <span>Total Amount:</span>
                <span>${selectedOrder.total}</span>
              </div>
            </div>

            {/* Customer Status Update Action */}
            <div style={{ background: "rgba(37, 211, 102, 0.08)", border: "1px solid rgba(37, 211, 102, 0.25)", padding: "1rem", borderRadius: "8px", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#34d399", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>
                <MessageCircle size={16} />
                <span>Notify Customer on WhatsApp</span>
              </div>
              <p style={{ fontSize: "0.78rem", color: "#a1a1aa", marginBottom: "0.75rem" }}>
                Send real-time status update template to patron's phone: <strong>{selectedOrder.customer.phone}</strong>
              </p>
              <button
                className="btn-whatsapp"
                onClick={() => sendWhatsAppUpdateToCustomer(selectedOrder, selectedOrder.status)}
                style={{ width: "100%", padding: "0.6rem", fontSize: "0.82rem" }}
              >
                <span>Dispatch "{selectedOrder.status.toUpperCase()}" WhatsApp Alert</span>
                <ExternalLink size={13} />
              </button>
            </div>

            {/* Status Change Selector */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Override Order Status:</label>
              <select
                className="form-select"
                value={selectedOrder.status}
                onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
              >
                <option value="pending">Pending Review</option>
                <option value="confirmed">Confirmed / Accepted</option>
                <option value="preparing">Preparing & Bottling</option>
                <option value="shipped">Shipped with Courier</option>
                <option value="rejected">Rejected / Cancelled</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
