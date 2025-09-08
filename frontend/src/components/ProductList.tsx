import React from 'react';
import { ProductCard } from './ProductCard';
import { Product } from '../types/Product';

interface ProductListProps {
  products: Product[];
  onAdd: (p: Product) => void;
  onViewProduct?: (p: Product) => void;
}

export const ProductList: React.FC<ProductListProps> = ({ products, onAdd, onViewProduct }) => {
  return (
  <div className="section-grid">
      {products.map(p => <ProductCard key={p.id} product={p} onAdd={onAdd} onViewProduct={onViewProduct} />)}
    </div>
  );
};
