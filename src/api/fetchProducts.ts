import { Product } from '../types';
import { productsData } from '../data/productsData';
import { detailProductsData } from '../data/detailProductsData';

export const fetchProducts = async (
  queryParams: { brand?: string; size?: string; color?: string; name?: string },
  page: number,
  itemsPerPage: number
): Promise<{ data: Product[]; total: number }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filtered = productsData;
      if (queryParams.brand && !isNaN(parseInt(queryParams.brand))) {
        filtered = filtered.filter((p) => p.brandId === parseInt(queryParams.brand!));
      }
      if (queryParams.size || queryParams.color) {
        const validProductIds = detailProductsData
          .filter((dp) => {
            const sizeMatch = !queryParams.size || dp.size === queryParams.size;
            const colorMatch = !queryParams.color || dp.color === queryParams.color;
            return sizeMatch && colorMatch;
          })
          .map((dp) => dp.productId);
        filtered = filtered.filter((p) => validProductIds.includes(p.id));
      }
      if (queryParams.name && typeof queryParams.name === 'string') {
        filtered = filtered.filter((p) => p.name.toLowerCase().includes(queryParams.name!.toLowerCase()));
      }
      const start = (page - 1) * itemsPerPage;
      const paginated = filtered.slice(start, start + itemsPerPage);
      resolve({ data: paginated, total: filtered.length });
    }, 500);
  });
};