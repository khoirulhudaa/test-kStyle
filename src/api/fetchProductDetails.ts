import { Product, ProductDetail } from '../types';
import { productsData } from '../data/productsData';
import { detailProductsData } from '../data/detailProductsData';

export const fetchProductDetails = async (
  productId: number
): Promise<{ product: Product | undefined; details: ProductDetail[] }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const product = productsData.find((p) => p.id === productId);
      const details = detailProductsData.filter((dp) => dp.productId === productId);
      resolve({ product, details });
    }, 500);
  });
};