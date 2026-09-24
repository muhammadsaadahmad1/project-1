// Real-time Reviews and Rating Service for AURA PARFUMS

/**
 * Calculates updated average rating and count for a product from its approved reviews
 */
export const calculateProductRatingMetrics = (reviews, productId) => {
  const productReviews = reviews.filter(
    r => r.productId === productId && r.status === "approved"
  );

  if (productReviews.length === 0) {
    return { average: 0, count: 0 };
  }

  const sum = productReviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
  const average = Number((sum / productReviews.length).toFixed(1));

  return {
    average,
    count: productReviews.length
  };
};

/**
 * Computes rating breakdown counts (5-star, 4-star, etc.)
 */
export const getRatingBreakdown = (reviews, productId) => {
  const productReviews = reviews.filter(
    r => r.productId === productId && r.status === "approved"
  );
  
  const total = productReviews.length;
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  productReviews.forEach(r => {
    const star = Math.round(r.rating);
    if (distribution[star] !== undefined) {
      distribution[star]++;
    }
  });

  return {
    total,
    distribution,
    percentages: {
      5: total ? Math.round((distribution[5] / total) * 100) : 0,
      4: total ? Math.round((distribution[4] / total) * 100) : 0,
      3: total ? Math.round((distribution[3] / total) * 100) : 0,
      2: total ? Math.round((distribution[2] / total) * 100) : 0,
      1: total ? Math.round((distribution[1] / total) * 100) : 0
    }
  };
};
