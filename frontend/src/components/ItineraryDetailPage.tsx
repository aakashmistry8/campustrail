import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, MapPin, Calendar, Users, Clock, Mountain, Camera, Shield, Share2, Heart, MessageCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { itineraryDetailsData } from '../data/travelDetails';
import { ItineraryDetails } from '../types/TravelTypes';

interface ItineraryDetailPageProps {
  itineraryId: string;
  onBack: () => void;
  onBook: (itineraryId: string, quantity: number) => void;
}

const ItineraryDetailPage: React.FC<ItineraryDetailPageProps> = ({ itineraryId, onBack, onBook }) => {
  const [itinerary, setItinerary] = useState<ItineraryDetails | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const itineraryData = itineraryDetailsData[itineraryId];
    if (itineraryData) {
      setItinerary(itineraryData);
    }
  }, [itineraryId]);

  if (!itinerary) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mb-4"></div>
          <p>Loading itinerary details...</p>
        </div>
      </div>
    );
  }

  const handleBook = () => {
    onBook(itinerary.id, quantity);
    alert(`Booked ${quantity} seat(s) for ${itinerary.title}!`);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'moderate': return 'text-orange-600 bg-orange-100';
      case 'difficult': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Itineraries
            </button>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`p-2 rounded-full transition-colors ${isWishlisted ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
              >
                <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
              <button className="p-2 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                <Share2 className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Gallery */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Main Image */}
              <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                <img
                  src={itinerary.images[selectedImageIndex]}
                  alt={itinerary.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `data:image/svg+xml,${encodeURIComponent(`
                      <svg width="800" height="450" viewBox="0 0 800 450" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="800" height="450" fill="#E5E7EB"/>
                        <path d="M350 200L400 150L450 200L500 150L550 200V250H350V200Z" fill="#9CA3AF"/>
                        <circle cx="375" cy="175" r="15" fill="#9CA3AF"/>
                        <text x="400" y="300" text-anchor="middle" fill="#6B7280" font-family="Arial" font-size="18">${itinerary.title}</text>
                      </svg>
                    `)}`;
                  }}
                />
              </div>

              {/* Image Thumbnails */}
              <div className="flex space-x-4 overflow-x-auto">
                {itinerary.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${itinerary.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = `data:image/svg+xml,${encodeURIComponent(`
                          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="80" height="80" fill="#E5E7EB"/>
                            <path d="M35 35L40 30L45 35L50 30L55 35V45H35V35Z" fill="#9CA3AF"/>
                            <circle cx="37.5" cy="32.5" r="2.5" fill="#9CA3AF"/>
                          </svg>
                        `)}`;
                      }}
                    />
                  </button>
                ))}
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8">
                  {[
                    { key: 'overview', label: 'Overview' },
                    { key: 'itinerary', label: 'Day-by-Day' },
                    { key: 'inclusions', label: 'What\'s Included' },
                    { key: 'reviews', label: `Reviews (${itinerary.reviewCount})` }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab.key
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-3">About This Trip</h3>
                        <p className="text-gray-600 leading-relaxed">{itinerary.fullDescription}</p>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-3">Trip Highlights</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center space-x-3">
                            <Mountain className="w-5 h-5 text-blue-600" />
                            <span>Elevation: {itinerary.elevation}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <MapPin className="w-5 h-5 text-blue-600" />
                            <span>Distance: {itinerary.distance}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Clock className="w-5 h-5 text-blue-600" />
                            <span>{itinerary.duration}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Users className="w-5 h-5 text-blue-600" />
                            <span>{itinerary.groupSize.current}/{itinerary.groupSize.max} travelers</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-3">What to Pack</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {itinerary.packingList.map((item, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-sm">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'itinerary' && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold">Day-by-Day Itinerary</h3>
                      {itinerary.itinerary.map((day, index) => (
                        <div key={index} className="border rounded-lg p-6 bg-white">
                          <div className="flex items-center space-x-4 mb-4">
                            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                              {day.day}
                            </div>
                            <div>
                              <h4 className="font-semibold text-lg">{day.title}</h4>
                              <p className="text-gray-600">{day.description}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">Activities:</span>
                              <ul className="mt-1 space-y-1">
                                {day.activities.map((activity, i) => (
                                  <li key={i} className="text-gray-600">• {activity}</li>
                                ))}
                              </ul>
                            </div>
                            {day.accommodation && (
                              <div>
                                <span className="font-medium text-gray-700">Stay:</span>
                                <p className="mt-1 text-gray-600">{day.accommodation}</p>
                              </div>
                            )}
                            <div>
                              <span className="font-medium text-gray-700">Meals:</span>
                              <p className="mt-1 text-gray-600">{day.meals?.join(', ') || 'Not specified'}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'inclusions' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-green-50 rounded-lg p-6">
                          <h3 className="text-lg font-semibold text-green-800 mb-4">✓ What's Included</h3>
                          <ul className="space-y-2">
                            {itinerary.included.map((item, index) => (
                              <li key={index} className="flex items-center space-x-2 text-green-700">
                                <CheckCircle className="w-4 h-4" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-red-50 rounded-lg p-6">
                          <h3 className="text-lg font-semibold text-red-800 mb-4">✗ What's Not Included</h3>
                          <ul className="space-y-2">
                            {itinerary.excluded.map((item, index) => (
                              <li key={index} className="flex items-center space-x-2 text-red-700">
                                <span className="w-4 h-4 text-center">×</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-blue-800 mb-4">Important Information</h3>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-blue-700 mb-2">Meeting Point</h4>
                            <p className="text-blue-600">{itinerary.meetingPoint}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-blue-700 mb-2">Cancellation Policy</h4>
                            <p className="text-blue-600">{itinerary.cancellationPolicy}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-blue-700 mb-2">Requirements</h4>
                            <ul className="space-y-1">
                              {itinerary.requirements.map((req, index) => (
                                <li key={index} className="text-blue-600">• {req}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'reviews' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Guest Reviews</h3>
                        <div className="flex items-center space-x-2">
                          <div className="flex">{renderStars(itinerary.avgRating || 0)}</div>
                          <span className="font-semibold">{itinerary.avgRating?.toFixed(1) || '0.0'}</span>
                          <span className="text-gray-500">({itinerary.reviewCount} reviews)</span>
                        </div>
                      </div>
                      {itinerary.reviews.map((review) => (
                        <div key={review.id} className="border rounded-lg p-6 bg-white">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-semibold">{review.userName}</span>
                                {review.verified && (
                                  <Shield className="w-4 h-4 text-green-500" />
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="flex">{renderStars(review.rating)}</div>
                                <span className="text-sm text-gray-500">{review.date}</span>
                              </div>
                            </div>
                          </div>
                          <h4 className="font-semibold mb-2">{review.title}</h4>
                          <p className="text-gray-600 mb-3">{review.comment}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <button className="flex items-center space-x-1 hover:text-gray-700">
                              <MessageCircle className="w-4 h-4" />
                              <span>Helpful ({review.helpful})</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-lg shadow-lg p-6 border">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold">{itinerary.title}</h2>
                    <p className="text-gray-600">by {itinerary.creator}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="flex">{renderStars(itinerary.avgRating || 0)}</div>
                      <span className="text-sm text-gray-600">({itinerary.reviewCount})</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(itinerary.difficulty)}`}>
                      {itinerary.difficulty}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-500" />
                      <span>{itinerary.dates}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Users className="w-5 h-5 text-gray-500" />
                      <span>{itinerary.seats} seats available</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-gray-500" />
                      <span>{itinerary.stops.join(' → ')}</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-blue-600">₹{itinerary.price.toLocaleString()}</span>
                      <span className="text-gray-600">per person</span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Number of seats
                        </label>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-semibold">{quantity}</span>
                          <button
                            onClick={() => setQuantity(Math.min(itinerary.seats, quantity + 1))}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>₹{itinerary.price.toLocaleString()} × {quantity}</span>
                          <span>₹{(itinerary.price * quantity).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-lg border-t pt-2">
                          <span>Total</span>
                          <span>₹{(itinerary.price * quantity).toLocaleString()}</span>
                        </div>
                      </div>

                      <button
                        onClick={handleBook}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                      >
                        Book Now
                      </button>

                      <p className="text-xs text-gray-500 text-center">
                        {itinerary.cancellationPolicy.split('.')[0]}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                      <Shield className="w-4 h-4" />
                      <span>Verified guide & secure booking</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Emergency contact: {itinerary.emergencyContact}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItineraryDetailPage;
