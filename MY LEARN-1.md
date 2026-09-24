# MY LEARN-1: Project Blueprint & Technical Development Journal
**Project:** AURA PARFUMS (Haute Parfumerie Luxury E-Commerce Platform)  
**Initial Milestone Date:** September 2026  
**Document Purpose:** Living technical log, architecture reference, and developmental milestone tracker for the fragrance e-commerce web platform. This document will be continuously updated as new features, backend connections, and enhancements are introduced.

---

## 1. Project Vision & Brand Aesthetic

**AURA PARFUMS** is an ultra-premium fragrance e-commerce platform designed with the visual gravitas of a Parisian *Haute Parfumerie*. 

### Design Identity
- **Obsidian Dark Luxury Theme**: Deep midnight tones (`#09090B`, `#111114`, `#18181D`) providing contrast against fragrance flacons.
- **Imperial Gold Accents**: Tailored metallic gradients (`#FEF0C7` to `#D4AF37` to `#937118`) with subtle gold box-shadow glows.
- **Bespoke Glassmorphism**: Translucent frosted panels (`backdrop-filter: blur(16px)` with delicate 1px gold borders).
- **Editorial Typography**: 
  - *Cormorant Garamond* (Google Fonts) for regal, timeless editorial serif headings.
  - *Outfit* (Google Fonts) for modern, clean interface legibility, product badges, and numbers.
- **Zero Placeholder Guarantee**: High-resolution curated fragrance flacon photography with full olfactory notes.

---

## 2. Technology Stack & Architecture

| Tier | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 18** (Functional components, Hooks, Context API) | Component modularity, reactive state propagation, real-time UI updates |
| **Build & Dev Tool** | **Vite 5** | Instant HMR (Hot Module Replacement) and optimized production rollup bundling |
| **Styling** | **Vanilla CSS** (`src/index.css`) | Full control, zero bloat, custom animations (shimmer, pulse, slide drawers), responsive breakpoints |
| **Iconography** | **Lucide-React** | Consistent, minimalist iconography (flacons, stars, carts, security locks, WhatsApp) |
| **Database & Backend** | **Firebase (Cloud Firestore)** | Real-time document database for products, multi-size variations, inventory, orders, and reviews |
| **Authentication** | **Firebase Auth + Passcode Vault** | Patron authentication and Atelier Master cryptographic administrative clearance |
| **Concierge & Orders** | **WhatsApp Business API & Webhooks** | Pre-formatted order payloads, deep-link dispatch, and mobile admin order progression |
| **Architecture Mode** | **Dual-Mode Engine** | Runs out of the box with zero-config reactive local persistence; switches seamlessly to live Cloud Firestore when keys are supplied |

---

## 3. Work Completed So Far

### Feature 1: Product Management
- **Atelier Admin Command Center**: Accessed via the **Admin** button in the header (secured by Master Passcode).
- **Creation & Editing Suite**:
  - Fragrance Title, Maison/Brand, Concentration Subtitle (*Extrait de Parfum*, *Eau de Parfum*, etc.).
  - Olfactory Family classification (*Woody Oriental*, *Floral*, *Woody*, *Citrus Fresh*, *Oriental*, *Gourmand*).
  - Gender targeting (*Unisex*, *Pour Femme*, *Pour Homme*).
  - Detailed Olfactory Story & sensory description.
  - Olfactory Pyramid Note breakdown: Top Notes, Heart/Sillage Notes, Base Notes.
  - High-resolution flacon image URL.
- **Multi-Size / Volume Variations**:
  - Dynamically add multiple volumes to a single perfume (e.g., `30ml Travel`, `50ml Flacon`, `100ml Prestige Decanter`).
  - Each variation has its own independent **Price ($)**, **SKU code**, and **Real-Time Stock count**.
- **Listing Actions**: Searchable catalog table with direct Edit and Delete capabilities.

### Feature 2: Real-Time Inventory System
- **Atomic Stock Decrement**: Placing an order atomically decreases inventory for the specific size/volume variation purchased.
- **Dynamic Stock Status Badges**:
  - `In Stock` (Emerald green badge).
  - `Low Stock • Only X Left!` (Pulsing amber badge triggering urgency when units ≤ threshold).
  - `Out of Stock` / `Depleted` (Red badge disabling cart checkout for that variation).
- **Replenishment Alert Center**: Prominent banner alerting the admin to all critical items that have fallen below the threshold.
- **Manual Stock Adjustments**: Instant `+1`, `-1`, `+10 Restock` controls and an inline numeric editor inside the Admin Inventory Matrix.
- **Customizable Threshold**: Admin can adjust the low-stock alert threshold (default: 5 units).

