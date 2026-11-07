import test from 'node:test';
import assert from 'node:assert/strict';
import { productMatchesSearch, getSearchRecommendations } from './searchRecommendations.js';

const products = [
  {
    id: 'p1',
    name: 'Oud Royale Nocturne',
    brand: 'Aura Atelier',
    fragranceFamily: 'Woody Oriental',
    gender: 'Unisex',
    notes: {
      top: ['Saffron', 'Bergamot'],
      heart: ['Amberwood', 'Jasmine'],
      base: ['Cambodian Oud', 'Bourbon Vanilla']
    },
    productType: 'fragrance'
  },
  {
    id: 'p2',
    name: 'Citrus Bloom Veil',
    brand: 'Riviera Parfums',
    fragranceFamily: 'Citrus Fresh',
    gender: 'Pour Femme',
    notes: {
      top: ['Grapefruit', 'Lemon Zest'],
      heart: ['Orange Blossom', 'Jasmine'],
      base: ['White Musk', 'Amber']
    },
    productType: 'fragrance'
  }
];

test('matches a woody fragrance query against family and notes', () => {
  assert.equal(productMatchesSearch(products[0], 'woody'), true);
  assert.equal(productMatchesSearch(products[0], 'oud'), true);
  assert.equal(productMatchesSearch(products[1], 'citrus'), true);
  assert.equal(productMatchesSearch(products[0], 'citrus'), true);
});

test('returns relevant recommendations for scent families and notes', () => {
  const woodyResults = getSearchRecommendations(products, 'woody', 5);
  const citrusResults = getSearchRecommendations(products, 'citrus', 5);

  assert.ok(woodyResults.some((result) => result.label === 'Oud Royale Nocturne'));
  assert.ok(citrusResults.some((result) => result.label === 'Citrus Bloom Veil'));
});
