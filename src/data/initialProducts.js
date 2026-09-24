// Initial luxury fragrance catalog for AURA PARFUMS
export const INITIAL_PRODUCTS = [
  {
    id: "frag-001",
    name: "Oud Royale Nocturne",
    brand: "Aura Atelier",
    subtitle: "Extrait de Parfum • 25% Concentration",
    gender: "Unisex",
    fragranceFamily: "Woody Oriental",
    description: "An intoxicating symphony of wild Cambodian agarwood, charred bourbon vanilla, and saffron threads. Deep, mysterious, and eternally memorable with an all-night sillage.",
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=900&q=80",
    bannerImage: "https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=1400&q=80",
    isFeatured: true,
    isNew: true,
    notes: {
      top: ["Saffron", "Bitter Almond", "Bergamot"],
      heart: ["Amberwood", "Jasmine Grandiflorum", "Cedar"],
      base: ["Cambodian Oud", "Bourbon Vanilla", "Tonka Bean", "Cashmeran"]
    },
    variations: [
      { id: "v-001-50", size: "50ml", price: 175, stock: 18, sku: "ORN-50ML" },
      { id: "v-001-100", size: "100ml", price: 265, stock: 4, sku: "ORN-100ML" } // Low stock demonstration (<5)
    ],
    rating: {
      average: 4.9,
      count: 28
    },
    createdAt: "2026-09-01T10:00:00.000Z"
  },
  {
    id: "frag-002",
    name: "Rose de Taif & Silk",
    brand: "Maison d'Or",
    subtitle: "Eau de Parfum • Rare Botanical Harvest",
    gender: "Pour Femme",
    fragranceFamily: "Floral",
    description: "Harvested at dawn on high mountain terraces, precious Arabian Damask roses mingle with sparkling pink pepper, velvety peony, and a soft cashmere musk drydown.",
    image: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=900&q=80",
    isFeatured: true,
    isNew: false,
    notes: {
      top: ["Pink Pepper", "Italian Mandarin", "Lychee"],
      heart: ["Taif Rose Absolute", "Damask Peony", "Freesia"],
      base: ["Cashmere Musk", "White Patchouli", "Ambergris"]
    },
    variations: [
      { id: "v-002-50", size: "50ml", price: 155, stock: 12, sku: "RTS-50ML" },
      { id: "v-002-100", size: "100ml", price: 235, stock: 9, sku: "RTS-100ML" }
    ],
    rating: {
      average: 4.8,
      count: 19
    },
    createdAt: "2026-09-05T12:00:00.000Z"
  },
  {
    id: "frag-003",
    name: "Santal & Smoked Iris",
    brand: "Aura Atelier",
    subtitle: "Extrait de Parfum • Reserve Collection",
    gender: "Unisex",
    fragranceFamily: "Woody",
    description: "Creamy Australian sandalwood embraced by powdery Florentine iris butter, smoky papyrus, and subtle cardamom. An architectural, modern masterpiece of quiet luxury.",
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=900&q=80",
    isFeatured: true,
    isNew: false,
    notes: {
      top: ["Guatemalan Cardamom", "Violet Leaf", "Smoked Papyrus"],
      heart: ["Florentine Orris Butter", "Virginian Cedarwood", "Amyris"],
      base: ["Sandalwood Album", "White Amber", "Iso E Super"]
    },
    variations: [
      { id: "v-003-30", size: "30ml Travel", price: 95, stock: 15, sku: "SSI-30ML" },
      { id: "v-003-50", size: "50ml", price: 165, stock: 2, sku: "SSI-50ML" }, // Urgent low stock (< 3)
      { id: "v-003-100", size: "100ml", price: 250, stock: 7, sku: "SSI-100ML" }
    ],
    rating: {
      average: 5.0,
      count: 34
    },
    createdAt: "2026-09-10T15:30:00.000Z"
  },
  {
    id: "frag-004",
    name: "Bergamot Soleil Botanique",
    brand: "Riviera Parfums",
    subtitle: "Eau de Parfum • High Citrus Essence",
    gender: "Unisex",
    fragranceFamily: "Citrus Fresh",
    description: "Sun-drenched Calabrian bergamot, sea salt breeze, neroli blossoms, and sun-warmed vetiver. Invigorating, aristocratic, and brimming with Mediterranean light.",
    image: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=900&q=80",
    isFeatured: false,
    isNew: true,
    notes: {
      top: ["Calabrian Bergamot", "Bitter Orange", "Fleur de Sel"],
      heart: ["Tunisian Neroli", "Rosemary", "Petitgrain"],
      base: ["Haitian Vetiver", "White Musk", "Cedar Moss"]
    },
    variations: [
      { id: "v-004-50", size: "50ml", price: 140, stock: 22, sku: "BSB-50ML" },
      { id: "v-004-100", size: "100ml", price: 210, stock: 14, sku: "BSB-100ML" }
    ],
    rating: {
      average: 4.7,
      count: 15
    },
    createdAt: "2026-09-12T09:15:00.000Z"
  },
  {
    id: "frag-005",
    name: "Cuir Imperial & Cognac",
    brand: "Maison d'Or",
    subtitle: "Extrait de Parfum • Dark Leather",
    gender: "Pour Homme",
    fragranceFamily: "Oriental",
    description: "Aged oak cognac casks, Tuscan leather jacket, smoked tobacco leaf, and melted golden honey. Bold, masculine, and intensely charismatic.",
    image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=900&q=80",
    isFeatured: false,
    isNew: false,
    notes: {
      top: ["Cognac Accord", "Cinnamon Bark", "Bitter Nutmeg"],
      heart: ["Tuscan Leather", "Blonde Tobacco", "Incense"],
      base: ["Black Amber", "Oakmoss", "Benzoin Tears"]
    },
    variations: [
      { id: "v-005-50", size: "50ml", price: 185, stock: 1, sku: "CIC-50ML" }, // Critical stock: 1 left!
      { id: "v-005-100", size: "100ml", price: 280, stock: 0, sku: "CIC-100ML" } // Out of stock demonstration
    ],
    rating: {
      average: 4.9,
      count: 22
    },
    createdAt: "2026-09-14T11:45:00.000Z"
  },
  {
    id: "frag-006",
    name: "Vanilla Noire Gourmande",
    brand: "Aura Atelier",
    subtitle: "Eau de Parfum • Sensual Gourmand",
    gender: "Pour Femme",
    fragranceFamily: "Gourmand",
    description: "Madagascar black vanilla bean, toasted caramelized pralines, salted caramel, and luminous white amber. Decadent yet elegant, wrapped in cashmere warmth.",
    image: "https://images.unsplash.com/photo-1563178406-4cdc2923acbc?auto=format&fit=crop&w=900&q=80",
    isFeatured: true,
    isNew: false,
    notes: {
      top: ["Caramelized Pear", "Almond Blossom"],
      heart: ["Praline Noir", "Orchid", "Heliotrope"],
      base: ["Madagascar Vanilla Bean", "Sandalwood", "Amber"]
    },
    variations: [
      { id: "v-006-50", size: "50ml", price: 150, stock: 8, sku: "VNG-50ML" },
      { id: "v-006-100", size: "100ml", price: 225, stock: 5, sku: "VNG-100ML" }
    ],
    rating: {
      average: 4.9,
      count: 41
    },
    createdAt: "2026-09-15T17:20:00.000Z"
  }
];

