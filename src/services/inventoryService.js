// Real-time Inventory System Service for AURA PARFUMS

/**
 * Get stock status and human-readable label based on quantity and threshold
 */
export const getStockStatus = (stock, threshold = 5) => {
  if (stock <= 0) {
    return {
      status: "out_of_stock",
      label: "Out of Stock",
      badgeClass: "badge-out-of-stock",
      isAvailable: false
    };
  }
  if (stock <= threshold) {
    return {
      status: "low_stock",
      label: `Low Stock • Only ${stock} Left!`,
      badgeClass: "badge-low-stock",
      isAvailable: true
    };
  }
  return {
    status: "in_stock",
    label: "In Stock",
    badgeClass: "badge-in-stock",
    isAvailable: true
  };
};

/**
 * Calculates total stock and lowest status for a fragrance with multiple variations
 */
export const getProductTotalInventory = (product, threshold = 5) => {
  if (!product.variations || product.variations.length === 0) {
    return {
      totalStock: 0,
      hasStock: false,
      hasLowStock: false,
      allOutOfStock: true,
      minPrice: 0,
      maxPrice: 0
    };
  }

  const totalStock = product.variations.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
  const prices = product.variations.map(v => Number(v.price) || 0);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const hasLowStock = product.variations.some(v => v.stock > 0 && v.stock <= threshold);
  const allOutOfStock = product.variations.every(v => v.stock <= 0);

  return {
    totalStock,
    hasStock: totalStock > 0,
    hasLowStock,
    allOutOfStock,
    minPrice,
    maxPrice
  };
};

/**
 * Decrements inventory atomically for items in an order
 */
export const decrementStockForOrder = (products, orderItems) => {
  const updatedProducts = products.map(product => {
    // Find all items in this order for this product
    const matchingOrderItems = orderItems.filter(item => item.productId === product.id);
    if (matchingOrderItems.length === 0) {
      return product;
    }

    // Decrement corresponding variations
    const updatedVariations = product.variations.map(variation => {
      const match = matchingOrderItems.find(item => item.size === variation.size || item.variationId === variation.id);
      if (match) {
        const newStock = Math.max(0, (Number(variation.stock) || 0) - match.quantity);
        return {
          ...variation,
          stock: newStock
        };
      }
      return variation;
    });

    return {
      ...product,
      variations: updatedVariations
    };
  });

  return updatedProducts;
};

/**
 * Identifies low stock items across the entire product catalog for Admin Alerts
 */
export const getLowStockAlerts = (products, threshold = 5) => {
  const alerts = [];

  products.forEach(product => {
    product.variations?.forEach(variation => {
      if (variation.stock <= threshold) {
        alerts.push({
          productId: product.id,
          productName: product.name,
          brand: product.brand,
          variationId: variation.id,
          size: variation.size,
          stock: variation.stock,
          isDepleted: variation.stock === 0,
          sku: variation.sku || "N/A"
        });
      }
    });
  });

  return alerts.sort((a, b) => a.stock - b.stock);
};
