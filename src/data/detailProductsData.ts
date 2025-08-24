import { ProductDetail } from '../types';
import { sizesData } from './sizesData';
import { colorsData } from './colorsData';

export const detailProductsData: ProductDetail[] = (() => {
  const result: ProductDetail[] = [];
  let idCounter = 1;
  const stockRange = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

  for (let productId = 1; productId <= 55; productId++) {
    for (const size of sizesData) {
      for (const color of colorsData) {
        result.push({
          id: idCounter++,
          productId,
          stock: stockRange(50, 120),
          size,
          color,
        });
      }
    }
  }
  return result;
})();