### Feature 3: Order Management & WhatsApp Business API
- **Automated WhatsApp Business Dispatch**:
  - Configured to route orders to the Master Admin WhatsApp Number: **`+92 315-9146234`**.
  - Formats customer info, items, variation sizes, quantities, prices, delivery address, and concierge notes into a pre-structured WhatsApp template.
  - One-click "Send to Atelier on WhatsApp" button on order completion.
  - Standardized JSON payload generator ready for Meta WhatsApp Cloud API webhooks.
- **Mobile Admin Progression Actions**:
  - Admin can accept or reject pending orders directly with one tap.
  - Status progression workflow: `Pending` ➔ `Confirmed` ➔ `Preparing` ➔ `Shipped` (or `Rejected`).
- **Real-Time Customer Status Notifications**:
  - Formats and dispatches instant status update messages to the customer on WhatsApp.
  - Storefront **Live Concierge Tracking** timeline (`OrderHistoryModal`) updates automatically when the admin changes order status.

### Feature 4: Real-Time Customer Reviews & Star Ratings
- **Live Feed**: Customer reviews appear on the product page immediately without requiring a page refresh.
- **Rating Score & Breakdown**:
  - Live average rating calculation (e.g., 4.9 ★) and total review count.
  - Five-tier breakdown progress bars (5★, 4★, 3★, 2★, 1★).
- **Certified Patron Submission**:
  - 1 to 5 interactive star selector.
  - Review headline and detailed olfactory impressions.
  - Certified Patron Buyer verification tag.
- **Admin Moderation Toggle**:
  - Switch between **Auto-Publish** (reviews appear live immediately) and **Require Moderation** (reviews queue for admin approval).
  - Admin review queue with Approve, Unpublish, and Delete actions.

### Feature 5: Customer Storefront Experience
- **Luxury Hero Section**: Editorial fragrance reveal with direct WhatsApp Scent Concierge link (`+92 315-9146234`).
- **Olfactory Search & Family Filters**: Instant search by note (Oud, Vanilla, Saffron, Bergamot) and scent family pills.
- **Interactive Olfactory Pyramid**: Modal breakdown of Top, Heart, and Base notes with dedicated sensory tags.
- **Slide-out Cart Bag**: Quantity adjusters with stock ceiling limits, item removal, and a **Free Express Courier Progress Bar** ($150 threshold).
- **Concierge Checkout Modal**: Patron information form, card/COD/digital wallet payment selection, and instant stock allocation commit.
- **Customer Order Dossier & Tracking**: View order timeline and receipt anytime.

### Feature 6: Admin Security & Passcode Clearance
- **Master Passcode Challenge**: Clicking the **Admin** button now opens the **Admin Passcode Modal** (`AdminPasscodeModal.jsx`), preventing unauthorized access.
- **Default Master Passcode**: `aura2026` (configurable inside Admin Settings).
- **Session-Scoped Clearance**: Clearance is bound to the active session (`sessionStorage`), meaning newly opened sessions require authentication.
- **One-Click Lock**: Admin header includes a "Lock" button to revoke clearance immediately.

---

## 4. File Structure & Component Map