export const INITIAL_REVIEWS = [
  {
    id: "rev-101",
    productId: "frag-001",
    userId: "usr-901",
    userName: "Alexander Vance",
    userLocation: "London, UK",
    rating: 5,
    title: "Mesmerizing sillage and pure luxury",
    comment: "This is easily one of the most exquisite oud fragrances I have ever smelled. The Cambodian oud is clean, dark, and beautifully balanced with bourbon vanilla. Lasts over 14 hours on my skin.",
    verifiedPurchase: true,
    status: "approved",
    createdAt: "2026-09-18T14:22:00.000Z"
  },
  {
    id: "rev-102",
    productId: "frag-001",
    userId: "usr-902",
    userName: "Elena Rostova",
    userLocation: "Dubai, UAE",
    rating: 5,
    title: "Signature scent worthy",
    comment: "Received endless compliments at the gala. The saffron opening into deep amberwood is intoxicating. Worth every penny.",
    verifiedPurchase: true,
    status: "approved",
    createdAt: "2026-09-19T09:12:00.000Z"
  },
  {
    id: "rev-103",
    productId: "frag-003",
    userId: "usr-903",
    userName: "Julian Mercer",
    userLocation: "Paris, France",
    rating: 5,
    title: "The iris butter makes this sublime",
    comment: "Soft yet commanding. The powdery iris melts into the sandalwood so seamlessly. Packaging arrived impeccably sealed.",
    verifiedPurchase: true,
    status: "approved",
    createdAt: "2026-09-20T16:05:00.000Z"
  }
];

export const INITIAL_ORDERS = [
  {
    id: "ORD-92041",
    customer: {
      name: "Marcus Aurelius Sterling",
      email: "marcus.sterling@example.com",
      phone: "+447911123456",
      address: "14 Belgrave Square, Knightsbridge, London SW1X 8PS, UK",
      notes: "Please leave with concierge if unavailable."
    },
    items: [
      {
        productId: "frag-001",
        productName: "Oud Royale Nocturne",
        brand: "Aura Atelier",
        size: "100ml",
        price: 265,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=300&q=80"
      }
    ],
    subtotal: 265,
    shipping: 0,
    total: 265,
    status: "preparing", // pending | confirmed | preparing | shipped | rejected
    paymentMethod: "Credit Card (Secure Stripe)",
    paymentStatus: "paid",
    whatsappNotified: true,
    createdAt: "2026-09-20T11:30:00.000Z"
  },
  {
    id: "ORD-92042",
    customer: {
      name: "Sophia Al-Maktoum",
      email: "sophia.m@example.com",
      phone: "+971501234567",
      address: "Villa 42, Palm Jumeirah, Dubai, UAE",
      notes: "Express morning delivery preferred."
    },
    items: [
      {
        productId: "frag-002",
        productName: "Rose de Taif & Silk",
        brand: "Maison d'Or",
        size: "50ml",
        price: 155,
        quantity: 2,
        image: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=300&q=80"
      }
    ],
    subtotal: 310,
    shipping: 0,
    total: 310,
    status: "confirmed",
    paymentMethod: "Cash on Delivery",
    paymentStatus: "pending",
    whatsappNotified: true,
    createdAt: "2026-09-21T08:15:00.000Z"
  }
];

export const APP_SETTINGS = {
  currencySymbol: "$",
  currencyCode: "USD",
  adminWhatsappNumber: "+923159146234",
  adminPasscode: "aura2026",
  lowStockThreshold: 5,
  freeShippingThreshold: 150,
  requireReviewModeration: false
};
