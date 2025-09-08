import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, MapPin, Calendar, Users, MessageCircle, Share2, Heart, Shield, Camera, Globe, Clock, CheckCircle, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { companionDetailsData } from '../data/travelDetails';
import { CompanionDetails } from '../types/TravelTypes';

interface CompanionDetailPageProps {
  companionId: string;
  onBack: () => void;
  onConnect: (companionId: string) => void;
}

const CompanionDetailPage: React.FC<CompanionDetailPageProps> = ({ companionId, onBack, onConnect }) => {
  const [companion, setCompanion] = useState<CompanionDetails | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('about');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);

  useEffect(() => {
    const companionData = companionDetailsData[companionId];
    if (companionData) {
      setCompanion(companionData);
    }
  }, [companionId]);

  if (!companion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mb-4"></div>
          <p>Loading companion details...</p>
        </div>
      </div>
    );
  }

  const handleConnect = () => {
    onConnect(companion.id);
    setShowContactInfo(true);
    alert(`Connection request sent to ${companion.name}!`);
  };

  const getVerificationColor = (verified: boolean) => {
    return verified ? 'text-green-600' : 'text-gray-400';
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const getCompatibilityScore = () => {
    // Mock compatibility calculation based on shared interests, travel style, etc.
    return Math.floor(Math.random() * 30) + 70; // Random score between 70-100
  };

  const compatibilityScore = getCompatibilityScore();

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
              Back to Companions
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
          {/* Left Column - Images and Details */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Main Image */}
              <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                <img
                  src={companion.images[selectedImageIndex]}
                  alt={companion.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `data:image/svg+xml,${encodeURIComponent(`
                      <svg width="800" height="450" viewBox="0 0 800 450" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="800" height="450" fill="#E5E7EB"/>
                        <circle cx="400" cy="200" r="60" fill="#9CA3AF"/>
                        <path d="M370 180C370 170 378 160 400 160C422 160 430 170 430 180C430 190 422 200 400 200C378 200 370 190 370 180Z" fill="#6B7280"/>
                        <path d="M340 280C340 260 360 240 400 240C440 240 460 260 460 280V300H340V280Z" fill="#6B7280"/>
                        <text x="400" y="350" text-anchor="middle" fill="#6B7280" font-family="Arial" font-size="18">${companion.name}</text>
                      </svg>
                    `)}`;
                  }}
                />
              </div>

              {/* Image Thumbnails */}
              <div className="flex space-x-4 overflow-x-auto">
                {companion.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${companion.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = `data:image/svg+xml,${encodeURIComponent(`
                          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="80" height="80" fill="#E5E7EB"/>
                            <circle cx="40" cy="35" r="15" fill="#9CA3AF"/>
                            <path d="M25 60C25 50 30 40 40 40C50 40 55 50 55 60V65H25V60Z" fill="#9CA3AF"/>
                          </svg>
                        `)}`;
                      }}
                    />
                  </button>
                ))}
              </div>

              {/* Compatibility Score */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900">Compatibility Score</h3>
                    <p className="text-blue-700">Based on travel preferences and interests</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600">{compatibilityScore}%</div>
                    <div className="text-sm text-blue-500">Great Match!</div>
                  </div>
                </div>
                <div className="mt-4 bg-white rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${compatibilityScore}%` }}
                  ></div>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8">
                  {[
                    { key: 'about', label: 'About' },
                    { key: 'travel-style', label: 'Travel Style' },
                    { key: 'experience', label: 'Experience' },
                    { key: 'reviews', label: `Reviews (${companion.reviewCount})` }
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
                  {activeTab === 'about' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-3">About {companion.name}</h3>
                        <p className="text-gray-600 leading-relaxed">{companion.fullBio}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-2">Basic Info</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Age:</span>
                                <span>{companion.age} years old</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Location:</span>
                                <span>{companion.location}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Response Rate:</span>
                                <span className="text-green-600">{companion.responseRate}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Response Time:</span>
                                <span>{companion.responseTime}</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold text-gray-800 mb-2">Languages</h4>
                            <div className="flex flex-wrap gap-2">
                              {companion.languages.map((lang, index) => (
                                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                  {lang}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-2">Interests</h4>
                            <div className="flex flex-wrap gap-2">
                              {companion.interests.map((interest, index) => (
                                <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                                  {interest}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold text-gray-800 mb-2">Verifications</h4>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Shield className={`w-4 h-4 ${getVerificationColor(companion.verifications.email)}`} />
                                <span className="text-sm">Email verified</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Shield className={`w-4 h-4 ${getVerificationColor(companion.verifications.phone)}`} />
                                <span className="text-sm">Phone verified</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Shield className={`w-4 h-4 ${getVerificationColor(companion.verifications.government_id)}`} />
                                <span className="text-sm">Government ID verified</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'travel-style' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-lg p-6 border">
                          <h4 className="font-semibold text-gray-800 mb-3">Budget Preferences</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Budget Range:</span>
                              <span className="font-medium">{companion.budget.range}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Split Preference:</span>
                              <div className="mt-1">
                                {companion.budget.splitPreference.map((pref, index) => (
                                  <span key={index} className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full mr-2">
                                    {pref}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg p-6 border">
                          <h4 className="font-semibold text-gray-800 mb-3">Availability</h4>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-600">Flexible:</span>
                              <span className={`px-2 py-1 text-xs rounded-full ${companion.availability.flexible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {companion.availability.flexible ? 'Yes' : 'No'}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Preferred Dates:</span>
                              <div className="mt-1">
                                {companion.availability.preferredDates.map((date, index) => (
                                  <div key={index} className="text-sm text-blue-600">{date}</div>
                                ))}
                              </div>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Duration:</span>
                              <span>{companion.availability.duration}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-lg p-6 border">
                          <h4 className="font-semibold text-gray-800 mb-3">Accommodation</h4>
                          <div className="flex flex-wrap gap-2">
                            {companion.accommodation.map((acc, index) => (
                              <span key={index} className="px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full">
                                {acc}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="bg-white rounded-lg p-6 border">
                          <h4 className="font-semibold text-gray-800 mb-3">Transportation</h4>
                          <div className="flex flex-wrap gap-2">
                            {companion.transportation.map((trans, index) => (
                              <span key={index} className="px-3 py-1 bg-teal-100 text-teal-800 text-sm rounded-full">
                                {trans}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-6 border">
                        <h4 className="font-semibold text-gray-800 mb-3">Travel Style</h4>
                        <div className="flex flex-wrap gap-2">
                          {companion.travelStyle.map((style, index) => (
                            <span key={index} className="px-3 py-2 bg-indigo-100 text-indigo-800 text-sm rounded-lg font-medium">
                              {style}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'experience' && (
                    <div className="space-y-6">
                      <div className="bg-white rounded-lg p-6 border">
                        <h3 className="text-lg font-semibold mb-4">Travel Experience</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{companion.experience.totalTrips}</div>
                            <div className="text-sm text-gray-600">Total Trips</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{companion.experience.countries}</div>
                            <div className="text-sm text-gray-600">Countries</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">{companion.avgRating?.toFixed(1) || '0.0'}</div>
                            <div className="text-sm text-gray-600">Avg Rating</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">{companion.responseRate}%</div>
                            <div className="text-sm text-gray-600">Response Rate</div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-6 border">
                        <h4 className="font-semibold text-gray-800 mb-3">Specialties</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {companion.experience.specialties.map((specialty, index) => (
                            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                              <Award className="w-5 h-5 text-yellow-500" />
                              <span className="font-medium">{specialty}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {companion.socialMedia && (
                        <div className="bg-white rounded-lg p-6 border">
                          <h4 className="font-semibold text-gray-800 mb-3">Social Media</h4>
                          <div className="space-y-2">
                            {companion.socialMedia.instagram && (
                              <div className="flex items-center space-x-3">
                                <Camera className="w-5 h-5 text-pink-500" />
                                <a href={`https://instagram.com/${companion.socialMedia.instagram.replace('@', '')}`} 
                                   className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                                  {companion.socialMedia.instagram}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'reviews' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Companion Reviews</h3>
                        <div className="flex items-center space-x-2">
                          <div className="flex">{renderStars(companion.avgRating || 0)}</div>
                          <span className="font-semibold">{companion.avgRating?.toFixed(1) || '0.0'}</span>
                          <span className="text-gray-500">({companion.reviewCount} reviews)</span>
                        </div>
                      </div>
                      {companion.reviews.map((review) => (
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

          {/* Right Column - Connect Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-lg shadow-lg p-6 border">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold">{companion.name}</h2>
                    <p className="text-gray-600">{companion.age} years old • {companion.location}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="flex">{renderStars(companion.avgRating || 0)}</div>
                      <span className="text-sm text-gray-600">({companion.reviewCount})</span>
                    </div>
                    <div className="flex items-center space-x-1 text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Active {companion.lastActive}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="font-medium">{companion.trip}</div>
                        <div className="text-sm text-gray-600">{companion.dates}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Users className="w-5 h-5 text-gray-500" />
                      <span>Looking for {companion.seats} travel companion(s)</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-gray-500" />
                      <span>{companion.prefs.join(', ')}</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="space-y-3">
                      <div className="text-sm text-gray-600">
                        <div className="flex justify-between mb-1">
                          <span>Budget Range:</span>
                          <span className="font-medium">{companion.budget.range}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Response Rate:</span>
                          <span className="font-medium text-green-600">{companion.responseRate}%</span>
                        </div>
                      </div>

                      <button
                        onClick={handleConnect}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span>Connect & Message</span>
                      </button>

                      <AnimatePresence>
                        {showContactInfo && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-green-50 border border-green-200 rounded-lg p-4"
                          >
                            <div className="flex items-center space-x-2 text-green-800 mb-2">
                              <CheckCircle className="w-5 h-5" />
                              <span className="font-semibold">Connection Request Sent!</span>
                            </div>
                            <p className="text-sm text-green-700">
                              {companion.name} typically responds {companion.responseTime}. 
                              You'll be notified when they reply.
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="text-center">
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          View Full Profile
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                      <Shield className="w-4 h-4" />
                      <span>Verified traveler profile</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      All profiles are verified. Report any suspicious activity.
                    </p>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="mt-6 bg-white rounded-lg shadow p-4 border">
                <h3 className="font-semibold mb-3">Travel Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {companion.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanionDetailPage;
