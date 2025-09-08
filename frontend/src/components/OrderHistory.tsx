import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Calendar, Package, MapPin, Users, Star, Eye, Download, RefreshCw, Filter } from 'lucide-react';
import { orderService, Order as OrderServiceOrder } from '../services/orderService';

interface Order {
  id: string;
  status: string;
  total: number;
  depositTotal: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

interface OrderItem {
  id: string;
  title: string;
  unitPrice: number;
  depositAmount: number;
  quantity: number;
  lineTotal: number;
  gearItemId?: string;
}

interface Booking {
  id: string;
  type: 'itinerary' | 'companion';
  title: string;
  description: string;
  date: string;
  amount: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  seats?: number;
}

interface OrderHistoryProps {
  apiBase: string;
  userEmail: string;
  token: string;
  onBack: () => void;
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ apiBase, userEmail, token, onBack }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'orders' | 'bookings'>('orders');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const headers = () => ({
    'Content-Type': 'application/json',
    ...(token ? { authorization: `Bearer ${token}` } : {})
  });

  const fetchOrders = async () => {
    try {
      // First try to fetch from the orderService (localStorage)
      const localOrders = await orderService.getOrderHistory(userEmail);
      
      if (localOrders.length > 0) {
        setOrders(localOrders);
        return;
      }

      // Fallback to API call (in case backend has orders)
      const response = await fetch(`${apiBase}/my/orders`, {
        headers: headers()
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrders(Array.isArray(data) ? data : []);
      } else {
        // If API fails, just use local orders (even if empty)
        setOrders(localOrders);
      }
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      // Try to get local orders as fallback
      try {
        const localOrders = await orderService.getOrderHistory(userEmail);
        setOrders(localOrders);
      } catch (localErr) {
        console.error('Error fetching local orders:', localErr);
        setError('Failed to load orders');
        setOrders([]);
      }
    }
  };

  const fetchBookings = async () => {
    // For now, we'll create mock booking data since the backend doesn't have booking history yet
    // In a real implementation, this would fetch from `/my/bookings` or similar
    const mockBookings: Booking[] = [
      {
        id: 'b1',
        type: 'itinerary',
        title: 'Kedarkantha Weekend Trek',
        description: 'Oct 18–20 • Guide: Vikram',
        date: '2024-10-18',
        amount: 5999,
        status: 'confirmed',
        seats: 2
      },
      {
        id: 'b2',
        type: 'itinerary',
        title: 'Pondicherry Coastal Ride',
        description: 'Nov 1–3 • Guide: Sara',
        date: '2024-11-01',
        amount: 4499,
        status: 'pending',
        seats: 1
      },
      {
        id: 'b3',
        type: 'companion',
        title: 'Spiti Circuit with Maya',
        description: 'Nov 6–14 • Photography focused',
        date: '2024-11-06',
        amount: 0, // Companion connections are typically free
        status: 'confirmed'
      }
    ];
    
    setBookings(mockBookings);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        await Promise.all([fetchOrders(), fetchBookings()]);
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadData();
    }
  }, [token, apiBase]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'created':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'paid':
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'paid':
        return '✓';
      case 'pending':
      case 'created':
        return '⏳';
      case 'cancelled':
        return '✗';
      default:
        return '◯';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  const filteredOrders = orders.filter(order => 
    filterStatus === 'all' || order.status.toLowerCase() === filterStatus.toLowerCase()
  );

  const filteredBookings = bookings.filter(booking => 
    filterStatus === 'all' || booking.status.toLowerCase() === filterStatus.toLowerCase()
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading your order history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-50">
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
              <h1 className="text-xl font-semibold text-gray-900">Order History</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => {
                  setLoading(true);
                  Promise.all([fetchOrders(), fetchBookings()]).finally(() => setLoading(false));
                }}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'orders'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Gear Orders ({orders.length})
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'bookings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Trip Bookings ({bookings.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-6 flex items-center space-x-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="created">Created</option>
            <option value="paid">Paid</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Gear Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                    <p className="text-gray-500">
                      {filterStatus === 'all' 
                        ? "You haven't made any gear orders yet."
                        : `No orders with status "${filterStatus}".`
                      }
                    </p>
                  </div>
                ) : (
                  filteredOrders.map((order) => (
                    <motion.div
                      key={order.id}
                      layout
                      className="bg-white rounded-lg shadow border hover:shadow-md transition-shadow"
                    >
                      {/* Order Header */}
                      <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              Order #{order.id.slice(-8).toUpperCase()}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Placed on {formatDate(order.createdAt)}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)} {order.status.toUpperCase()}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Total Amount:</span>
                            <p className="font-semibold text-lg text-blue-600">{formatCurrency(order.total)}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Deposit:</span>
                            <p className="font-medium">{formatCurrency(order.depositTotal)}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Items:</span>
                            <p className="font-medium">{order.items.length} item(s)</p>
                          </div>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="p-6">
                        <div className="space-y-4">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{item.title}</h4>
                                <p className="text-sm text-gray-500">
                                  {formatCurrency(item.unitPrice)} × {item.quantity}
                                  {item.depositAmount > 0 && ` • Deposit: ${formatCurrency(item.depositAmount)}`}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">{formatCurrency(item.lineTotal)}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Order Actions */}
                        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                          <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </button>
                          <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            <Download className="w-4 h-4 mr-2" />
                            Download Invoice
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}

            {/* Trip Bookings Tab */}
            {activeTab === 'bookings' && (
              <div className="space-y-6">
                {filteredBookings.length === 0 ? (
                  <div className="text-center py-12">
                    <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
                    <p className="text-gray-500">
                      {filterStatus === 'all' 
                        ? "You haven't made any trip bookings yet."
                        : `No bookings with status "${filterStatus}".`
                      }
                    </p>
                  </div>
                ) : (
                  filteredBookings.map((booking) => (
                    <motion.div
                      key={booking.id}
                      layout
                      className="bg-white rounded-lg shadow border hover:shadow-md transition-shadow"
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              {booking.type === 'itinerary' ? (
                                <MapPin className="w-5 h-5 text-blue-600" />
                              ) : (
                                <Users className="w-5 h-5 text-purple-600" />
                              )}
                              <h3 className="text-lg font-semibold text-gray-900">{booking.title}</h3>
                            </div>
                            <p className="text-gray-600 mb-2">{booking.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {formatDate(booking.date)}
                              </span>
                              {booking.seats && (
                                <span className="flex items-center">
                                  <Users className="w-4 h-4 mr-1" />
                                  {booking.seats} seat(s)
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)} mb-2 inline-block`}>
                              {getStatusIcon(booking.status)} {booking.status.toUpperCase()}
                            </span>
                            {booking.amount > 0 && (
                              <p className="text-lg font-semibold text-blue-600">{formatCurrency(booking.amount)}</p>
                            )}
                          </div>
                        </div>

                        {/* Booking Actions */}
                        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                          <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </button>
                          {booking.status === 'confirmed' && (
                            <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                              <Star className="w-4 h-4 mr-2" />
                              Leave Review
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OrderHistory;
