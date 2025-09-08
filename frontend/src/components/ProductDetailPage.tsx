import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Heart, Share2, ArrowLeft, Plus, Minus, ShoppingCart, Truck, Shield, RotateCcw, ThumbsUp } from 'lucide-react';
import { ProductDetails, Review } from '../types/Product';

interface ProductDetailPageProps {
  product: ProductDetails;
  onAddToCart: (product: ProductDetails, quantity: number) => void;
  onBack: () => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  onAddToCart,
  onBack
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState<'description' | 'specifications' | 'reviews'>('description');
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
  };

  const renderStars = (rating: number, size: 'sm' | 'lg' = 'sm') => {
    const starSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const ReviewCard: React.FC<{ review: Review }> = ({ review }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-4 mb-4"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
            {review.userName.charAt(0)}
          </div>
          <div>
            <h4 className="font-semibold text-sm">{review.userName}</h4>
            {review.verified && (
              <span className="text-xs text-green-600 flex items-center">
                <Shield className="w-3 h-3 mr-1" />
                Verified Purchase
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          {renderStars(review.rating)}
          <p className="text-xs text-gray-500 mt-1">{review.date}</p>
        </div>
      </div>
      
      <h5 className="font-semibold text-sm mb-2">{review.title}</h5>
      <p className="text-sm text-gray-600 mb-3">{review.comment}</p>
      
      {review.images && review.images.length > 0 && (
        <div className="flex space-x-2 mb-3">
          {review.images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt="Review"
              className="w-16 h-16 object-cover rounded-lg"
            />
          ))}
        </div>
      )}
      
      <div className="flex items-center justify-between text-xs text-gray-500">
        <button className="flex items-center space-x-1 hover:text-blue-600">
          <ThumbsUp className="w-3 h-3" />
          <span>Helpful ({review.helpful})</span>
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center">
          <button
            onClick={onBack}
            className="btn mr-4 flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold">{product.name}</h1>
            <p className="text-sm text-gray-600">by {product.owner}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              className={`btn-outline ${isWishlisted ? 'text-red-500 border-red-500' : ''}`}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
            <button className="btn-outline">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-2xl overflow-hidden shadow-lg">
              <img
                src={product.images[selectedImageIndex] || product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/images/default/product-placeholder.svg';
                }}
              />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 ${
                      selectedImageIndex === idx ? 'border-blue-500' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/default/product-placeholder.svg';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-4 mb-2">
                {renderStars(product.avgRating || 0, 'lg')}
                <span className="text-sm text-gray-600">
                  ({product.reviewCount} reviews)
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">{product.description}</p>
              
              {product.tags && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {product.tags.map((tag) => (
                    <span key={tag} className="badge">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Pricing */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-baseline space-x-2 mb-2">
                <span className="text-3xl font-bold text-gray-900">₹{product.price}</span>
                {product.deposit && (
                  <span className="text-sm text-gray-500">+ ₹{product.deposit} deposit</span>
                )}
              </div>
              <p className="text-sm text-green-600 mb-4">
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </p>

              {/* Quantity Selector */}
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-sm font-medium">Quantity:</span>
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-100"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 min-w-[50px] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="p-2 hover:bg-gray-100"
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="btn-primary w-full mb-4 flex items-center justify-center"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>

              {/* Product Features */}
              <div className="grid grid-cols-3 gap-4 text-center text-xs">
                <div className="flex flex-col items-center space-y-1">
                  <Truck className="w-5 h-5 text-blue-600" />
                  <span>Free Delivery</span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <RotateCcw className="w-5 h-5 text-green-600" />
                  <span>Easy Returns</span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <Shield className="w-5 h-5 text-purple-600" />
                  <span>Warranty</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-12">
          <div className="flex border-b border-gray-200">
            {[
              { key: 'description', label: 'Description' },
              { key: 'specifications', label: 'Specifications' },
              { key: 'reviews', label: `Reviews (${product.reviewCount})` }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedTab(tab.key as any)}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  selectedTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mt-6">
            {selectedTab === 'description' && (
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">{product.fullDescription}</p>
                {product.brand && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Brand Information</h4>
                    <p>Brand: {product.brand}</p>
                    {product.warranty && <p>Warranty: {product.warranty}</p>}
                  </div>
                )}
              </div>
            )}

            {selectedTab === 'specifications' && (
              <div className="grid md:grid-cols-2 gap-6">
                {Object.entries(product.specifications || {}).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-600">{key}</span>
                    <span className="text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
            )}

            {selectedTab === 'reviews' && (
              <div>
                <div className="mb-6 bg-white p-6 rounded-xl shadow-sm">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{product.avgRating?.toFixed(1)}</div>
                      {renderStars(product.avgRating || 0, 'lg')}
                      <div className="text-sm text-gray-500 mt-1">
                        {product.reviewCount} reviews
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {product.reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
