import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { getUser, logout } from '../../utils/auth';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('personal'); // 'personal', 'security', 'notifications', 'system'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Get logged-in user data
  const loggedInUser = getUser();
  
  // Personal details state - initialized with logged-in user data
  const [personalDetails, setPersonalDetails] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    faculty: '',
    department: '',
    bio: '',
    avatar: ''
  });

  // Security settings state
  const [securitySettings, setSecuritySettings] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false
  });

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    bookingReminders: true,
    systemUpdates: false
  });

  // System settings state
  const [systemSettings, setSystemSettings] = useState({
    language: 'english',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    theme: 'light',
    autoLogout: '30'
  });

  // Generate user avatar from name if not provided
  const getUserAvatar = (name) => {
    if (personalDetails.avatar && personalDetails.avatar !== '👤') {
      return personalDetails.avatar;
    }
    // Get first letter of name, uppercase
    return name ? name.charAt(0).toUpperCase() : '👤';
  };

  // Handle logout
  const handleLogout = () => {
    logout();
  };

  useEffect(() => {
    // Initialize personal details with logged-in user data
    const initializeUserData = () => {
      try {
        // Use logged-in user data from localStorage
        const userData = {
          name: loggedInUser?.name || '',
          email: loggedInUser?.email || '',
          phone: loggedInUser?.phone || '',
          role: loggedInUser?.role || '',
          faculty: loggedInUser?.faculty || '',
          department: loggedInUser?.department || '',
          bio: loggedInUser?.bio || 'System administrator with 5+ years of experience in educational technology.',
          avatar: loggedInUser?.avatar || '👤'
        };

        setPersonalDetails(userData);
        
        // Load user preferences if they exist
        if (loggedInUser?.notificationSettings) {
          setNotificationSettings(loggedInUser.notificationSettings);
        }
        
        if (loggedInUser?.systemSettings) {
          setSystemSettings(loggedInUser.systemSettings);
        }
        
        if (loggedInUser?.twoFactorEnabled !== undefined) {
          setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: loggedInUser.twoFactorEnabled }));
        }
        
        // Simulate fetching additional user preferences
        setTimeout(() => {
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Failed to initialize user data:', error);
        setLoading(false);
      }
    };

    initializeUserData();
  }, [loggedInUser]);

  const handlePersonalDetailsSave = async () => {
    setSaving(true);
    try {
      // Update localStorage with new personal details
      const currentUser = getUser();
      const updatedUser = {
        ...currentUser,
        ...personalDetails
      };
      
      // Save to localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Simulate API call to update backend
      try {
        const response = await api.put('/api/users/profile', personalDetails);
        console.log('Profile updated successfully:', response.data);
      } catch (apiError) {
        console.warn('API update failed, but localStorage updated:', apiError);
      }
      
      setSuccessMessage('Personal details updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to save personal details:', error);
      setSuccessMessage('Failed to save changes. Please try again.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleSecuritySave = async () => {
    if (securitySettings.newPassword !== securitySettings.confirmPassword) {
      setSuccessMessage('New passwords do not match!');
      setTimeout(() => setSuccessMessage(''), 3000);
      return;
    }
    
    setSaving(true);
    try {
      // Prepare security data for API
      const securityData = {
        currentPassword: securitySettings.currentPassword,
        newPassword: securitySettings.newPassword,
        twoFactorEnabled: securitySettings.twoFactorEnabled
      };
      
      // Call API to update password
      try {
        const response = await api.put('/api/users/security', securityData);
        console.log('Security settings updated successfully:', response.data);
        
        setSuccessMessage('Security settings updated successfully!');
        // Clear password fields after successful update
        setSecuritySettings({
          ...securitySettings,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } catch (apiError) {
        console.error('API security update failed:', apiError);
        setSuccessMessage('Failed to update security settings. Please check your current password.');
      }
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to save security settings:', error);
      setSuccessMessage('Failed to save changes. Please try again.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationSave = async () => {
    setSaving(true);
    try {
      // Update localStorage with notification preferences
      const currentUser = getUser();
      const updatedUser = {
        ...currentUser,
        notificationSettings
      };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Simulate API call to update notification preferences
      try {
        const response = await api.put('/api/users/notifications', notificationSettings);
        console.log('Notification preferences updated successfully:', response.data);
      } catch (apiError) {
        console.warn('API notification update failed, but localStorage updated:', apiError);
      }
      
      setSuccessMessage('Notification preferences updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to save notification settings:', error);
      setSuccessMessage('Failed to save changes. Please try again.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleSystemSave = async () => {
    setSaving(true);
    try {
      // Update localStorage with system preferences
      const currentUser = getUser();
      const updatedUser = {
        ...currentUser,
        systemSettings
      };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Simulate API call to update system preferences
      try {
        const response = await api.put('/api/users/system-settings', systemSettings);
        console.log('System settings updated successfully:', response.data);
      } catch (apiError) {
        console.warn('API system settings update failed, but localStorage updated:', apiError);
      }
      
      setSuccessMessage('System settings updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to save system settings:', error);
      setSuccessMessage('Failed to save changes. Please try again.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)',
        fontFamily: 'Inter, system-ui, sans-serif',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading settings...</p>
        </div>
        <style jsx>{`
          .loading-container {
            text-align: center;
            animation: fadeInUp 0.8s ease-out;
          }
          
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-top: 4px solid #ffffff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
          }
          
          .loading-text {
            color: white;
            font-size: 18px;
            font-weight: 600;
            animation: pulse 2s ease-in-out infinite;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)',
      fontFamily: 'Inter, system-ui, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background Elements */}
      <div className="bg-animation">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        <div className="floating-shape shape-4"></div>
        <div className="floating-shape shape-5"></div>
      </div>

      {/* Main Container */}
      <div className="settings-container">
        {/* Header */}
        <div className="settings-header">
          <div className="header-content">
            <div className="header-icon">⚙️</div>
            <div className="header-text">
              <h1>Settings</h1>
              <p>Manage your account settings and preferences</p>
            </div>
          </div>
          <div className="header-decoration"></div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="success-message">
            <div className="success-icon">✅</div>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Settings Layout */}
        <div className="settings-layout">
          {/* Sidebar Navigation */}
          <div className="settings-sidebar">
            <div className="sidebar-header">
              <div className="user-avatar">
                <div className="avatar-circle">
                  {getUserAvatar(personalDetails.name)}
                </div>
                <div className="user-info">
                  <h3>{personalDetails.name}</h3>
                  <p>{personalDetails.role}</p>
                  <button 
                    className="logout-btn"
                    onClick={handleLogout}
                    title="Logout"
                  >
                    🚪 Logout
                  </button>
                </div>
              </div>
            </div>
            
            <nav className="sidebar-nav">
              <button 
                className={`nav-item ${activeTab === 'personal' ? 'active' : ''}`}
                onClick={() => setActiveTab('personal')}
              >
                <span className="nav-icon">👤</span>
                <span>Personal Details</span>
              </button>
              
              <button 
                className={`nav-item ${activeTab === 'security' ? 'active' : ''}`}
                onClick={() => setActiveTab('security')}
              >
                <span className="nav-icon">🔒</span>
                <span>Security</span>
              </button>
              
              <button 
                className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
                onClick={() => setActiveTab('notifications')}
              >
                <span className="nav-icon">🔔</span>
                <span>Notifications</span>
              </button>
              
              <button 
                className={`nav-item ${activeTab === 'system' ? 'active' : ''}`}
                onClick={() => setActiveTab('system')}
              >
                <span className="nav-icon">🖥️</span>
                <span>System</span>
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="settings-content">
            {/* Personal Details Tab */}
            {activeTab === 'personal' && (
              <div className="tab-content" style={{ animationDelay: '0.2s' }}>
                <div className="tab-header">
                  <h2>Personal Details</h2>
                  <p>Update your personal information</p>
                </div>
                
                <div className="form-grid">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={personalDetails.name}
                      onChange={(e) => setPersonalDetails({...personalDetails, name: e.target.value})}
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={personalDetails.email}
                      onChange={(e) => setPersonalDetails({...personalDetails, email: e.target.value})}
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      value={personalDetails.phone}
                      onChange={(e) => setPersonalDetails({...personalDetails, phone: e.target.value})}
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Role</label>
                    <input
                      type="text"
                      value={personalDetails.role}
                      disabled
                      className="form-input disabled"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Faculty</label>
                    <input
                      type="text"
                      value={personalDetails.faculty}
                      onChange={(e) => setPersonalDetails({...personalDetails, faculty: e.target.value})}
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Department</label>
                    <input
                      type="text"
                      value={personalDetails.department}
                      onChange={(e) => setPersonalDetails({...personalDetails, department: e.target.value})}
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group full-width">
                    <label>Bio</label>
                    <textarea
                      value={personalDetails.bio}
                      onChange={(e) => setPersonalDetails({...personalDetails, bio: e.target.value})}
                      className="form-textarea"
                      rows="4"
                    />
                  </div>
                </div>
                
                <div className="form-actions">
                  <button 
                    className="save-btn"
                    onClick={handlePersonalDetailsSave}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <div className="btn-spinner"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <span className="save-icon">💾</span>
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="tab-content" style={{ animationDelay: '0.2s' }}>
                <div className="tab-header">
                  <h2>Security Settings</h2>
                  <p>Manage your password and security preferences</p>
                </div>
                
                <div className="form-section">
                  <h3>Change Password</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Current Password</label>
                      <input
                        type="password"
                        value={securitySettings.currentPassword}
                        onChange={(e) => setSecuritySettings({...securitySettings, currentPassword: e.target.value})}
                        className="form-input"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>New Password</label>
                      <input
                        type="password"
                        value={securitySettings.newPassword}
                        onChange={(e) => setSecuritySettings({...securitySettings, newPassword: e.target.value})}
                        className="form-input"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Confirm New Password</label>
                      <input
                        type="password"
                        value={securitySettings.confirmPassword}
                        onChange={(e) => setSecuritySettings({...securitySettings, confirmPassword: e.target.value})}
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="form-section">
                  <h3>Two-Factor Authentication</h3>
                  <div className="toggle-group">
                    <label className="toggle-label">
                      <input
                        type="checkbox"
                        checked={securitySettings.twoFactorEnabled}
                        onChange={(e) => setSecuritySettings({...securitySettings, twoFactorEnabled: e.target.checked})}
                        className="toggle-input"
                      />
                      <span className="toggle-slider"></span>
                      <span className="toggle-text">Enable two-factor authentication</span>
                    </label>
                  </div>
                </div>
                
                <div className="form-actions">
                  <button 
                    className="save-btn"
                    onClick={handleSecuritySave}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <div className="btn-spinner"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <span className="save-icon">🔒</span>
                        Update Security
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="tab-content" style={{ animationDelay: '0.2s' }}>
                <div className="tab-header">
                  <h2>Notification Preferences</h2>
                  <p>Choose how you want to receive notifications</p>
                </div>
                
                <div className="form-section">
                  <h3>Notification Channels</h3>
                  <div className="toggle-group">
                    <label className="toggle-label">
                      <input
                        type="checkbox"
                        checked={notificationSettings.emailNotifications}
                        onChange={(e) => setNotificationSettings({...notificationSettings, emailNotifications: e.target.checked})}
                        className="toggle-input"
                      />
                      <span className="toggle-slider"></span>
                      <span className="toggle-text">Email Notifications</span>
                    </label>
                    
                    <label className="toggle-label">
                      <input
                        type="checkbox"
                        checked={notificationSettings.smsNotifications}
                        onChange={(e) => setNotificationSettings({...notificationSettings, smsNotifications: e.target.checked})}
                        className="toggle-input"
                      />
                      <span className="toggle-slider"></span>
                      <span className="toggle-text">SMS Notifications</span>
                    </label>
                    
                    <label className="toggle-label">
                      <input
                        type="checkbox"
                        checked={notificationSettings.pushNotifications}
                        onChange={(e) => setNotificationSettings({...notificationSettings, pushNotifications: e.target.checked})}
                        className="toggle-input"
                      />
                      <span className="toggle-slider"></span>
                      <span className="toggle-text">Push Notifications</span>
                    </label>
                  </div>
                </div>
                
                <div className="form-section">
                  <h3>Notification Types</h3>
                  <div className="toggle-group">
                    <label className="toggle-label">
                      <input
                        type="checkbox"
                        checked={notificationSettings.bookingReminders}
                        onChange={(e) => setNotificationSettings({...notificationSettings, bookingReminders: e.target.checked})}
                        className="toggle-input"
                      />
                      <span className="toggle-slider"></span>
                      <span className="toggle-text">Booking Reminders</span>
                    </label>
                    
                    <label className="toggle-label">
                      <input
                        type="checkbox"
                        checked={notificationSettings.systemUpdates}
                        onChange={(e) => setNotificationSettings({...notificationSettings, systemUpdates: e.target.checked})}
                        className="toggle-input"
                      />
                      <span className="toggle-slider"></span>
                      <span className="toggle-text">System Updates</span>
                    </label>
                  </div>
                </div>
                
                <div className="form-actions">
                  <button 
                    className="save-btn"
                    onClick={handleNotificationSave}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <div className="btn-spinner"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <span className="save-icon">🔔</span>
                        Save Preferences
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* System Tab */}
            {activeTab === 'system' && (
              <div className="tab-content" style={{ animationDelay: '0.2s' }}>
                <div className="tab-header">
                  <h2>System Settings</h2>
                  <p>Configure your system preferences</p>
                </div>
                
                <div className="form-section">
                  <h3>Display Settings</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Language</label>
                      <select
                        value={systemSettings.language}
                        onChange={(e) => setSystemSettings({...systemSettings, language: e.target.value})}
                        className="form-select"
                      >
                        <option value="english">English</option>
                        <option value="spanish">Spanish</option>
                        <option value="french">French</option>
                        <option value="german">German</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label>Timezone</label>
                      <select
                        value={systemSettings.timezone}
                        onChange={(e) => setSystemSettings({...systemSettings, timezone: e.target.value})}
                        className="form-select"
                      >
                        <option value="UTC">UTC</option>
                        <option value="EST">Eastern Time</option>
                        <option value="PST">Pacific Time</option>
                        <option value="GMT">GMT</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label>Date Format</label>
                      <select
                        value={systemSettings.dateFormat}
                        onChange={(e) => setSystemSettings({...systemSettings, dateFormat: e.target.value})}
                        className="form-select"
                      >
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label>Auto Logout (minutes)</label>
                      <select
                        value={systemSettings.autoLogout}
                        onChange={(e) => setSystemSettings({...systemSettings, autoLogout: e.target.value})}
                        className="form-select"
                      >
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="60">1 hour</option>
                        <option value="120">2 hours</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="form-actions">
                  <button 
                    className="save-btn"
                    onClick={handleSystemSave}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <div className="btn-spinner"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <span className="save-icon">🖥️</span>
                        Save Settings
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modern Styles */}
      <style jsx>{`
        /* Background Animations */
        .bg-animation {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          overflow: hidden;
          z-index: 0;
        }

        .floating-shape {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          animation: float 20s infinite ease-in-out;
        }

        .shape-1 {
          width: 80px;
          height: 80px;
          top: 10%;
          left: 10%;
          animation-delay: 0s;
        }

        .shape-2 {
          width: 60px;
          height: 60px;
          top: 70%;
          left: 80%;
          animation-delay: 2s;
        }

        .shape-3 {
          width: 100px;
          height: 100px;
          top: 40%;
          left: 60%;
          animation-delay: 4s;
        }

        .shape-4 {
          width: 40px;
          height: 40px;
          top: 20%;
          left: 70%;
          animation-delay: 6s;
        }

        .shape-5 {
          width: 70px;
          height: 70px;
          top: 80%;
          left: 20%;
          animation-delay: 8s;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg) scale(1);
          }
          25% {
            transform: translateY(-30px) rotate(90deg) scale(1.1);
          }
          50% {
            transform: translateY(0) rotate(180deg) scale(0.9);
          }
          75% {
            transform: translateY(30px) rotate(270deg) scale(1.05);
          }
        }

        /* Main Container */
        .settings-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
          position: relative;
          z-index: 1;
          animation: slideInUp 0.8s ease-out;
        }

        
        /* Header */
        .settings-header {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 30px;
          margin-bottom: 30px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          position: relative;
          overflow: hidden;
          animation: slideInDown 0.6s ease-out;
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .header-icon {
          font-size: 48px;
          animation: bounce 2s infinite;
        }

        .header-text h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
          background: linear-gradient(135deg, #064e3b 0%, #022c22 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          color: transparent;
        }

        .header-text p {
          margin: 5px 0 0 0;
          color: #6b7280;
          font-size: 14px;
        }

        .header-decoration {
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(45deg, #064e3b, #022c22, #064e3b);
          border-radius: 20px;
          z-index: -1;
          animation: shimmer 3s infinite;
        }

        /* Success Message */
        .success-message {
          background: rgba(16, 185, 129, 0.95);
          color: white;
          padding: 15px 20px;
          border-radius: 10px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
          animation: slideInDown 0.5s ease-out;
        }

        .success-icon {
          font-size: 20px;
        }

        /* Settings Layout */
        .settings-layout {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 30px;
          animation: fadeInUp 0.8s ease-out;
        }

        /* Sidebar */
        .settings-sidebar {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 25px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          height: fit-content;
          position: sticky;
          top: 20px;
        }

        .sidebar-header {
          margin-bottom: 30px;
        }

        .user-avatar {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .avatar-circle {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: linear-gradient(135deg, #064e3b 0%, #022c22 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .user-info h3 {
          margin: 0 0 5px 0;
          font-size: 16px;
          font-weight: 700;
          color: #1a202c;
        }

        .user-info p {
          margin: 0;
          font-size: 12px;
          color: #6b7280;
        }

        .logout-btn {
          margin-top: 8px;
          padding: 6px 12px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 6px;
          color: #ef4444;
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.2);
          border-color: rgba(239, 68, 68, 0.5);
          transform: translateY(-1px);
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 15px;
          border: none;
          background: transparent;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 14px;
          font-weight: 500;
          color: #6b7280;
        }

        .nav-item:hover {
          background: rgba(30, 64, 175, 0.1);
          color: #064e3b;
          transform: translateX(5px);
        }

        .nav-item.active {
          background: rgba(4, 120, 87, 0.15);
          color: #064e3b;
          font-weight: 600;
        }

        .nav-icon {
          font-size: 18px;
        }

        /* Main Content */
        .settings-content {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 30px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .tab-content {
          animation: slideInRight 0.6s ease-out;
          animation-fill-mode: both;
        }

        .tab-header {
          margin-bottom: 30px;
        }

        .tab-header h2 {
          margin: 0 0 5px 0;
          font-size: 24px;
          font-weight: 700;
          color: #064e3b;
        }

        .tab-header p {
          margin: 0;
          font-size: 14px;
          color: #6b7280;
        }

        /* Form Styles */
        .form-section {
          margin-bottom: 30px;
        }

        .form-section h3 {
          margin: 0 0 20px 0;
          font-size: 18px;
          font-weight: 600;
          color: #1a202c;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-group label {
          margin-bottom: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }

        .form-input,
        .form-select,
        .form-textarea {
          padding: 12px 15px;
          border: 2px solid rgba(30, 64, 175, 0.2);
          border-radius: 10px;
          font-size: 14px;
          background: rgba(255, 255, 255, 0.8);
          color: #1a202c;
          transition: all 0.3s ease;
        }

        .form-input:focus,
        .form-select:focus,
        .form-textarea:focus {
          outline: none;
          border-color: #064e3b;
          box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.1);
          transform: translateY(-1px);
        }

        .form-input.disabled {
          background: rgba(156, 163, 175, 0.1);
          cursor: not-allowed;
        }

        .form-textarea {
          resize: vertical;
          min-height: 100px;
        }

        /* Toggle Switches */
        .toggle-group {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .toggle-label {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          font-size: 14px;
          color: #374151;
        }

        .toggle-input {
          display: none;
        }

        .toggle-slider {
          width: 44px;
          height: 24px;
          background: #d1d5db;
          border-radius: 12px;
          position: relative;
          transition: all 0.3s ease;
        }

        .toggle-slider::before {
          content: '';
          position: absolute;
          top: 2px;
          left: 2px;
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          transition: all 0.3s ease;
        }

        .toggle-input:checked + .toggle-slider {
          background: #064e3b;
        }

        .toggle-input:checked + .toggle-slider::before {
          transform: translateX(20px);
        }

        /* Form Actions */
        .form-actions {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid rgba(30, 64, 175, 0.2);
        }

        .save-btn {
          background: linear-gradient(135deg, #064e3b 0%, #022c22 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .save-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(30, 64, 175, 0.3);
        }

        .save-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .btn-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .save-icon {
          font-size: 16px;
        }

        /* Animations */
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0) scale(1);
          }
          40% {
            transform: translateY(-15px) scale(1.1);
          }
          60% {
            transform: translateY(-7px) scale(1.05);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%) rotate(0deg);
          }
          50% {
            transform: translateX(0%) rotate(180deg);
          }
          100% {
            transform: translateX(100%) rotate(360deg);
          }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .settings-layout {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .settings-sidebar {
            position: static;
          }

          .sidebar-nav {
            flex-direction: row;
            flex-wrap: wrap;
            gap: 10px;
          }

          .nav-item {
            flex: 1;
            min-width: 120px;
            justify-content: center;
          }
        }

        @media (max-width: 768px) {
          .settings-container {
            padding: 15px;
          }

          .header-content {
            flex-direction: column;
            text-align: center;
            gap: 15px;
          }

          .form-grid {
            grid-template-columns: 1fr;
            gap: 15px;
          }

          .settings-content {
            padding: 20px;
          }

          .settings-sidebar {
            padding: 20px;
          }

          .nav-item {
            font-size: 12px;
            padding: 10px 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default Settings;
