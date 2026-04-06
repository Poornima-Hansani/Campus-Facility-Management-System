import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { authStyles } from '../styles/AuthStyles';

const RegisterPage = () => {
  const location = useLocation();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    wewd: '',
    faculty: '',
    year: '',
    semester: '',
    group: '',
    contactNumber: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) newErrors.name = 'Name required';
    if (!formData.email) newErrors.email = 'Email required';
    if (!formData.password) newErrors.password = 'Password required';
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }
    
    // Contact number validation (exactly 10 digits)
    if (formData.contactNumber) {
      const contactRegex = /^\d{10}$/;
      if (!contactRegex.test(formData.contactNumber)) {
        newErrors.contactNumber = 'Contact number must be exactly 10 digits';
      }
    }

    if (formData.role === 'student') {
      if (!formData.wewd) newErrors.wewd = 'WE/WD required';
      if (!formData.faculty) newErrors.faculty = 'Faculty required';
      if (!formData.year) newErrors.year = 'Year required';
      if (!formData.semester) newErrors.semester = 'Semester required';
      if (!formData.group) newErrors.group = 'Group required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const submitData = { ...formData };

    if (submitData.role !== 'student') {
      delete submitData.wewd;
      delete submitData.faculty;
      delete submitData.year;
      delete submitData.semester;
      delete submitData.group;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setErrors({ submit: 'Registration successful! Please login.' });
        // Clear form after successful registration
        setFormData({
          name: '',
          email: '',
          password: '',
          role: 'student',
          wewd: '',
          faculty: '',
          year: '',
          semester: '',
          group: '',
          contactNumber: ''
        });
      } else {
        setErrors({ submit: data.message || 'Registration failed. Please try again.' });
      }
    } catch (err) {
      setErrors({ submit: 'Error connecting to server. Please check your connection and try again.' });
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
      
      <div className={`${authStyles.registerCard} ${formData.role === 'student' ? 'max-w-6xl' : 'max-w-2xl'} transition-all duration-500 animate-slide-in-right`}>
        {/* Card inner gradient */}
        <div className={authStyles.cardInner}></div>
        <div className={authStyles.cardGlow}></div>
        
        {/* Header */}
        <div className={authStyles.header}>
          <h1 className={authStyles.title}>Register</h1>
          <p className={authStyles.subtitle}>Join our facility management system</p>
        </div>

        {/* Error Message */}
        {errors.submit && (
          <div className={authStyles.errorContainer}>
            {errors.submit}
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className={authStyles.form}>
          {/* Dynamic Layout Based on Role */}
          <div className={`${formData.role === 'student' ? 'grid grid-cols-1 lg:grid-cols-2 gap-8' : 'space-y-8'} transition-all duration-500`}>
            
            {/* Left Side - Basic Info (Always) */}
            <div className={`${formData.role === 'student' ? 'space-y-6' : ''}`}>
              {/* Name and Email */}
              <div className={authStyles.gridContainer}>
                <div className={authStyles.formGroup}>
                  <label htmlFor="name" className={authStyles.label}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`${authStyles.input} ${errors.name ? authStyles.inputError : ''}`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && (
                    <p className={authStyles.errorText}>{errors.name}</p>
                  )}
                </div>

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
              </div>

              {/* Password and Role */}
              <div className={authStyles.gridContainer}>
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
                    placeholder="Create a password"
                  />
                  {errors.password && (
                    <p className={authStyles.errorText}>{errors.password}</p>
                  )}
                </div>

                <div className={authStyles.formGroup}>
                  <label htmlFor="role" className={authStyles.label}>
                    Role
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className={authStyles.select}
                  >
                    <option value="student">Student</option>
                    <option value="lecturer">Lecturer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              {/* Contact Number for Non-Students */}
              {formData.role !== 'student' && (
                <div className={authStyles.formGroup}>
                  <label htmlFor="contactNumber" className={authStyles.label}>
                    Contact Number
                  </label>
                  <input
                    type="text"
                    id="contactNumber"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    className={`${authStyles.input} ${errors.contactNumber ? authStyles.inputError : ''}`}
                    placeholder="Enter 10-digit contact number"
                    maxLength="10"
                  />
                  {errors.contactNumber && (
                    <p className={authStyles.errorText}>{errors.contactNumber}</p>
                  )}
                </div>
              )}
            </div>

            {/* Right Side - Student Information (Only when student is selected) */}
            {formData.role === 'student' && (
              <div className="animate-slide-in-right">
                <div className={authStyles.studentSection}>
                  <h3 className={authStyles.sectionTitle}>Student Information</h3>
                  
                  <div className="space-y-6">
                    <div className={authStyles.gridContainer}>
                      <div className={authStyles.formGroup}>
                        <label htmlFor="wewd" className={authStyles.label}>
                          Weekend/Weekday
                        </label>
                        <select
                          id="wewd"
                          name="wewd"
                          value={formData.wewd}
                          onChange={handleChange}
                          className={`${authStyles.select} ${errors.wewd ? authStyles.inputError : ''}`}
                        >
                          <option value="">Select WE/WD</option>
                          <option value="WE">Weekend</option>
                          <option value="WD">Weekday</option>
                        </select>
                        {errors.wewd && (
                          <p className={authStyles.errorText}>{errors.wewd}</p>
                        )}
                      </div>

                      <div className={authStyles.formGroup}>
                        <label htmlFor="faculty" className={authStyles.label}>
                          Faculty
                        </label>
                        <input
                          type="text"
                          id="faculty"
                          name="faculty"
                          value={formData.faculty}
                          onChange={handleChange}
                          className={`${authStyles.input} ${errors.faculty ? authStyles.inputError : ''}`}
                          placeholder="Enter faculty"
                        />
                        {errors.faculty && (
                          <p className={authStyles.errorText}>{errors.faculty}</p>
                        )}
                      </div>
                    </div>

                    <div className={authStyles.gridContainer}>
                      <div className={authStyles.formGroup}>
                        <label htmlFor="year" className={authStyles.label}>
                          Year
                        </label>
                        <input
                          type="text"
                          id="year"
                          name="year"
                          value={formData.year}
                          onChange={handleChange}
                          className={`${authStyles.input} ${errors.year ? authStyles.inputError : ''}`}
                          placeholder="Enter year"
                        />
                        {errors.year && (
                          <p className={authStyles.errorText}>{errors.year}</p>
                        )}
                      </div>

                      <div className={authStyles.formGroup}>
                        <label htmlFor="semester" className={authStyles.label}>
                          Semester
                        </label>
                        <input
                          type="text"
                          id="semester"
                          name="semester"
                          value={formData.semester}
                          onChange={handleChange}
                          className={`${authStyles.input} ${errors.semester ? authStyles.inputError : ''}`}
                          placeholder="Enter semester"
                        />
                        {errors.semester && (
                          <p className={authStyles.errorText}>{errors.semester}</p>
                        )}
                      </div>
                    </div>

                    <div className={authStyles.gridContainer}>
                      <div className={authStyles.formGroup}>
                        <label htmlFor="group" className={authStyles.label}>
                          Group
                        </label>
                        <input
                          type="text"
                          id="group"
                          name="group"
                          value={formData.group}
                          onChange={handleChange}
                          className={`${authStyles.input} ${errors.group ? authStyles.inputError : ''}`}
                          placeholder="Enter group"
                        />
                        {errors.group && (
                          <p className={authStyles.errorText}>{errors.group}</p>
                        )}
                      </div>

                      <div className={authStyles.formGroup}>
                        <label htmlFor="contactNumber" className={authStyles.label}>
                          Contact Number
                        </label>
                        <input
                          type="text"
                          id="contactNumber"
                          name="contactNumber"
                          value={formData.contactNumber}
                          onChange={handleChange}
                          className={`${authStyles.input} ${errors.contactNumber ? authStyles.inputError : ''}`}
                          placeholder="Enter 10-digit contact number"
                          maxLength="10"
                        />
                        {errors.contactNumber && (
                          <p className={authStyles.errorText}>{errors.contactNumber}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button - Full Width */}
          <div className="mt-8">
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
                  Registering...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </div>
        </form>

        {/* Login Link */}
        <div className={authStyles.linkContainer}>
          <p className="text-gray-600 text-sm">
            Already have an account?{' '}
            <Link to="/login" className={authStyles.link}>
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;