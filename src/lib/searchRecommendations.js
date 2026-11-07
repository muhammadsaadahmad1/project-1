const normalizeSearchText = (value = "") =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const SEARCH_ALIASES = {
  woody: ["woody", "wood", "woods", "cedar", "sandalwood", "oud", "vetiver", "amberwood", "patchouli"],
  floral: ["floral", "rose", "jasmine", "peony", "lily", "orchid", "gardenia"],
  citrus: ["citrus", "fresh", "bergamot", "lemon", "grapefruit", "orange", "neroli", "mandarin"],
  oriental: ["oriental", "amber", "incense", "cognac", "saffron", "vanilla", "musk"],
  gourmand: ["gourmand", "vanilla", "caramel", "praline", "honey", "toffee", "cocoa"],
  unisex: ["unisex", "clean", "soft", "balanced", "versatile"]
};

const getAliasedTerms = (query) => {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return [];

  const aliases = new Set([normalizedQuery]);
  Object.entries(SEARCH_ALIASES).forEach(([key, terms]) => {
    if (normalizedQuery.includes(key) || terms.some((term) => normalizedQuery.includes(term))) {
      terms.forEach((term) => aliases.add(term));
    }
  });

  return [...aliases];
};

export const productMatchesSearch = (product, rawQuery) => {
  const query = normalizeSearchText(rawQuery);
  if (!query) return true;

  const candidateText = [
    product.name,
    product.brand,
    product.fragranceFamily,
    product.gender,
    product.productType || "fragrance",
    product.description,
    ...(product.notes?.top || []),
    ...(product.notes?.heart || []),
    ...(product.notes?.base || [])
  ].join(" ");

  const searchableText = normalizeSearchText(candidateText);
  const queryTerms = getAliasedTerms(query);

  if (!searchableText) return false;

  if (searchableText.includes(query)) {
    return true;
  }

  return queryTerms.some((term) => searchableText.includes(term));
};

const buildDefaultSuggestions = (products, limit = 6) => {
  const familySuggestions = [...new Set(products.map((product) => product.fragranceFamily).filter(Boolean))];
  const noteSuggestions = [...new Set(
    products.flatMap((product) => [
      ...(product.notes?.top || []),
      ...(product.notes?.heart || []),
      ...(product.notes?.base || [])
    ])
  )].filter(Boolean);

  const suggestions = [
    ...familySuggestions.map((family) => ({ label: family, value: family, type: "family" })),
    ...noteSuggestions.map((note) => ({ label: note, value: note, type: "note" }))
  ];

  return suggestions.slice(0, limit);
};

export const getSearchRecommendations = (products = [], rawQuery = "", limit = 6) => {
  const query = normalizeSearchText(rawQuery);

  if (!query) {
    return buildDefaultSuggestions(products, limit);
  }

  const scoredResults = products
    .map((product) => {
      const normalizedName = normalizeSearchText(product.name);
      const normalizedFamily = normalizeSearchText(product.fragranceFamily);
      const normalizedBrand = normalizeSearchText(product.brand);
      const notesText = normalizeSearchText(
        [...(product.notes?.top || []), ...(product.notes?.heart || []), ...(product.notes?.base || [])].join(" ")
      );

      let score = 0;
      const aliases = getAliasedTerms(query);

      if (normalizedName.includes(query)) score += 25;
      if (normalizedFamily.includes(query)) score += 20;
      if (normalizedBrand.includes(query)) score += 12;
      if (notesText.includes(query)) score += 16;

      aliases.forEach((alias) => {
        if (normalizedName.includes(alias)) score += 10;
        if (normalizedFamily.includes(alias)) score += 18;
        if (notesText.includes(alias)) score += 12;
      });

      if (score > 0) {
        return {
          label: product.name,
          value: product.name,
          type: "product",
          score
        };
      }

      return null;
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  if (scoredResults.length > 0) {
    return scoredResults.map(({ label, value, type }) => ({ label, value, type }));
  }

  const fallback = buildDefaultSuggestions(products, limit);
  return fallback.filter((item) => {
    const haystack = normalizeSearchText(`${item.label} ${item.value}`);
    return haystack.includes(query) || getAliasedTerms(query).some((term) => haystack.includes(term));
  }).slice(0, limit);
};
