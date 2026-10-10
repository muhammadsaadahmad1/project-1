export interface ProductVariation {
  id: string;
  size: string;
  price: number;
  stock: number;
  sku?: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  subtitle: string;
  gender: string;
  fragranceFamily: string;
  description: string;
  image: string;
  bannerImage?: string;
  isFeatured: boolean;
  isNew: boolean;
  notes: {
    top: string[];
    heart: string[];
    base: string[];
  };
  variations: ProductVariation[];
  rating: { average: number; count: number };
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  brand?: string;
  size: string;
  variationId?: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Order {
  id: string;
  userId?: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    notes?: string;
  };
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "failed" | string;
  status: "pending" | "confirmed" | "preparing" | "shipped" | "rejected" | string;
  createdAt: string;
  updatedAt?: string;
  whatsappNotified?: boolean;
}

export interface User {
  id: string;
  displayName: string;
  email: string;
  phone?: string;
  address?: string;
  role?: "user" | "admin";
  emailVerified?: boolean;
  phoneVerified?: boolean;
}

export interface Review {
  id: string;
  productId: string;
  userId?: string | null;
  userName: string;
  userLocation?: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface StoreSettings {
  adminWhatsappNumber: string;
  freeShippingThreshold: number;
  lowStockThreshold: number;
  requireReviewModeration: boolean;
  [key: string]: unknown;
}