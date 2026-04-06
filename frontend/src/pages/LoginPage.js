import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { authStyles } from '../styles/AuthStyles';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Handle smooth transition to register page
  const handleCreateAccount = (e) => {
    e.preventDefault();
    setIsTransitioning(true);
    setTimeout(() => {
      navigate('/register');
    }, 300);
  };

  // 🔥 Auto redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // ✅ Safe JSON parse with role-based redirect
      let user = {};
      try {
        user = JSON.parse(localStorage.getItem('user')) || {};
      } catch {
        user = {};
      }

      const roleRoutes = {
        admin: '/admin-dashboard',
        lecturer: '/lecturer-dashboard',
        student: '/student-dashboard'
      };
      
      // ✅ Only redirect if role exists and route is valid
      if (user?.role && roleRoutes[user.role]) {
        navigate(roleRoutes[user.role]);
      }
    }
  }, [navigate]);

  // 🔥 Optional UX improvement - prevent flicker if already logged in
  if (localStorage.getItem('token')) {
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // ✅ Use api service with interceptors
      const response = await api.post('/api/auth/login', formData);
      
      // Save token and user data
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      
      // ✅ Cleaner role-based redirect
      const userRole = response.data.data.user.role;
      const roleRoutes = {
        admin: '/admin-dashboard',
        lecturer: '/lecturer-dashboard',
        student: '/student-dashboard'
      };
      
      navigate(roleRoutes[userRole] || '/login');
      
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      setErrors({ submit: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={authStyles.container}>
      {/* Right side background elements */}
      <div className={authStyles.bgDecoration}>
        <div className={authStyles.bgCircle1}></div>
        <div className={authStyles.bgCircle2}></div>
        <div className={authStyles.bgCircle3}></div>
        <div className={authStyles.bgCircle4}></div>
        <div className={authStyles.bgCircle5}></div>
        <div className={authStyles.bgGradient}></div>
        <div className={authStyles.bgParticle1}></div>
        <div className={authStyles.bgParticle2}></div>
        <div className={authStyles.bgParticle3}></div>
        <div className={authStyles.bgParticle4}></div>
        {/* Campus building image */}
        <img 
          src="https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
          alt="Campus Building"
          className={authStyles.bgImage}
        />
      </div>
      
      <div className={`${authStyles.card} ${isTransitioning ? 'animate-slide-out-left' : 'animate-fade-in'}`}>
        {/* Card inner gradient */}
        <div className={authStyles.cardInner}></div>
        <div className={authStyles.cardGlow}></div>
        
        {/* Header */}
        <div className={authStyles.header}>
          <h1 className={authStyles.title}>Login</h1>
          <p className={authStyles.subtitle}>Enter your credentials to access your account</p>
        </div>
        
        {/* Error Message */}
        {errors.submit && (
          <div className={authStyles.errorContainer}>
            {errors.submit}
          </div>
        )}
        
        {/* Login Form */}
        <form onSubmit={handleSubmit} className={authStyles.form}>
          {/* Email Field */}
          <div className={authStyles.formGroup}>
            <label htmlFor="email" className={authStyles.label}>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`${authStyles.input} ${errors.email ? authStyles.inputError : ''}`}
              placeholder="Enter your email address"
            />
            {errors.email && (
              <p className={authStyles.errorText}>{errors.email}</p>
            )}
          </div>
          
          {/* Password Field */}
          <div className={authStyles.formGroup}>
            <label htmlFor="password" className={authStyles.label}>
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`${authStyles.input} ${errors.password ? authStyles.inputError : ''}`}
              placeholder="Enter your password"
            />
            {errors.password && (
              <p className={authStyles.errorText}>{errors.password}</p>
            )}
          </div>
          
          {/* Login Button */}
          <button
            type="submit"
            className={authStyles.button}
            disabled={loading}
          >
            <div className={authStyles.buttonGlow}></div>
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className={authStyles.spinner} fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
        
        {/* Register Link */}
        <div className={authStyles.linkContainer}>
          <p className="text-gray-600 text-sm">
            Don't have an account?{' '}
            <button 
              onClick={handleCreateAccount}
              className={`${authStyles.link} cursor-pointer`}
            >
              Create account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
