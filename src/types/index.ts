export interface Brand {
  id: number;
  name: string;
  image: string;
}

export interface Product {
  id: number;
  name: string;
  brandId: number;
  price: number;
  image: string;
  description: string;
  shop_name: string;
}

export interface ProductDetail {
  id: number;
  productId: number;
  stock: number;
  size: string;
  color: string;
}