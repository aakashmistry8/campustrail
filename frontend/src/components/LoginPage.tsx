import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff, User, Mail, Lock, Shield, Check, AlertCircle } from 'lucide-react';

interface LoginPageProps {
  apiBase: string;
  onAuth: (data: { email: string; name?: string }, token: string) => void;
  onBack: () => void;
}

type AuthMode = 'login' | 'signup' | 'forgot';
type SignupStage = 'collect' | 'otp';

const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export const LoginPage: React.FC<LoginPageProps> = ({ apiBase, onAuth, onBack }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [stage, setStage] = useState<SignupStage>('collect');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown(c => c - 1), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  // Reset form when mode changes
  useEffect(() => {
    setStage('collect');
    setOtp('');
    setPassword('');
    setConfirmPassword('');
    setResetToken('');
    setError(null);
    setSuccess(null);
  }, [mode]);

  const validateForm = (): boolean => {
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (mode === 'signup' && !name.trim()) {
      setError('Name is required');
      return false;
    }
    if ((mode === 'login' || mode === 'signup') && !password) {
      setError('Password is required');
      return false;
    }
    if (mode === 'signup' && password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data?.error || 'Login failed');
      }
      
      setSuccess('Login successful! Redirecting...');
      setTimeout(() => {
        onAuth({ email: data.user.email, name: data.user.name }, data.token);
      }, 1000);
      
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${apiBase}/auth/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (data?.retryAfterSeconds) {
          setCooldown(data.retryAfterSeconds);
        }
        throw new Error(data?.error || 'Failed to send OTP');
      }
      
      setStage('otp');
      setSuccess('OTP sent to your email. Please check your inbox.');
      setCooldown(30); // Default cooldown
      
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!otp.trim()) {
      setError('Please enter the OTP');
      return;
    }
    
    try {
      setLoading(true);
      const body: any = {
        email: email.trim(),
        otp: otp.trim(),
        name: name.trim()
      };
      if (password) body.password = password;
      
      const response = await fetch(`${apiBase}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        const remainingInfo = data?.remainingAttempts != null 
          ? ` Remaining attempts: ${data.remainingAttempts}` 
          : '';
        throw new Error((data?.error || 'Verification failed') + remainingInfo);
      }
      
      setSuccess('Account created successfully! Redirecting...');
      setTimeout(() => {
        onAuth({ email: data.user.email, name: data.user.name }, data.token);
      }, 1000);
      
    } catch (err: any) {
      setError(err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!email.trim() || !emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch(`${apiBase}/auth/password/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send reset instructions');
      }
      
      setSuccess('If an account exists with this email, reset instructions have been sent.');
      
    } catch (err: any) {
      setError(err.message || 'Failed to send reset instructions');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'login': return 'Welcome Back';
      case 'signup': return stage === 'collect' ? 'Create Account' : 'Verify Email';
      case 'forgot': return 'Reset Password';
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case 'login': return 'Sign in to your CampusTrail account';
      case 'signup': return stage === 'collect' ? 'Join the CampusTrail community' : 'Enter the OTP sent to your email';
      case 'forgot': return 'Enter your email to receive reset instructions';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={onBack}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </button>
          
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{getTitle()}</h1>
          <p className="text-gray-600">{getSubtitle()}</p>
        </div>

        {/* Main Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          {/* Alert Messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center"
              >
                <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                <span className="text-red-700 text-sm">{error}</span>
              </motion.div>
            )}
            
            {success && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center"
              >
                <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-green-700 text-sm">{success}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Form */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}

          {/* Signup Form */}
          {mode === 'signup' && stage === 'collect' && (
            <form onSubmit={handleSignupRequest} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter your full name"
                    required
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Create a password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || cooldown > 0}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending OTP...' : cooldown > 0 ? `Wait ${cooldown}s` : 'Send Verification Code'}
              </button>
            </form>
          )}

          {/* OTP Verification */}
          {mode === 'signup' && stage === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-center tracking-wider"
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify & Create Account'}
              </button>

              <button
                type="button"
                onClick={() => setStage('collect')}
                className="w-full text-gray-600 hover:text-gray-800 text-sm"
              >
                ← Back to registration
              </button>
            </form>
          )}

          {/* Forgot Password Form */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Reset Instructions'}
              </button>

              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full text-gray-600 hover:text-gray-800 text-sm"
              >
                ← Back to login
              </button>
            </form>
          )}

          {/* Mode Switch */}
          {mode !== 'forgot' && (
            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
                <button
                  type="button"
                  onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                  className="ml-1 text-blue-600 hover:text-blue-500 font-medium"
                >
                  {mode === 'login' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          )}
        </motion.div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            By continuing, you agree to CampusTrail's Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
