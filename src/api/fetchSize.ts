import { sizesData } from '../data/sizesData';

export const fetchSizes = async (): Promise<string[]> => {
  return new Promise((resolve) => setTimeout(() => resolve(sizesData), 500));
};