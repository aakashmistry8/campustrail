import React from 'react';
import { Product } from '../types/Product';
import { cn } from '../lib/utils';

interface ProductCardProps {
  product: Product;
  onAdd: (p: Product) => void;
  onViewProduct?: (p: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAdd, onViewProduct }) => {
  return (
  <div className="card animate-fadeIn" role="article" aria-labelledby={`prod-${product.id}-title`} tabIndex={0}>
      <div className="card-media" onClick={() => onViewProduct?.(product)} style={{ cursor: onViewProduct ? 'pointer' : 'default' }}>
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name}
            onError={(e) => {
              // Fallback to SVG product image
              const target = e.target as HTMLImageElement;
              if (target.src !== 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&h=600&fit=crop') {
                target.src = 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&h=600&fit=crop';
              }
            }}
          />
        ) : (
          <svg width="400" height="225" xmlns="http://www.w3.org/2000/svg">
            <rect width="400" height="225" fill="#f1f5f9"/>
            <rect x="125" y="65" width="150" height="95" rx="5" fill="#cbd5e1"/>
            <circle cx="175" cy="100" r="15" fill="#64748b"/>
            <rect x="200" y="95" width="50" height="10" rx="2" fill="#64748b"/>
            <text x="200" y="170" font-family="Arial" font-size="14" text-anchor="middle" fill="#334155">
              {product.name}
            </text>
          </svg>
        )}
      </div>
  <h3 id={`prod-${product.id}-title`} className="card-title">{product.name}</h3>
    <p className="card-meta line-clamp-2">{product.description}</p>
  <div className="mt-3 flex flex-col gap-1 text-[11px] text-soft">
        {product.avgRating != null && (
          <div className="flex justify-between items-center">
            <span className="font-semibold">Rating</span>
            <span aria-label="average rating" className="inline-flex items-center gap-1">
              {product.avgRating.toFixed(1)}<span className="text-[10px] text-muted">({product.reviewCount||0})</span>
            </span>
          </div>
        )}
        <div className="flex justify-between"><span className="font-semibold">Price</span><span aria-label="price">₹{product.price.toFixed(2)}</span></div>
        {product.deposit!=null && <div className="flex justify-between"><span className="font-semibold">Deposit</span><span aria-label="deposit">₹{product.deposit.toFixed(2)}</span></div>}
        {product.owner && <div className="flex justify-between"><span className="font-semibold">Owner</span><span aria-label="owner" className="truncate max-w-[140px]">{product.owner}</span></div>}
        <div className="flex justify-between items-center pt-1">
          {product.stock > 0 ? <span className="badge">In Stock</span> : <span className="badge" data-variant="danger">Out</span>}
          <span className="price-tag">₹{product.price.toFixed(2)}</span>
        </div>
      </div>
      <div className="card-actions">
        {onViewProduct && (
          <button
            onClick={() => onViewProduct(product)}
            className="btn-outline w-full justify-center mb-2"
            aria-label={`View details for ${product.name}`}
          >
            View Details
          </button>
        )}
        <button
          disabled={product.stock===0}
          onClick={()=>onAdd(product)}
          className={cn('btn-brand w-full justify-center', product.stock===0 && 'opacity-50 cursor-not-allowed')}
          aria-disabled={product.stock===0}
          aria-label={`Add ${product.name} to cart`}
        >Add to Cart</button>
      </div>
    </div>
  );
};
