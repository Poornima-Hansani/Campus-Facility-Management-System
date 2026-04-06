import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, LogIn, Eye, EyeOff, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';

export default function ManagementLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ username?: string; password?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const fillDemoData = () => {
    setUsername('admin');
    setPassword('admin');
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    
    if (!username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    setTimeout(() => {
      if (!validateForm()) {
        setIsLoading(false);
        return;
      }

      if (username === 'admin' && password === 'admin') {
        localStorage.setItem('managementLoggedIn', 'true');
        localStorage.setItem('managementUsername', username);
        navigate('/management/dashboard');
      } else {
        setErrors({ general: 'Invalid username or password. Please try again.' });
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-green-700 via-teal-800 to-blue-900">
      {/* Subtle overlay */}
      <div className="absolute inset-0 bg-black/20"></div>
      
      {/* Glow Effects */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-green-400 opacity-20 blur-3xl rounded-full animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400 opacity-20 blur-3xl rounded-full animate-pulse delay-2000"></div>
      
      {/* Centered flex container */}
      <div className="relative z-10 min-h-screen flex items-center justify-center">

      {/* Split Layout Container */}
      <div className="flex w-full max-w-4xl bg-white rounded-2xl shadow-lg overflow-hidden animate-fadeIn">
        
        {/* Left Side - Management Image */}
        <div className="hidden lg:block w-1/2 relative">
          <img
            src="/management.jpeg"
            alt="Management"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          <div className="absolute bottom-8 left-8 right-8 text-white">
            <h3 className="text-2xl font-bold mb-2">Management Portal</h3>
            <p className="text-white/80 text-sm">Manage reports and track facility maintenance.</p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 p-8">
          {/* Back Button */}
          <a 
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-600 mb-4 transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            Back to Home
          </a>

          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-4 rounded-full">
              <Shield className="text-green-600" size={32} />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center text-gray-800">
            Management Login
          </h2>
          <p className="text-gray-500 text-center mb-6">
            Authorized personnel only
          </p>

          {/* Demo Box */}
          <div className="bg-green-50 border border-green-100 rounded-lg p-3 mb-4 text-sm">
            <p className="font-medium text-green-600 mb-1">Demo Credentials</p>
            <div className="flex justify-between items-center">
              <div className="text-gray-600">
                <p>Username: admin</p>
                <p>Password: admin</p>
              </div>
              <button
                type="button"
                onClick={fillDemoData}
                className="text-xs bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1.5 rounded-lg transition-colors"
              >
                Fill
              </button>
            </div>
          </div>

          {/* General Error */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4 text-sm flex items-center gap-2">
              <AlertCircle size={16} />
              {errors.general}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username */}
            <div>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errors.username) setErrors(prev => ({ ...prev, username: undefined }));
                }}
                className={`w-full px-4 py-3 border rounded-lg outline-none transition focus:ring-2 focus:ring-green-500 ${
                  errors.username ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              />
              {errors.username && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.username}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                }}
                className={`w-full px-4 py-3 pr-12 border rounded-lg outline-none transition focus:ring-2 focus:ring-green-500 ${
                  errors.password ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.password}
                </p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <button type="button" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition transform hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Back to Home */}
          <p className="text-center text-gray-400 text-sm mt-4">
            <a href="/" className="text-green-600 hover:text-green-700 font-medium transition-colors">
              Back to Home
            </a>
          </p>
        </div>
      </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
