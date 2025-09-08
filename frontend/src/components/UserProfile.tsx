import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, User, Mail, Phone, MapPin, Calendar, Package, Edit3, Camera, Settings, Star, Award, Shield, History } from 'lucide-react';
import OrderHistory from './OrderHistory';

interface UserProfileProps {
  apiBase: string;
  user: { email: string; name?: string };
  token: string;
  onBack: () => void;
  onLogout: () => void;
}

interface UserStats {
  totalOrders: number;
  totalSpent: number;
  totalBookings: number;
  joinDate: string;
  verificationLevel: 'basic' | 'verified' | 'premium';
}

const UserProfile: React.FC<UserProfileProps> = ({ apiBase, user, token, onBack, onLogout }) => {
  type TabType = 'profile' | 'orders' | 'settings';
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Profile data
  const [profileData, setProfileData] = useState({
    name: user.name || '',
    email: user.email,
    phone: '',
    location: '',
    bio: '',
    avatar: ''
  });

  // Mock user stats - in real app this would come from backend
  const [userStats] = useState<UserStats>({
    totalOrders: 5,
    totalSpent: 23450,
    totalBookings: 3,
    joinDate: '2024-01-15',
    verificationLevel: 'verified'
  });

  const getVerificationBadge = (level: string) => {
    switch (level) {
      case 'basic':
        return { color: 'bg-gray-100 text-gray-800', icon: User, text: 'Basic' };
      case 'verified':
        return { color: 'bg-green-100 text-green-800', icon: Shield, text: 'Verified' };
      case 'premium':
        return { color: 'bg-purple-100 text-purple-800', icon: Award, text: 'Premium' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: User, text: 'Basic' };
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call - in real app this would update user profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (activeTab === ('orders' as TabType)) {
    return (
      <OrderHistory
        apiBase={apiBase}
        userEmail={user.email}
        token={token}
        onBack={() => setActiveTab('profile' as TabType)}
      />
    );
  }

  const verificationBadge = getVerificationBadge(userStats.verificationLevel);
  const VerificationIcon = verificationBadge.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mr-4"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </button>
              <h1 className="text-xl font-semibold text-gray-900">My Profile</h1>
            </div>
            
            <button
              onClick={onLogout}
              className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow border p-6">
              {/* Profile Avatar */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    {profileData.avatar ? (
                      <img src={profileData.avatar} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
                    ) : (
                      <User className="w-12 h-12 text-white" />
                    )}
                  </div>
                  <button className="absolute bottom-4 right-0 bg-white border border-gray-300 rounded-full p-2 shadow-sm hover:bg-gray-50">
                    <Camera className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
                
                <h2 className="text-xl font-semibold text-gray-900">{profileData.name || 'User'}</h2>
                <p className="text-gray-600 text-sm">{profileData.email}</p>
                
                {/* Verification Badge */}
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${verificationBadge.color}`}>
                  <VerificationIcon className="w-3 h-3 mr-1" />
                  {verificationBadge.text}
                </span>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile' as TabType)}
                  className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <User className="w-5 h-5 mr-3" />
                  Profile
                </button>
                
                <button
                  onClick={() => setActiveTab('orders' as TabType)}
                  className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
                    activeTab === ('orders' as TabType)
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <History className="w-5 h-5 mr-3" />
                  Order History
                </button>
                
                <button
                  onClick={() => setActiveTab('settings' as TabType)}
                  className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
                    activeTab === 'settings'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Settings className="w-5 h-5 mr-3" />
                  Settings
                </button>
              </nav>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow border p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Orders</span>
                  <span className="font-semibold">{userStats.totalOrders}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Spent</span>
                  <span className="font-semibold text-blue-600">{formatCurrency(userStats.totalSpent)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Bookings</span>
                  <span className="font-semibold">{userStats.totalBookings}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-semibold">{formatDate(userStats.joinDate)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div className="bg-white rounded-lg shadow border">
                    {/* Profile Header */}
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                        <button
                          onClick={() => {
                            if (isEditing) {
                              handleSaveProfile();
                            } else {
                              setIsEditing(true);
                            }
                          }}
                          disabled={loading}
                          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm transition-colors ${
                            isEditing
                              ? 'text-white bg-blue-600 hover:bg-blue-700'
                              : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                          }`}
                        >
                          <Edit3 className="w-4 h-4 mr-2" />
                          {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Edit Profile'}
                        </button>
                      </div>
                    </div>

                    {/* Profile Form */}
                    <div className="p-6">
                      {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                          <p className="text-red-700">{error}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                              type="text"
                              value={profileData.name}
                              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                              disabled={!isEditing}
                              className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg transition-colors ${
                                isEditing
                                  ? 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                  : 'bg-gray-50 cursor-not-allowed'
                              }`}
                              placeholder="Enter your full name"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                              type="email"
                              value={profileData.email}
                              disabled
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                              type="tel"
                              value={profileData.phone}
                              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                              disabled={!isEditing}
                              className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg transition-colors ${
                                isEditing
                                  ? 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                  : 'bg-gray-50 cursor-not-allowed'
                              }`}
                              placeholder="Enter your phone number"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Location
                          </label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                              type="text"
                              value={profileData.location}
                              onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                              disabled={!isEditing}
                              className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg transition-colors ${
                                isEditing
                                  ? 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                  : 'bg-gray-50 cursor-not-allowed'
                              }`}
                              placeholder="Enter your city"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bio
                        </label>
                        <textarea
                          value={profileData.bio}
                          onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                          disabled={!isEditing}
                          rows={4}
                          className={`w-full px-4 py-3 border border-gray-300 rounded-lg transition-colors ${
                            isEditing
                              ? 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                              : 'bg-gray-50 cursor-not-allowed'
                          }`}
                          placeholder="Tell us about yourself..."
                        />
                      </div>

                      {isEditing && (
                        <div className="mt-6 flex justify-end space-x-3">
                          <button
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveProfile}
                            disabled={loading}
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                          >
                            {loading ? 'Saving...' : 'Save Changes'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                  <div className="space-y-6">
                    {/* Notification Settings */}
                    <div className="bg-white rounded-lg shadow border p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                            <p className="text-sm text-gray-500">Receive order updates and trip reminders</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">SMS Notifications</h4>
                            <p className="text-sm text-gray-500">Get text messages for urgent updates</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">Marketing Emails</h4>
                            <p className="text-sm text-gray-500">Receive promotional offers and travel tips</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Security Settings */}
                    <div className="bg-white rounded-lg shadow border p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Security</h3>
                      <div className="space-y-4">
                        <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">Change Password</h4>
                              <p className="text-sm text-gray-500">Update your password for better security</p>
                            </div>
                            <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
                          </div>
                        </button>

                        <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
                              <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                            </div>
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Not Enabled</span>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-white rounded-lg shadow border border-red-200 p-6">
                      <h3 className="text-lg font-semibold text-red-900 mb-4">Danger Zone</h3>
                      <div className="space-y-4">
                        <button className="w-full text-left p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                          <div>
                            <h4 className="text-sm font-medium text-red-900">Delete Account</h4>
                            <p className="text-sm text-red-600">Permanently delete your account and all data</p>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
