import { useState, useEffect } from 'react';
import { Camera, AlertCircle, CheckCircle2, ArrowLeft, Sparkles, MapPin, Wrench, Mail, Phone, Image, MessageSquare, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

const LOCATIONS = [
  'Lecture Room L101', 'Lecture Room L102', 'Lecture Room L201', 'Lecture Room N101',
  'Library 2nd Floor', 'Library Study Area',
  'Main Canteen', 'Engineering Canteen',
  'Block A Washroom (Gnd Floor)', 'Block A Washroom (1st Floor)',
  'Block B Washroom (Gnd Floor)', 'Block B Washroom (1st Floor)',
  'Main Corridor', 'Science Block Entrance'
];

const LOCATION_CATEGORIES: Record<string, string[]> = {
  'Lecture Room': ['A/C Too High', 'A/C Too Low', 'Screen Not Visible', 'Projector Issues', 'Flickering Lights', 'Chalk/Marker Shortage', 'Seating Damage'],
  'Library': ['Flickering Lights', 'A/C Too High', 'A/C Too Low', 'Broken Furniture', 'Cleanliness/Tidiness', 'Noise Issues'],
  'Canteen': ['Cleanliness/Tidiness', 'Leftover Food/Trash', 'Wet Floor', 'Water Leak', 'Food Quality', 'Pest Issues'],
  'Washroom': ['Wet Floor', 'Water Leak', 'Cleanliness/Tidiness', 'Broken Equipment', 'No Soap/Paper', 'Bad Odor'],
  'Corridor': ['Wet Floor', 'Flickering Lights', 'Cleanliness/Tidiness', 'Water Leak', 'Broken Equipment'],
  'Entrance': ['Wet Floor', 'Cleanliness/Tidiness', 'Flickering Lights', 'Broken Equipment']
};

const ALL_ISSUES = ['A/C Too High', 'A/C Too Low', 'Screen Not Visible', 'Projector Issues', 'Flickering Lights', 'Chalk/Marker Shortage', 'Seating Damage', 'Broken Furniture', 'Cleanliness/Tidiness', 'Leftover Food/Trash', 'Wet Floor', 'Water Leak', 'Food Quality', 'Pest Issues', 'No Soap/Paper', 'Bad Odor', 'Broken Equipment'];

export default function ReportIssue() {
  const [formData, setFormData] = useState({
    location: '',
    issueType: '',
    comment: '',
    email: '',
    phone: '',
    image: null as File | null
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [suggestedIssues, setSuggestedIssues] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [matchingReports, setMatchingReports] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorToastMessage, setErrorToastMessage] = useState('');

  const currentLocation = formData.location.trim();
  const currentIssueType = formData.issueType.trim();

  const getCategoryIssues = (location: string) => {
    const loc = location.toLowerCase();
    let matched: string[] = [];
    for (const [category, issues] of Object.entries(LOCATION_CATEGORIES)) {
      if (loc.includes(category.toLowerCase())) {
        matched = issues;
        break;
      }
    }
    if (matched.length === 0) matched = ALL_ISSUES.slice(0, 6);
    return matched;
  };

  useEffect(() => {
    if (currentLocation.length >= 3) {
      const issues = getCategoryIssues(currentLocation);
      setSuggestedIssues(issues);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [currentLocation]);

  useEffect(() => {
    const fetchMatchingReports = async () => {
      if (currentLocation && currentIssueType) {
        try {
          const res = await fetch(`http://localhost:3000/api/reports/count?location=${encodeURIComponent(currentLocation)}&issueType=${encodeURIComponent(currentIssueType)}`);
          if (res.ok) {
            const data = await res.json();
            setMatchingReports(data.count || 0);
          }
        } catch (err) {
          console.error(err);
        }
      } else {
        setMatchingReports(0);
      }
    };
    fetchMatchingReports();
  }, [currentLocation, currentIssueType]);

  const selectIssue = (issue: string) => {
    setFormData({ ...formData, issueType: issue });
    setShowSuggestions(false);
  };

  const isHygieneIssue = 
    currentIssueType.includes('cleanliness') || 
    currentIssueType.includes('leftover') ||
    currentIssueType.includes('wet floor') ||
    currentLocation.toLowerCase().includes('canteen') ||
    currentLocation.toLowerCase().includes('washroom');

  const handleImageChange = (file: File | null) => {
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageChange(file);
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, image: null });
    setImagePreview(null);
  };

  // ==================== VALIDATION FUNCTIONS ====================
  // - validate(): Form validation on submit
  // - Real-time validation handled in onChange for email & phone inputs

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    // ---- LOCATION VALIDATION (Required) ----
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    // ---- ISSUE TYPE VALIDATION (Required) ----
    if (!formData.issueType.trim()) {
      newErrors.issueType = 'Issue type is required';
    }

    // ---- EMAIL VALIDATION (on submit) ----
    if (formData.email && formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    
    // ---- PHONE VALIDATION - Sri Lankan format (on submit) ----
    // Accepts: 0712345678 or +94712345678
    if (formData.phone && formData.phone.trim() && !/^(07\d{8}|\+947\d{8})$/.test(formData.phone)) {
      newErrors.phone = 'Enter valid Sri Lankan phone (07XXXXXXXX or +947XXXXXXXX)';
    }

    // ---- IMAGE VALIDATION (hygiene issues require image) ----
    if (isHygieneIssue && !formData.image) {
      newErrors.image = 'An image is mandatory for hygiene/cleanliness related issues.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setStatus('submitting');
    const form = new FormData();
    form.append('location', formData.location);
    form.append('issueType', formData.issueType);
    form.append('comment', formData.comment);
    form.append('email', formData.email);
    form.append('phone', formData.phone);
    form.append('studentId', localStorage.getItem('studentId') || 'STU12345');
    if (formData.image && formData.image.size > 0) form.append('image', formData.image);

    try {
      const res = await fetch('http://localhost:3000/api/reports', {
        method: 'POST',
        body: form
      });
      if (res.ok) {
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
          window.location.href = '/reporting';
        }, 3000);
      } else {
        const err = await res.json();
        setErrorToastMessage(err.error || 'Failed to submit report');
        setShowErrorToast(true);
        setTimeout(() => setShowErrorToast(false), 4000);
        setStatus('idle');
      }
    } catch {
      setErrorToastMessage('Network error. Please try again.');
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 4000);
      setStatus('idle');
    }
  };

  const populateDummyData = () => {
    setFormData({
      location: 'Lecture Room L101',
      issueType: 'A/C Too High',
      comment: 'The air conditioning is set too cold. Please adjust the temperature.',
      email: 'john.doe@campus.edu',
      phone: '0712345678',
      image: new File([''], 'dummy-photo.jpg', { type: 'image/jpeg' })
    });
    setErrors({});
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-green-700 via-teal-800 to-blue-900">
      {/* Subtle overlay */}
      <div className="absolute inset-0 bg-black/20"></div>
      
      {/* Glow Effects */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-green-400 opacity-20 blur-3xl rounded-full animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400 opacity-20 blur-3xl rounded-full animate-pulse delay-2000"></div>
      
      <div className="relative z-10 py-10 px-6 max-w-2xl mx-auto animate-fadeIn">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Report Issue</h1>
            <p className="text-white/70 mt-1">Help us fix campus issues faster</p>
          </div>
          <button 
            type="button" 
            onClick={populateDummyData}
            className="text-sm bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white/30 text-white transition border border-white/20"
          >
            Demo Data
          </button>
        </div>

        {/* Toast Notification */}
        {showToast && (
          <div className="fixed top-6 right-6 z-50 animate-slideIn">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[320px]">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle2 size={24} />
              </div>
              <div className="flex-1">
                <p className="font-semibold">Issue reported successfully!</p>
                <p className="text-white/80 text-sm">Redirecting to dashboard...</p>
              </div>
              <button 
                onClick={() => setShowToast(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Error Toast Notification */}
        {showErrorToast && (
          <div className="fixed top-6 right-6 z-50 animate-slideIn">
            <div className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[320px]">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle size={24} />
              </div>
              <div className="flex-1">
                <p className="font-semibold">Error</p>
                <p className="text-white/80 text-sm">{errorToastMessage}</p>
              </div>
              <button 
                onClick={() => setShowErrorToast(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 space-y-8">

          {/* Info Banner */}
          <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-200/50 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Sparkles className="text-blue-600" size={20} />
              </div>
              <p className="font-semibold text-gray-800">Before you report</p>
            </div>
            <ul className="space-y-2 ml-13">
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                Image is required for washroom & canteen issues
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                Duplicate reports are automatically merged
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                Issues reported 5+ times will be auto-escalated
              </li>
            </ul>
          </div>

          {/* Errors */}
          {Object.keys(errors).length > 0 && (
            <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 text-red-800 p-5 rounded-2xl shadow-sm">
              <div className="flex items-center gap-2 font-semibold mb-3 text-red-700">
                <AlertCircle size={20} />
                Please fix the following errors:
              </div>
              <ul className="space-y-2">
                {errors.location && (
                  <li className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    {errors.location}
                  </li>
                )}
                {errors.issueType && (
                  <li className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    {errors.issueType}
                  </li>
                )}
                {errors.image && (
                  <li className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    {errors.image}
                  </li>
                )}
                {errors.email && (
                  <li className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    {errors.email}
                  </li>
                )}
                {errors.phone && (
                  <li className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    {errors.phone}
                  </li>
                )}
              </ul>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Location */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${errors.location ? 'bg-red-100' : 'bg-green-100'}`}>
                  {errors.location ? (
                    <AlertCircle className="text-red-600" size={16} />
                  ) : (
                    <MapPin className="text-green-600" size={16} />
                  )}
                </div>
                Location <span className="text-red-500">*</span>
              </label>
              <input
                list="location-options"
                placeholder="Start typing location..."
                className={`w-full border-2 rounded-xl px-4 py-4 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-gray-700 placeholder-gray-400 ${
                  errors.location ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                value={formData.location}
                onChange={e => {
                  setFormData({...formData, location: e.target.value});
                  if (errors.location) setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.location;
                    return newErrors;
                  });
                }}
              />
              <datalist id="location-options">
                {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
              </datalist>
              {errors.location && <p className="text-red-500 text-sm flex items-center gap-1"><AlertCircle size={14}/>{errors.location}</p>}
            </div>

            {/* Issue Type */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${errors.issueType ? 'bg-red-100' : 'bg-green-100'}`}>
                  {errors.issueType ? (
                    <AlertCircle className="text-red-600" size={16} />
                  ) : (
                    <Wrench className="text-green-600" size={16} />
                  )}
                </div>
                Issue Type <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder={currentLocation ? 'Select or type issue type...' : 'Select a location first...'}
                  className={`w-full border-2 rounded-xl px-4 py-4 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-gray-700 placeholder-gray-400 ${
                    errors.issueType ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  value={formData.issueType}
                  onChange={e => {
                    setFormData({...formData, issueType: e.target.value});
                    if (errors.issueType) setErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.issueType;
                      return newErrors;
                    });
                  }}
                  disabled={!currentLocation}
                />
                {showSuggestions && suggestedIssues.length > 0 && (
                  <div className="absolute z-20 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3 flex items-center gap-2 text-green-700 text-xs font-medium border-b border-green-100">
                      <Sparkles size={14} />
                      {currentLocation ? `Suggested for ${currentLocation}` : 'Select a location'}
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {suggestedIssues.map((issue) => (
                        <button
                          key={issue}
                          type="button"
                          onClick={() => selectIssue(issue)}
                          className="w-full px-4 py-3 text-left hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 text-gray-700 transition-colors border-b border-gray-50 last:border-0"
                        >
                          {issue}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {errors.issueType && <p className="text-red-500 text-sm flex items-center gap-1"><AlertCircle size={14}/>{errors.issueType}</p>}
              {currentLocation && currentIssueType && matchingReports > 0 && (
                <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-4 py-2 rounded-lg">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  {matchingReports} student{matchingReports > 1 ? 's' : ''} already reported this issue
                </div>
              )}
            </div>

            {/* Contact Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Mail className="text-purple-600" size={16} />
                  </div>
                  Email <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input 
                  type="email"
                  placeholder="student@domain.edu"
                  className={`w-full border-2 rounded-xl px-4 py-4 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-gray-700 placeholder-gray-400 ${
                    errors.email ? 'border-red-400' : 
                    formData.email ? 'border-green-400' : 
                    'border-gray-200 hover:border-gray-300'
                  }`}
                  value={formData.email}
                  onChange={e => {
                    const value = e.target.value;
                    setFormData({...formData, email: value});
                    
                    // ---- REAL-TIME EMAIL VALIDATION ----
                    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                      setErrors(prev => ({ ...prev, email: 'Invalid email format' }));
                    } else {
                      setErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.email;
                        return newErrors;
                      });
                    }
                  }}
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
              </div>
              
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Phone className="text-purple-600" size={16} />
                  </div>
                  Phone <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input 
                  type="tel"
                  placeholder="0712345678 or +94712345678"
                  className={`w-full border-2 rounded-xl px-4 py-4 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-gray-700 placeholder-gray-400 ${
                    errors.phone ? 'border-red-400' : 
                    formData.phone ? 'border-green-400' : 
                    'border-gray-200 hover:border-gray-300'
                  }`}
                  value={formData.phone}
                  onChange={e => {
                    const value = e.target.value;
                    setFormData({...formData, phone: value});
                    
                    // ---- REAL-TIME PHONE VALIDATION (Sri Lankan) ----
                    if (value && !/^(07\d{8}|\+947\d{8})$/.test(value)) {
                      setErrors(prev => ({ ...prev, phone: 'Invalid phone number' }));
                    } else {
                      setErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.phone;
                        return newErrors;
                      });
                    }
                  }}
                />
                {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
              </div>
            </div>

            {/* Photo Upload */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center">
                  <Image className="text-rose-600" size={16} />
                </div>
                Upload Photo 
                {isHygieneIssue ? <span className="text-red-500">*</span> : <span className="text-gray-400 font-normal">(Optional)</span>}
              </label>
              <div 
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                  errors.image ? 'border-red-400 bg-red-50' : 
                  isDragging ? 'border-green-400 bg-green-50 scale-[1.02]' : 
                  'border-gray-300 hover:border-green-400 hover:bg-green-50/50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input 
                  type="file" 
                  accept="image/*"
                  id="image-upload"
                  className="hidden"
                  onChange={e => handleImageChange(e.target.files?.[0] || null)}
                />
                
                {imagePreview ? (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-56 object-cover rounded-xl shadow-lg"
                    />
                    <div className="absolute top-3 right-3 flex gap-2">
                      <label 
                        htmlFor="image-upload"
                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-gray-50 transition-all hover:scale-110"
                      >
                        <span className="text-gray-600">✎</span>
                      </label>
                      <button 
                        type="button"
                        onClick={removeImage}
                        className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-all hover:scale-110"
                      >
                        <span className="text-white font-bold">×</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <label htmlFor="image-upload" className="cursor-pointer block">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-colors ${isDragging ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <Camera size={32} className={`${isDragging ? 'text-green-500' : 'text-gray-400'}`} />
                    </div>
                    <p className="text-gray-700 font-medium">Drag & drop your photo here</p>
                    <p className="text-xs text-gray-400 mt-2">or click to browse • JPG, PNG up to 5MB</p>
                  </label>
                )}
              </div>
              {errors.image && <p className="text-red-500 text-sm flex items-center gap-1"><AlertCircle size={14}/>{errors.image}</p>}
            </div>

            {/* Comments */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="text-amber-600" size={16} />
                </div>
                Comments <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <textarea 
                rows={4}
                placeholder="Provide any additional details about the issue..."
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all resize-none text-gray-700 placeholder-gray-400 hover:border-gray-300"
                value={formData.comment}
                onChange={e => setFormData({...formData, comment: e.target.value})}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <Link 
                to="/reporting"
                className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-4 rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-95"
              >
                <ArrowLeft size={20} />
                Back
              </Link>
              <button 
                type="submit" 
                disabled={status === 'submitting'}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-4 rounded-xl font-semibold shadow-lg shadow-green-500/30 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
              >
                {status === 'submitting' ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Submit Report
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
