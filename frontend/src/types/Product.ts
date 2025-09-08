export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number; // 1-5 stars
  title: string;
  comment: string;
  date: string; // ISO date string
  verified: boolean; // verified purchase
  helpful: number; // number of helpful votes
  images?: string[]; // optional review images
}

export interface ProductDetails extends Product {
  fullDescription: string;
  specifications: Record<string, string>;
  tags: string[];
  reviews: Review[];
  images: string[]; // multiple product images
  brand?: string;
  weight?: string;
  dimensions?: string;
  material?: string;
  warranty?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  stock: number;
  category?: string;
  deposit?: number;
  owner?: string;
  avgRating?: number;
  reviewCount?: number;
}
