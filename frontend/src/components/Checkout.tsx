import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CreditCard, MapPin, User, Mail, Phone, CheckCircle, Loader, AlertCircle } from 'lucide-react';
import { Product } from '../types/Product';
import { orderService, CartItem } from '../services/orderService';

interface CheckoutProps {
  cartItems: { product: Product; qty: number }[];
  cartTotal: number;
  user: { email: string; name?: string };
  onBack: () => void;
  onOrderComplete: (orderId: string) => void;
  onClearCart: () => void;
}

type CheckoutStep = 'review' | 'shipping' | 'payment' | 'processing' | 'success' | 'error';

const Checkout: React.FC<CheckoutProps> = ({ 
  cartItems, 
  cartTotal, 
  user, 
  onBack, 
  onOrderComplete,
  onClearCart 
}) => {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('review');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  // Form data
  const [shippingData, setShippingData] = useState({
    fullName: user.name || '',
    email: user.email,
    phone: '',
    address: '',
    city: '',
    pincode: '',
    state: ''
  });

  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  });

  const calculateDeposits = () => {
    return cartItems.reduce((sum, item) => sum + (item.product.deposit || 0) * item.qty, 0);
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep('payment');
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setCurrentStep('processing');

    try {
      // Convert cart items to the format expected by orderService
      const orderItems: CartItem[] = cartItems.map(item => ({
        product: item.product,
        qty: item.qty
      }));

      const result = await orderService.placeOrder({
        items: orderItems,
        userEmail: user.email
      });

      if (result.success && result.orderId) {
        setOrderId(result.orderId);
        setCurrentStep('success');
        onOrderComplete(result.orderId);
        onClearCart(); // Clear the cart after successful order
      } else {
        setError(result.error || 'Failed to place order');
        setCurrentStep('error');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setCurrentStep('error');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  const renderStepIndicator = () => {
    const steps = ['review', 'shipping', 'payment', 'processing'];
    const currentIndex = steps.indexOf(currentStep);

    return (
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                index <= currentIndex
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {index + 1}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-16 h-1 mx-2 ${
                  index < currentIndex ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mr-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
        <h1 className="text-2xl font-semibold text-gray-900">Checkout</h1>
      </div>

      {/* Step Indicator */}
      {!['success', 'error'].includes(currentStep) && renderStepIndicator()}

      <AnimatePresence mode="wait">
        {/* Review Step */}
        {currentStep === 'review' && (
          <motion.div
            key="review"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-lg shadow border p-6">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              <div className="space-y-4">
                {cartItems.map(item => (
                  <div key={item.product.id} className="flex items-center space-x-4 py-3 border-b border-gray-100 last:border-b-0">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{item.product.name}</h3>
                      <p className="text-sm text-gray-600">{item.product.description}</p>
                      <p className="text-sm text-gray-500">Qty: {item.qty}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(item.product.price * item.qty)}</p>
                      {item.product.deposit && (
                        <p className="text-xs text-gray-500">
                          Deposit: {formatCurrency(item.product.deposit * item.qty)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span>Subtotal</span>
                  <span>{formatCurrency(cartTotal)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span>Total Deposits</span>
                  <span>{formatCurrency(calculateDeposits())}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(cartTotal)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setCurrentStep('shipping')}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Continue to Shipping
            </button>
          </motion.div>
        )}

        {/* Shipping Step */}
        {currentStep === 'shipping' && (
          <motion.div
            key="shipping"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <form onSubmit={handleShippingSubmit} className="bg-white rounded-lg shadow border p-6 space-y-4">
              <h2 className="text-lg font-semibold mb-4">Shipping Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={shippingData.fullName}
                      onChange={(e) => setShippingData({ ...shippingData, fullName: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      value={shippingData.email}
                      onChange={(e) => setShippingData({ ...shippingData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                      disabled
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      value={shippingData.phone}
                      onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={shippingData.city}
                      onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  value={shippingData.address}
                  onChange={(e) => setShippingData({ ...shippingData, address: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={shippingData.state}
                    onChange={(e) => setShippingData({ ...shippingData, state: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    value={shippingData.pincode}
                    onChange={(e) => setShippingData({ ...shippingData, pincode: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep('review')}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Continue to Payment
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Payment Step */}
        {currentStep === 'payment' && (
          <motion.div
            key="payment"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <form onSubmit={handlePaymentSubmit} className="bg-white rounded-lg shadow border p-6 space-y-4">
              <h2 className="text-lg font-semibold mb-4">Payment Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Number
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={paymentData.cardNumber}
                    onChange={(e) => setPaymentData({ ...paymentData, cardNumber: e.target.value })}
                    placeholder="1234 5678 9012 3456"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={paymentData.cardName}
                  onChange={(e) => setPaymentData({ ...paymentData, cardName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={paymentData.expiryDate}
                    onChange={(e) => setPaymentData({ ...paymentData, expiryDate: e.target.value })}
                    placeholder="MM/YY"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={paymentData.cvv}
                    onChange={(e) => setPaymentData({ ...paymentData, cvv: e.target.value })}
                    placeholder="123"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mt-6">
                <h3 className="font-medium mb-2">Order Summary</h3>
                <div className="flex justify-between items-center mb-1">
                  <span>Subtotal</span>
                  <span>{formatCurrency(cartTotal)}</span>
                </div>
                <div className="flex justify-between items-center mb-1">
                  <span>Deposits Required</span>
                  <span>{formatCurrency(calculateDeposits())}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-semibold border-t border-gray-200 pt-2">
                  <span>Total to Pay</span>
                  <span>{formatCurrency(cartTotal)}</span>
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep('shipping')}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Processing...' : `Pay ${formatCurrency(cartTotal)}`}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Processing Step */}
        {currentStep === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-12"
          >
            <Loader className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-semibold mb-2">Processing Your Order</h2>
            <p className="text-gray-600">Please wait while we process your payment...</p>
          </motion.div>
        )}

        {/* Success Step */}
        {currentStep === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center py-12"
          >
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Order Placed Successfully!</h2>
            <p className="text-gray-600 mb-4">
              Your order <span className="font-mono text-sm">{orderId}</span> has been confirmed.
            </p>
            <p className="text-gray-600 mb-6">
              You will receive an email confirmation shortly with tracking information.
            </p>
            <button
              onClick={onBack}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Continue Shopping
            </button>
          </motion.div>
        )}

        {/* Error Step */}
        {currentStep === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center py-12"
          >
            <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Order Failed</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-x-4">
              <button
                onClick={() => setCurrentStep('payment')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={onBack}
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Back to Cart
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Checkout;
