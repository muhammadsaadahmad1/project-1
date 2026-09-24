import React, { useState } from "react";
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Package, 
  Image, 
  Check, 
  X, 
  Layers, 
  Search, 
  Sparkles 
} from "lucide-react";
import { useStore } from "../../context/StoreContext";

export const ProductManager = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Form State
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("Aura Atelier");
  const [subtitle, setSubtitle] = useState("Extrait de Parfum • Reserve Edition");
  const [gender, setGender] = useState("Unisex");
  const [fragranceFamily, setFragranceFamily] = useState("Woody Oriental");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [topNotes, setTopNotes] = useState("");
  const [heartNotes, setHeartNotes] = useState("");
  const [baseNotes, setBaseNotes] = useState("");
  
  // Variations State
  const [variations, setVariations] = useState([
    { id: "v-1", size: "50ml", price: 160, stock: 15, sku: "FL-50ML" },
    { id: "v-2", size: "100ml", price: 240, stock: 10, sku: "FL-100ML" }
  ]);

  const openAddModal = () => {
    setEditingProduct(null);
    setName("");
    setBrand("Aura Atelier");
    setSubtitle("Extrait de Parfum • Reserve Edition");
    setGender("Unisex");
    setFragranceFamily("Woody Oriental");
    setDescription("");
    setImage("https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=900&q=80");
    setTopNotes("Bergamot, Cardamom, Pink Pepper");
    setHeartNotes("Amberwood, Damask Rose, Cedar");
    setBaseNotes("Oud, Bourbon Vanilla, Sandalwood");
    setVariations([
      { id: `v-${Date.now()}-1`, size: "50ml", price: 160, stock: 15, sku: "NEW-50" },
      { id: `v-${Date.now()}-2`, size: "100ml", price: 240, stock: 8, sku: "NEW-100" }
    ]);
    setIsModalOpen(true);
  };

  const openEditModal = (prod) => {
    setEditingProduct(prod);
    setName(prod.name);
    setBrand(prod.brand);
    setSubtitle(prod.subtitle || "");
    setGender(prod.gender || "Unisex");
    setFragranceFamily(prod.fragranceFamily || "Woody Oriental");
    setDescription(prod.description || "");
    setImage(prod.image || "");
    setTopNotes(prod.notes?.top?.join(", ") || "");
    setHeartNotes(prod.notes?.heart?.join(", ") || "");
    setBaseNotes(prod.notes?.base?.join(", ") || "");
    setVariations(prod.variations ? [...prod.variations] : []);
    setIsModalOpen(true);
  };

  const handleAddVariation = () => {
    setVariations(prev => [
      ...prev,
      {
        id: `v-${Date.now()}`,
        size: "30ml Travel",
        price: 95,
        stock: 12,
        sku: `SKU-${Math.floor(100 + Math.random() * 900)}`
      }
    ]);
  };

  const handleRemoveVariation = (idx) => {
    if (variations.length <= 1) {
      alert("At least one size variation is required for a fragrance.");
      return;
    }
    setVariations(prev => prev.filter((_, i) => i !== idx));
  };

  const handleVariationChange = (idx, field, value) => {
    setVariations(prev => prev.map((v, i) => {
      if (i === idx) {
        return {
          ...v,
          [field]: field === "price" || field === "stock" ? Math.max(0, parseFloat(value) || 0) : value
        };
      }
      return v;
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const productPayload = {
      name: name.trim(),
      brand: brand.trim(),
      subtitle: subtitle.trim(),
      gender,
      fragranceFamily,
      description: description.trim(),
      image: image.trim() || "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=900&q=80",
      notes: {
        top: topNotes.split(",").map(s => s.trim()).filter(Boolean),
        heart: heartNotes.split(",").map(s => s.trim()).filter(Boolean),
        base: baseNotes.split(",").map(s => s.trim()).filter(Boolean)
      },
      variations: variations.map(v => ({
        id: v.id || `v-${Date.now()}-${Math.random()}`,
        size: v.size,
        price: Number(v.price),
        stock: Number(v.stock),
        sku: v.sku || "N/A"
      }))
    };

    if (editingProduct) {
      await updateProduct(editingProduct.id, productPayload);
    } else {
      await addProduct(productPayload);
    }

    setIsModalOpen(false);
  };

  const handleDelete = async (prodId, prodName) => {
    if (confirm(`Are you sure you want to permanently delete "${prodName}" from the boutique catalog?`)) {
      await deleteProduct(prodId);
    }
  };

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Top Action Row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h3 style={{ fontSize: "1.4rem", color: "#fff", marginBottom: "0.2rem" }}>
            Fragrance Catalog & Formulae
          </h3>
          <p style={{ fontSize: "0.82rem", color: "#a1a1aa" }}>
            Add new perfumes, configure multi-size volumes, prices, olfactory pyramids, and manage active listings.
          </p>
        </div>

        <button className="btn-gold" onClick={openAddModal}>
          <Plus size={16} />
          <span>Add New Fragrance Flacon</span>
        </button>
      </div>

      {/* Catalog Table */}
      <div className="glass-panel" style={{ overflow: "hidden" }}>
        <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between" }}>
          <div style={{ position: "relative", width: "320px" }}>
            <Search size={15} color="#71717a" style={{ position: "absolute", left: "0.8rem", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              className="form-input"
              style={{ padding: "0.45rem 2.2rem", fontSize: "0.82rem" }}
              placeholder="Search catalog by name or brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <span style={{ fontSize: "0.82rem", color: "#a1a1aa", alignSelf: "center" }}>
            Showing {filtered.length} Fragrances
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.88rem" }}>
            <thead>
              <tr style={{ background: "rgba(255, 255, 255, 0.02)", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", color: "#71717a", fontSize: "0.75rem", textTransform: "uppercase" }}>
                <th style={{ padding: "1rem 1.5rem" }}>Fragrance Flacon</th>
                <th style={{ padding: "1rem 1.5rem" }}>Scent Family</th>
                <th style={{ padding: "1rem 1.5rem" }}>Volume Variations & Prices</th>
                <th style={{ padding: "1rem 1.5rem" }}>Total Stock</th>
                <th style={{ padding: "1rem 1.5rem" }}>Average Rating</th>
                <th style={{ padding: "1rem 1.5rem", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const totalStock = p.variations?.reduce((s, v) => s + (v.stock || 0), 0) || 0;
                return (
                  <tr key={p.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                    <td style={{ padding: "1rem 1.5rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <img 
                          src={p.image} 
                          alt={p.name} 
                          style={{ width: "48px", height: "54px", objectFit: "cover", borderRadius: "6px", border: "1px solid rgba(255, 255, 255, 0.1)" }} 
                        />
                        <div>
                          <strong style={{ color: "#fff", fontSize: "0.95rem", display: "block" }}>
                            {p.name}
                          </strong>
                          <span style={{ fontSize: "0.75rem", color: "#a1a1aa" }}>
                            {p.brand} • {p.gender}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: "1rem 1.5rem", color: "var(--gold-300)" }}>
                      {p.fragranceFamily}
                    </td>

                    <td style={{ padding: "1rem 1.5rem" }}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                        {p.variations?.map((v, i) => (
                          <span key={i} style={{
                            background: "rgba(255, 255, 255, 0.04)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            padding: "0.2rem 0.5rem",
                            borderRadius: "4px",
                            fontSize: "0.74rem",
                            color: "#e4e4e7"
                          }}>
                            {v.size}: <strong>${v.price}</strong> ({v.stock} in stock)
                          </span>
                        ))}
                      </div>
                    </td>

                    <td style={{ padding: "1rem 1.5rem", fontWeight: 700, color: totalStock === 0 ? "#f87171" : totalStock <= 10 ? "#fbbf24" : "#fff" }}>
                      {totalStock} units
                    </td>

                    <td style={{ padding: "1rem 1.5rem" }}>
                      {p.rating ? (
                        <span style={{ color: "var(--gold-400)", fontWeight: 600 }}>
                          ★ {p.rating.average} ({p.rating.count})
                        </span>
                      ) : "Unrated"}
                    </td>

                    <td style={{ padding: "1rem 1.5rem", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "0.5rem" }}>
                        <button
                          className="btn-outline"
                          onClick={() => openEditModal(p)}
                          style={{ padding: "0.4rem 0.75rem", fontSize: "0.75rem" }}
                          title="Edit Product"
                        >
                          <Edit3 size={13} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          style={{
                            background: "rgba(239, 68, 68, 0.1)",
                            border: "1px solid rgba(239, 68, 68, 0.3)",
                            color: "#f87171",
                            padding: "0.4rem 0.65rem",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "0.75rem"
                          }}
                          title="Delete Product"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div 
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ width: "100%", maxWidth: "840px", padding: "2.5rem" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "1.5rem", color: "#fff", margin: 0 }}>
                {editingProduct ? `Edit Creation: ${editingProduct.name}` : "Formulate New Fragrance Flacon"}
              </h3>
              <button className="btn-icon" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem", marginBottom: "1.2rem" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Fragrance Title *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Imperial Oud Santal"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Maison / Brand *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Aura Atelier"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.2rem", marginBottom: "1.2rem" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Concentration Subtitle</label>
                  <input
                    type="text"
                    className="form-input"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="Extrait de Parfum • 30%"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Scent Family</label>
                  <select
                    className="form-select"
                    value={fragranceFamily}
                    onChange={(e) => setFragranceFamily(e.target.value)}
                  >
                    <option value="Woody Oriental">Woody Oriental</option>
                    <option value="Floral">Floral</option>
                    <option value="Woody">Woody</option>
                    <option value="Citrus Fresh">Citrus Fresh</option>
                    <option value="Oriental">Oriental</option>
                    <option value="Gourmand">Gourmand</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Gender Classification</label>
                  <select
                    className="form-select"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <option value="Unisex">Unisex</option>
                    <option value="Pour Femme">Pour Femme</option>
                    <option value="Pour Homme">Pour Homme</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Olfactory Story & Description *</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the mood, distillation origin, sillage and sensory emotion..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">High-Resolution Flacon Image URL *</label>
                <input
                  type="url"
                  className="form-input"
                  required
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                />
              </div>

              {/* Olfactory Pyramid Fields */}
              <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border-gold)", borderRadius: "8px", padding: "1.2rem", marginBottom: "1.5rem" }}>
                <h4 style={{ fontSize: "0.95rem", color: "var(--gold-400)", marginBottom: "0.85rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Olfactory Pyramid Notes (Comma-Separated)
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: "0.72rem" }}>Top Notes</label>
                    <input
                      type="text"
                      className="form-input"
                      value={topNotes}
                      onChange={(e) => setTopNotes(e.target.value)}
                      placeholder="e.g. Saffron, Bergamot"
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: "0.72rem" }}>Heart Notes</label>
                    <input
                      type="text"
                      className="form-input"
                      value={heartNotes}
                      onChange={(e) => setHeartNotes(e.target.value)}
                      placeholder="e.g. Amberwood, Rose"
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: "0.72rem" }}>Base Notes</label>
                    <input
                      type="text"
                      className="form-input"
                      value={baseNotes}
                      onChange={(e) => setBaseNotes(e.target.value)}
                      placeholder="e.g. Oud, Vanilla, Musk"
                    />
                  </div>
                </div>
              </div>

              {/* Variations Management */}
              <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "8px", padding: "1.2rem", marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
                  <div>
                    <h4 style={{ fontSize: "0.95rem", color: "#fff", margin: 0 }}>
                      Product Variations (Volume & Stock Allocation)
                    </h4>
                    <span style={{ fontSize: "0.72rem", color: "#a1a1aa" }}>
                      Each volume has its own price, SKU and real-time inventory counter.
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddVariation}
                    style={{
                      background: "rgba(212, 175, 55, 0.15)",
                      border: "1px solid var(--border-gold)",
                      color: "var(--gold-300)",
                      padding: "0.3rem 0.75rem",
                      borderRadius: "4px",
                      fontSize: "0.75rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem"
                    }}
                  >
                    <Plus size={13} />
                    <span>Add Size Variation</span>
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {variations.map((v, idx) => (
                    <div 
                      key={idx}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1.4fr 1fr 1fr 1fr auto",
                        gap: "0.75rem",
                        alignItems: "center",
                        background: "rgba(0, 0, 0, 0.4)",
                        padding: "0.6rem 0.85rem",
                        borderRadius: "6px"
                      }}
                    >
                      <div>
                        <label className="form-label" style={{ fontSize: "0.68rem" }}>Size / Volume</label>
                        <input
                          type="text"
                          className="form-input"
                          value={v.size}
                          onChange={(e) => handleVariationChange(idx, "size", e.target.value)}
                          placeholder="e.g. 50ml"
                          required
                        />
                      </div>

                      <div>
                        <label className="form-label" style={{ fontSize: "0.68rem" }}>Price ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="form-input"
                          value={v.price}
                          onChange={(e) => handleVariationChange(idx, "price", e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <label className="form-label" style={{ fontSize: "0.68rem" }}>Stock Units</label>
                        <input
                          type="number"
                          min="0"
                          className="form-input"
                          value={v.stock}
                          onChange={(e) => handleVariationChange(idx, "stock", e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <label className="form-label" style={{ fontSize: "0.68rem" }}>SKU Code</label>
                        <input
                          type="text"
                          className="form-input"
                          value={v.sku}
                          onChange={(e) => handleVariationChange(idx, "sku", e.target.value)}
                          placeholder="SKU-XXX"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveVariation(idx)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#71717a",
                          cursor: "pointer",
                          marginTop: "1.1rem"
                        }}
                        title="Delete Variation"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
                <button type="button" className="btn-outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-gold">
                  <Check size={16} />
                  <span>{editingProduct ? "Save Changes" : "Create Product"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
