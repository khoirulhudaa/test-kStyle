import { Brand } from '../types';
import { brandsData } from '../data/brandsData';

export const fetchBrands = async (
  queryParams: { name?: string; brand?: string },
  page: number,
  itemsPerPage: number
): Promise<{ data: Brand[]; total: number }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filtered = brandsData;
      if (queryParams.name && typeof queryParams.name === 'string') {
        filtered = filtered.filter((b) => b.name.toLowerCase().includes(queryParams.name!.toLowerCase()));
      }
      if (queryParams.brand && !isNaN(parseInt(queryParams.brand))) {
        filtered = filtered.filter((b) => b.id === parseInt(queryParams.brand!));
      }
      const start = (page - 1) * itemsPerPage;
      const paginated = filtered.slice(start, start + itemsPerPage);
      resolve({ data: paginated, total: filtered.length });
    }, 500);
  });
};