```
1-project/
├── index.html                           # Root HTML shell with luxury Google Fonts
├── package.json                         # Dependencies (React 18, Vite, Firebase, Lucide)
├── vite.config.js                       # Vite build & dev server config
├── MY LEARN-1.md                        # This project development & learning journal
├── public/
│   └── favicon.svg                      # Custom SVG gold flacon favicon
└── src/
    ├── main.jsx                         # React 18 DOM mount
    ├── App.jsx                          # Root orchestrator (navbar, hero, grid, modals)
    ├── index.css                        # Obsidian Noir & Imperial Gold design system
    ├── config/
    │   └── firebase.js                  # Dual-mode Firebase client & reactive fallback
    ├── context/
    │   ├── AuthContext.jsx              # Patron auth state & admin passcode clearance
    │   ├── CartContext.jsx              # Bag state, variation tracking, stock limits
    │   └── StoreContext.jsx             # Real-time sync for products, orders, inventory, reviews
    ├── services/
    │   ├── inventoryService.js          # Stock calculations, atomic decrement, alerts
    │   ├── orderService.js              # Order creation, status pipeline
    │   ├── reviewService.js             # Live review metrics & star distribution
    │   └── whatsappService.js           # WhatsApp Business formatters & deep-link URLs
    ├── components/
    │   ├── Navbar.jsx                   # Brand logo, search, bag badge, admin toggle
    │   ├── HeroBanner.jsx               # Visual hero showcase & WhatsApp concierge
    │   ├── ProductCard.jsx              # Product card with variation chips & stock pill
    │   ├── ProductDetailModal.jsx       # Olfactory Pyramid & embedded live reviews
    │   ├── ReviewsSection.jsx           # Star breakdown, review submission form, live feed
    │   ├── CartDrawer.jsx               # Slide-out bag with free shipping tracker
    │   ├── CheckoutModal.jsx            # Shipping form, payment simulation, stock commit
    │   ├── OrderSuccessModal.jsx        # Receipt modal with instant WhatsApp dispatch
    │   ├── OrderHistoryModal.jsx        # Customer live progression tracker
    │   ├── AuthModal.jsx                # Patron account & profile modal
    │   ├── AdminPasscodeModal.jsx       # Passcode challenge modal (aura2026)
    │   └── admin/
    │       ├── AdminLayout.jsx          # Admin layout, KPI summary pills, tab navigation
    │       ├── ProductManager.jsx       # Add/Edit/Delete products & size variations
    │       ├── InventoryManager.jsx     # Real-time stock matrix, threshold alerts, restock
    │       ├── OrderManager.jsx         # Live orders feed, WhatsApp triggers, status updates
    │       ├── ReviewModerator.jsx      # Review moderation queue & auto-approve switch
    │       └── FirebaseSettingsModal.jsx# Live Firebase credentials input & settings
    └── data/
        └── initialProducts.js           # Luxury seed catalog with rich notes & variations
```

---

## 5. Technical Challenges & How They Were Solved

1. **Workspace Directory Trailing Space**:
   - *Challenge*: The user's workspace path on macOS was `/Users/saad/Desktop/1-project ` (with a trailing space), causing initial commands targeting `1-project` to fail.
   - *Solution*: Created a symlink linking `/Users/saad/Desktop/1-project` to `/Users/saad/Desktop/1-project ` and ensured all file operations specifically handle the quoted directory path.
2. **Direct Admin Dashboard Bypass**:
   - *Challenge*: The Admin dashboard was previously opening directly without prompting for the password because clearance was cached in `localStorage`.
   - *Solution*: 
     - Created `AdminPasscodeModal.jsx` to intercept any admin open event.
     - Changed authentication storage to `sessionStorage` and cleared stale permanent local storage keys.
     - Added an internal guard in `AdminLayout.jsx` so that even direct render attempts will default to the passcode challenge screen until verified.
3. **WhatsApp Concierge Number Centralization**:
   - *Challenge*: The default concierge number needed to route directly to user's WhatsApp: `+92 315-9146234`.
   - *Solution*: Centralized the number in `initialProducts.js`, added automatic migration logic in `StoreContext.jsx` to overwrite old cached local storage defaults, and updated all concierge dispatch links and footers.
4. **Real-time Atomic Stock Updates**:
   - *Challenge*: Needed orders to decrement variation stock immediately without full page reloads.
   - *Solution*: Built `decrementStockForOrder()` which immutably updates the specific variation inside the product document, synchronizes with both the state layer and Firestore, and immediately recalculates low-stock alert badges.

---

## 6. How to Run the Project

1. **Start the Development Server**:
   ```bash
   npm run dev
   ```
2. **Open in Browser**:
   Navigate to: **[http://localhost:5173/](http://localhost:5173/)**
3. **Administrative Access**:
   - Click the **Admin** button in the top right of the navigation bar.
   - Enter Master Passcode: **`aura2026`**
4. **Connect Live Firebase Cloud Firestore**:
   - Inside the Admin Portal, click **Firebase & System Settings**.
   - Paste your Firebase project keys (`apiKey`, `projectId`, etc.) and click **Save & Connect Firebase**. The app will reload and connect live to Cloud Firestore!

---

## 7. Development Changelog & Future Milestones

- **v1.0 (Current)**:
  - Full storefront with luxury design system.
  - Multi-variation product management (size/price/stock).
  - Real-time inventory tracking with atomic order decrements and low-stock alerts.
  - WhatsApp Business API integration (direct message dispatch & customer alerts) routed to `+92 315-9146234`.
  - Real-time customer reviews and star rating breakdown with admin moderation.
  - Admin passcode security gate (`AdminPasscodeModal`) with passcode `aura2026`.
  - Dual-mode Firebase integration (local reactive + live Firestore ready).
- **v1.1 (Upcoming Milestones)**:
  - To be updated based on user direction (e.g. backend Firebase rules deployment, custom branding tweaks, removing or customizing hero trust cards).
