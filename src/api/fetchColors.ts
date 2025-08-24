import { colorsData } from '../data/colorsData';

export const fetchColors = async (): Promise<string[]> => {
  return new Promise((resolve) => setTimeout(() => resolve(colorsData), 500));
};